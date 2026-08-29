# Plan: TeamOps — Multi-tenant Operations Platform

## Context

- **Goal:** Side project luyện middle-level full-stack với Vue 3 + NestJS + PHP Laravel.
- **Stack:**
  - Frontend: Vue 3 + TypeScript + Vite + Pinia + Vue Router + TanStack Query + Zod
  - Core Service: NestJS + Prisma + PostgreSQL + BullMQ + Redis + Socket.IO
  - Admin Service: Laravel + Horizon + PostgreSQL + Redis
  - Storage: Supabase Storage
  - Testing: Vitest (unit) + Playwright (E2E)
  - Infra: Docker Compose + GitHub Actions
- **Pattern:** Microservices — NestJS xử lý core API/realtime, Laravel xử lý admin/reporting.
- **Target domain:** Studio dịch vụ / agency (booking, customer, task, invoice, incident).

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Vue 3 Frontend                │
│     (Vite dev proxy → core:3000, admin:8000)    │
└──────────────┬──────────────────┬───────────────┘
               │                  │
    ┌──────────▼──────────┐  ┌───▼──────────────┐
    │  Core Service       │  │  Admin Service    │
    │  (NestJS :3000)     │  │  (Laravel :8000)  │
    │                     │  │                   │
    │  - Auth/JWT         │  │  - Dashboard      │
    │  - Customer CRUD    │  │  - Reports        │
    │  - Booking          │  │  - Invoice PDF    │
    │  - Workflow/Task    │  │  - Bulk import    │
    │  - Incident         │  │  - Cron jobs      │
    │  - Notification     │  │  - Audit log view │
    │  - WebSocket (WS)   │  │                   │
    │  - File upload      │  │                   │
    │                     │  │                   │
    │  Queue: BullMQ      │  │  Queue: Horizon   │
    └──────────┬──────────┘  └───┬──────────────┘
               │                  │
               └────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │    PostgreSQL     │
              │    Redis          │
              │    Supabase       │
              └───────────────────┘
```

## Tech Stack Decisions

| Component | Choice | Lý do |
|---|---|---|
| Frontend framework | Vue 3 + Composition API | Reactive, TypeScript-native, ecosystem tốt |
| State management | Pinia (global) + TanStack Query (server state) | Tách biệt client state vs server cache |
| Form validation | Zod | Type-safe, share schema giữa FE/BE |
| Backend framework | NestJS | Module/DI architecture, decorator-based, luyện OOP pattern |
| ORM | Prisma | Type-safe client, migration tool tốt, phổ biến |
| Queue (NestJS) | **BullMQ** | Built trên Redis, hỗ trợ delayed/repeatable/priority/rate-limit |
| Queue (Laravel) | **Laravel Queue + Horizon** | Abstract driver, Horizon dashboard miễn phí |
| Realtime | Socket.IO (NestJS gateway) | Room-based, auth middleware, fallback polling |
| Admin framework | Laravel + Sanctum | CRUD nhanh, Blade/Vue hybrid, queue/cron built-in |
| File storage | Supabase Storage | S3-compatible, free tier, signed URL |
| Database | PostgreSQL 16 | JSONB, partial index, CTE, window functions |
| Cache/Queue broker | Redis 7 | Shared giữa NestJS (BullMQ) và Laravel (Queue) |
| Testing | Vitest + Playwright | Nhanh, TypeScript-native |
| Containerization | Docker Compose | Local dev一致, dễ demo |

## Queue Architecture

```
┌─────────────┐     ┌─────────────┐
│  NestJS     │     │  Laravel    │
│  Core API   │     │  Admin      │
└──────┬──────┘     └──────┬──────┘
       │                   │
       ▼                   ▼
┌──────────────────────────────────┐
│          Redis (shared)          │
│  db=0: BullMQ queues            │
│  db=1: Laravel queues           │
│                                  │
│  BullMQ (NestJS):                │
│  ├── email-confirmation          │
│  ├── booking-reminder (delayed)  │
│  ├── notification-dispatch       │
│  └── cleanup-expired             │
│                                  │
│  Laravel Queue:                  │
│  ├── report-export               │
│  ├── invoice-generate (PDF)      │
│  ├── bulk-import                 │
│  └── daily-stats                 │
└──────────────────────────────────┘
```

**BullMQ features sẽ dùng:**
- `delay` — nhắc lịch trước 24h
- `attempts + backoff` — retry email khi fail (exponential backoff)
- `repeat` — cron job cleanup expired bookings
- `rateLimiter` — giới hạn số email gửi/giây
- `priority` — notification ưu tiên cao gửi trước
- Idempotency key — ngăn duplicate khi retry

## Database Schema (shared PostgreSQL)

### Core tables (NestJS owns — read/write)

```sql
-- Organizations (multi-tenant root)
organizations (
  id UUID PK DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Users
users (
  id UUID PK DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Organization membership + role
members (
  id UUID PK DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner','admin','staff')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id)
)

-- Customers
customers (
  id UUID PK DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Services offered
services (
  id UUID PK DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_min INT NOT NULL DEFAULT 60,
  price_cents INT NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Staff availability (weekly recurring)
availability (
  id UUID PK DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CHECK (start_time < end_time)
)

-- Bookings
bookings (
  id UUID PK DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  service_id UUID REFERENCES services(id),
  staff_id UUID REFERENCES users(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (start_at < end_at)
)

-- Tasks / Workflow items
tasks (
  id UUID PK DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo','in_progress','review','done','cancelled')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low','medium','high','urgent')),
  assignee_id UUID REFERENCES users(id),
  customer_id UUID REFERENCES customers(id),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Incidents
incidents (
  id UUID PK DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(10) NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low','medium','high','critical')),
  status VARCHAR(20) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','investigating','resolved','closed')),
  assignee_id UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Incident timeline (append-only)
incident_events (
  id UUID PK DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Invoices
invoices (
  id UUID PK DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  booking_id UUID REFERENCES bookings(id),
  amount_cents INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','sent','paid','overdue','cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
)

-- Invoice line items
invoice_items (
  id UUID PK DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price_cents INT NOT NULL DEFAULT 0
)

-- Notifications
notifications (
  id UUID PK DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  read_at TIMESTAMPTZ,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Audit log (append-only)
audit_logs (
  id UUID PK DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Attachments
attachments (
  id UUID PK DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  size_bytes INT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Idempotency keys (chống duplicate job/email)
idempotency_keys (
  key VARCHAR(255) PRIMARY KEY,
  entity_type VARCHAR(50),
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

### Indexes

```sql
-- Multi-tenant lookups
CREATE INDEX idx_members_org ON members(org_id);
CREATE INDEX idx_customers_org ON customers(org_id);
CREATE INDEX idx_services_org ON services(org_id);
CREATE INDEX idx_tasks_org_status ON tasks(org_id, status);
CREATE INDEX idx_incidents_org_status ON incidents(org_id, status);
CREATE INDEX idx_audit_logs_org_time ON audit_logs(org_id, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

-- Booking conflict detection
CREATE INDEX idx_bookings_staff_time ON bookings(staff_id, start_at, end_at) WHERE status NOT IN ('cancelled');

-- Availability lookup
CREATE INDEX idx_availability_org_user ON availability(org_id, user_id, day_of_week);
```

### Database Ownership Convention

| Service | Tables (read/write) | Tables (read-only) |
|---|---|---|
| **NestJS** | ALL tables | — |
| **Laravel** | audit_logs (write cho admin actions), invoices, invoice_items | users, organizations, members, bookings, customers, services, tasks, incidents |

## Implementation Phases

### Phase 0: Monorepo & Infrastructure Setup (Week 1)

- [ ] 0.1: Tạo monorepo structure
  ```
  teamops/
  ├── frontend/                    # Vue 3
  │   ├── src/
  │   │   ├── components/
  │   │   ├── composables/
  │   │   ├── pages/
  │   │   ├── stores/
  │   │   ├── types/
  │   │   └── utils/
  │   ├── package.json
  │   └── vite.config.ts
  ├── services/
  │   ├── core/                    # NestJS
  │   │   ├── src/
  │   │   │   ├── auth/
  │   │   │   ├── booking/
  │   │   │   ├── customer/
  │   │   │   ├── task/
  │   │   │   ├── incident/
  │   │   │   ├── notification/
  │   │   │   ├── storage/
  │   │   │   ├── common/          # guards, interceptors, filters
  │   │   │   └── prisma/
  │   │   ├── prisma/
  │   │   │   └── schema.prisma
  │   │   ├── Dockerfile
  │   │   └── package.json
  │   └── admin/                   # Laravel
  │       ├── app/
  │       │   ├── Http/Controllers/
  │       │   ├── Models/
  │       │   ├── Jobs/
  │       │   └── Services/
  │       ├── database/migrations/
  │       ├── Dockerfile
  │       └── composer.json
  ├── docker-compose.yml
  ├── .env.example
  ├── .github/workflows/ci.yml
  └── README.md
  ```

- [ ] 0.2: Docker Compose — PostgreSQL 16, Redis 7 (db=0 cho BullMQ, db=1 cho Laravel)
- [ ] 0.3: NestJS scaffold — `@nestjs/core`, `@nestjs/config`, `PrismaModule`, health check endpoint
- [ ] 0.4: Laravel scaffold — Sanctum, health check endpoint, CORS config
- [ ] 0.5: Vue 3 scaffold — Vite, TypeScript strict, Vue Router, Pinia, TanStack Query
- [ ] 0.6: Shared `.env.example` — DATABASE_URL, REDIS_URL, SUPABASE_URL, JWT_SECRET, MAIL_*
- [ ] 0.7: GitHub Actions CI — lint + typecheck + test cho cả 3 services

**Deliverable:** `docker compose up` chạy được cả 3 service, health check trả 200 OK.

---

### Phase 1: Auth & Organization (Week 2)

- [ ] 1.1: Prisma schema — users, organizations, members + migration
- [ ] 1.2: NestJS Auth module — register (hash password bcrypt), login (JWT access + refresh token)
- [ ] 1.3: NestJS JwtGuard — validate access token, inject user vào request
- [ ] 1.4: NestJS RolesGuard — decorator `@Roles('owner', 'admin')` check quyền
- [ ] 1.5: NestJS Organization module — create org, update, invite member by email
- [ ] 1.6: NestJS TenantInterceptor — tự động inject `orgId` vào query/body từ JWT
- [ ] 1.7: Vue auth pages — Login, Register, ForgotPassword
- [ ] 1.8: Vue auth store (Pinia) — lưu tokens, user info, auto refresh
- [ ] 1.9: Vue route guards — redirect chưa login, check role
- [ ] 1.10: Vue organization switcher dropdown
- [ ] 1.11: Unit test — auth service (register, login, refresh, invalid credentials)
- [ ] 1.12: Integration test — full auth flow qua API

**Deliverable:** User đăng ký, đăng nhập, tạo organization, mời member, switch org.

---

### Phase 2: Customer & Service CRUD (Week 3)

- [ ] 2.1: Prisma schema — customers, services + migration
- [ ] 2.2: NestJS Customer module — CRUD + search (ILIKE) + pagination (cursor-based)
- [ ] 2.3: NestJS Service module — CRUD + active/inactive toggle
- [ ] 2.4: NestJS AuditLogInterceptor — tự động ghi mọi CUD operation vào audit_logs
- [ ] 2.5: Vue customer list — DataTable với sort, search, pagination
- [ ] 2.6: Vue customer form — create/edit với Zod validation
- [ ] 2.7: Vue service management page — list + form
- [ ] 2.8: TanStack Query hooks — `useCustomers()`, `useServices()` với cache + optimistic update
- [ ] 2.9: Integration test — customer/service CRUD + search + pagination

**Deliverable:** CRUD khách hàng và dịch vụ, có audit log tự động ghi.

---

### Phase 3: Booking Engine (Week 4-5) ⭐ Core

- [ ] 3.1: Prisma schema — availability, bookings + migration
- [ ] 3.2: NestJS Availability module — CRUD staff availability (day_of_week + time range)
- [ ] 3.3: NestJS BookingService.create() — dùng Prisma transaction
- [ ] 3.4: **Concurrency control** — partial unique index `WHERE status NOT IN ('cancelled')` trên (staff_id, start_at, end_at)
- [ ] 3.5: BookingStatusMachine — validate transition hợp lệ:
  ```
  pending → confirmed → completed
  pending → cancelled
  confirmed → cancelled
  confirmed → no_show
  ```
- [ ] 3.6: Cancel/reschedule — business rules (không cho cancel trước 2h, reschedule tạo booking mới)
- [ ] 3.7: Vue calendar component — week view + day view (tự build hoặc dùng v-calendar)
- [ ] 3.8: Vue booking form — chọn service → chọn staff → chọn slot trống → confirm
- [ ] 3.9: Vue booking detail — timeline trạng thái, nút cancel/reschedule
- [ ] 3.10: Integration test — booking success, double-booking rejected, cancel flow
- [ ] 3.11: Playwright E2E — đặt lịch thành công, trùng lịch bị từ chối

**Deliverable:** Đặt lịch chống trùng, quản lý trạng thái booking.

---

### Phase 4: Notifications & Background Jobs (Week 6) ⭐ Core

- [ ] 4.1: Prisma schema — notifications, idempotency_keys + migration
- [ ] 4.2: NestJS Notification module — create, list, mark as read
- [ ] 4.3: NestJS BullMQ setup — `BullModule.forRoot()` kết nối Redis db=0
- [ ] 4.4: **EmailConfirmationJob** — booking confirmed → gửi email (Mailtrap dev)
  ```ts
  @Processor('email-confirmation')
  export class EmailConfirmationConsumer {
    @Process()
    async handle(job: Job<{ bookingId: string }>) {
      // Check idempotency key trước khi gửi
      // Gửi email qua nodemailer
      // Update booking notification_sent_at
    }
  }
  ```
- [ ] 4.5: **BookingReminderJob** — delayed job, nhắc trước 24h
  ```ts
  await this.bookingReminderQueue.add('remind', { bookingId }, {
    delay: booking.startAt.getTime() - Date.now() - 24 * 60 * 60 * 1000,
  });
  ```
- [ ] 4.6: **IdempotencyService** — check `idempotency_keys` table trước khi xử lý job
- [ ] 4.7: **CleanupExpiredJob** — repeatable job, mỗi giờ xóa booking pending quá hạn
- [ ] 4.8: Vue notification bell icon + dropdown (unread count)
- [ ] 4.9: Vue notification page — list, mark all as read
- [ ] 4.10: Unit test — notification service, idempotency, job handlers
- [ ] 4.11: Bull Board setup — dashboard monitor tại `/admin/queues`

**Deliverable:** Thông báo in-app, email tự động qua queue, nhắc lịch, cleanup tự động.

---

### Phase 5: Task & Workflow (Week 7)

- [ ] 5.1: Prisma schema — tasks + migration
- [ ] 5.2: NestJS Task module — CRUD + status transition validation
- [ ] 5.3: Task assignment, priority, due date, liên kết customer
- [ ] 5.4: Vue Kanban board — 4 column (todo, in_progress, review, done), drag & drop
- [ ] 5.5: Vue task detail panel — slide-over hoặc modal
- [ ] 5.6: Vue filter bar — assignee, status, priority, due date range
- [ ] 5.7: Integration test — task state transitions, assignment

**Deliverable:** Kanban-style task management với workflow.

---

### Phase 6: Incident Tracker (Week 8)

- [ ] 6.1: Prisma schema — incidents, incident_events + migration
- [ ] 6.2: NestJS Incident module — CRUD + timeline (append-only events)
- [ ] 6.3: Severity escalation — critical incident tự động notify owner
- [ ] 6.4: SLA calculation:
  ```ts
  MTTA (Mean Time to Acknowledge) = AVG(first_event.created_at - incident.created_at)
  MTTR (Mean Time to Resolve) = AVG(incident.resolved_at - incident.created_at)
  ```
- [ ] 6.5: Vue incident list — severity badges, status filter
- [ ] 6.6: Vue incident detail — timeline component, add event form
- [ ] 6.7: Vue create incident form
- [ ] 6.8: Integration test — incident lifecycle, SLA calculation

**Deliverable:** Incident management với timeline và SLA metrics.

---

### Phase 7: Admin Service — Laravel (Week 9-10)

- [ ] 7.1: Laravel Eloquent models — map cùng PostgreSQL tables (read-only cho core tables)
- [ ] 7.2: Admin authentication — shared JWT secret với NestJS hoặc Laravel Sanctum riêng
- [ ] 7.3: Admin Dashboard API — KPI aggregates:
  - Tổng bookings hôm nay/tuần/tháng
  - Doanh thu theo thời gian
  - Tỉ lệ hủy booking
  - Active incidents
- [ ] 7.4: Report queries — PostgreSQL window functions, CTE
- [ ] 7.5: Invoice module — CRUD + export PDF (DomPDF/Snappy)
- [ ] 7.6: Bulk import customers — CSV upload + validation + queue processing
- [ ] 7.7: Audit log viewer — filter theo user, action, entity, date range
- [ ] 7.8: Laravel Horizon setup — dashboard tại `/admin/horizon`
- [ ] 7.9: Cron job — daily stats aggregation, invoice overdue reminder
- [ ] 7.10: Vue admin pages — Dashboard, Reports, Invoice management, Audit log

**Deliverable:** Admin panel đầy đủ với reports, invoice PDF, bulk import, Horizon dashboard.

---

### Phase 8: File Upload & Supabase (Week 11)

- [ ] 8.1: NestJS StorageService — upload/download qua Supabase Storage API
  ```ts
  // Upload: file → Buffer → Supabase Storage → return URL
  // Download: signed URL có thời hạn
  // Delete: xóa khi entity bị xóa
  ```
- [ ] 8.2: Prisma schema — attachments table + migration
- [ ] 8.3: Attachment module — liên file với entity (task, incident, customer, invoice)
- [ ] 8.4: Vue file upload component — drag & drop, progress bar, preview
- [ ] 8.5: Vue file gallery — grid view cho images, list view cho documents
- [ ] 8.6: Validation — max 10MB, cho phép image/pdf/doc/xls

**Deliverable:** Upload/đính kèm file qua Supabase Storage.

---

### Phase 9: Realtime & WebSocket (Week 12)

- [ ] 9.1: NestJS WebSocket gateway — Socket.IO với JWT auth middleware
- [ ] 9.2: Room management — mỗi org là 1 room, user chỉ join room của org mình
- [ ] 9.3: Event dispatch — booking/task/notification thay đổi → emit tới room
  ```ts
  // Sau khi booking status thay đổi:
  this.server.to(`org:${orgId}`).emit('booking:updated', { bookingId, status });
  ```
- [ ] 9.4: Vue composable `useRealtime(orgId)` — kết nối Socket.IO, subscribe events
- [ ] 9.5: Optimistic UI — update UI ngay, rollback nếu server reject
- [ ] 9.6: Connection handling — auto reconnect, stale connection detection

**Deliverable:** Realtime updates khi có thay đổi booking/task/notification.

---

### Phase 10: Polish & Deploy (Week 13-14)

- [ ] 10.1: NestJS ExceptionFilter — format lỗi thống nhất `{ statusCode, message, error }`
- [ ] 10.2: Structured logging — Pino logger, request ID header, correlation ID
- [ ] 10.3: Rate limiting — NestJS Throttler, Laravel middleware throttle
- [ ] 10.4: Vue error boundary + toast notifications (vue-sonner)
- [ ] 10.5: Vue loading states — skeleton screens, spinner
- [ ] 10.6: Responsive design — mobile-friendly sidebar, table scroll
- [ ] 10.7: Seed data script — demo org với 5 customers, 3 services, 10 bookings, 5 tasks
- [ ] 10.8: Deploy NestJS + Laravel — Railway hoặc Fly.io hoặc VPS Docker
- [ ] 10.9: Deploy Vue frontend — Vercel hoặc Netlify
- [ ] 10.10: README — architecture diagram, setup guide, demo credentials, tech decisions

**Deliverable:** Deployed demo có seed data, README đầy đủ cho portfolio.

---

## Kỹ năng middle-level luyện được

| Phase | Kỹ năng chính |
|---|---|
| 0 | Monorepo, Docker Compose, CI/CD pipeline |
| 1 | JWT auth, RBAC, multi-tenancy, guards, interceptors |
| 2 | CRUD patterns, cursor pagination, audit log, TanStack Query |
| 3 | **DB transaction, concurrency control, state machine, partial index** |
| 4 | **BullMQ, delayed/repeatable jobs, idempotency, email integration** |
| 5 | **Drag & drop, state machine, Kanban UI** |
| 6 | **Timeline (append-only), SLA calculation, severity escalation** |
| 7 | **Cross-service auth, reporting queries, PDF export, CSV import, Horizon** |
| 8 | **File storage, signed URLs, upload validation** |
| 9 | **WebSocket, room-based realtime, optimistic UI, reconnect** |
| 10 | **Observability, rate limiting, deploy, seed data** |

## Phỏng vấn — câu hỏi có thể trả lời từ project này

| Câu hỏi | Trả lời từ project |
|---|---|
| "Làm sao chống double-booking?" | Partial unique index + `SELECT FOR UPDATE` trong transaction |
| "Queue retry bị duplicate email?" | Idempotency key check trước khi gửi |
| "2 backend share database?" | Convention-based ownership, mỗi service chỉ write bảng của nó |
| "State machine cho booking?" | Validate transition hợp lệ trước khi update status |
| "Multi-tenant isolation?" | TenantInterceptor inject orgId, mọi query đều filter theo orgId |
| "Realtime scaling?" | Socket.IO rooms per org, có thể shard theo org |
| "Background job scheduling?" | BullMQ delayed jobs cho reminder, repeatable cho cleanup |
| "Microservice communication?" | Shared PostgreSQL (simple), có thể migrate sang HTTP/gRPC sau |

## Risks & Mitigation

| Risk | Mitigation |
|---|---|
| Scope quá lớn, burnout | Dừng ở Phase 6 là đủ portfolio. Phase 7-10 là bonus. |
| 2 backend phức tạp khi debug | Docker Compose logs, request ID header xuyên service |
| Shared database conflict | Convention-based ownership, NestJS owns core tables |
| Double booking race condition | DB constraint là nguồn sự thật, không chỉ check application-level |
| BullMQ job stuck | Bull Board monitoring, dead letter queue manual review |
| Socket.IO reconnect storm | Exponential backoff, stale connection timeout |

## Folder Structure Reference

```
teamops/
├── frontend/
│   ├── src/
│   │   ├── api/                    # Axios instances, API functions
│   │   │   ├── core.ts             # NestJS API client
│   │   │   └── admin.ts            # Laravel API client
│   │   ├── components/
│   │   │   ├── common/             # Button, Modal, Table, Toast
│   │   │   ├── booking/            # Calendar, BookingForm, BookingCard
│   │   │   ├── customer/           # CustomerList, CustomerForm
│   │   │   ├── task/               # KanbanBoard, TaskCard
│   │   │   ├── incident/           # IncidentTimeline, IncidentForm
│   │   │   └── notification/       # NotificationBell, NotificationList
│   │   ├── composables/
│   │   │   ├── useAuth.ts
│   │   │   ├── useRealtime.ts
│   │   │   └── usePagination.ts
│   │   ├── layouts/
│   │   │   ├── DefaultLayout.vue
│   │   │   └── AdminLayout.vue
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── customers/
│   │   │   ├── bookings/
│   │   │   ├── tasks/
│   │   │   ├── incidents/
│   │   │   └── admin/
│   │   ├── router/
│   │   ├── stores/
│   │   │   ├── auth.ts
│   │   │   └── ui.ts
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── services/
│   ├── core/                        # NestJS
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── dto/
│   │   │   │   └── guards/
│   │   │   ├── booking/
│   │   │   │   ├── booking.module.ts
│   │   │   │   ├── booking.controller.ts
│   │   │   │   ├── booking.service.ts
│   │   │   │   ├── booking-status.machine.ts
│   │   │   │   └── dto/
│   │   │   ├── customer/
│   │   │   ├── task/
│   │   │   ├── incident/
│   │   │   ├── notification/
│   │   │   │   ├── notification.module.ts
│   │   │   │   ├── notification.service.ts
│   │   │   │   └── consumers/
│   │   │   │       ├── email-confirmation.consumer.ts
│   │   │   │       └── booking-reminder.consumer.ts
│   │   │   ├── storage/
│   │   │   ├── realtime/
│   │   │   │   └── realtime.gateway.ts
│   │   │   └── common/
│   │   │       ├── guards/
│   │   │       ├── interceptors/
│   │   │       ├── filters/
│   │   │       └── decorators/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── admin/                       # Laravel
│       ├── app/
│       │   ├── Http/Controllers/
│       │   ├── Models/
│       │   ├── Jobs/
│       │   ├── Services/
│       │   └── Exports/
│       ├── database/migrations/
│       ├── resources/views/
│       ├── routes/
│       ├── Dockerfile
│       └── composer.json
├── docker-compose.yml
├── .env.example
├── .github/workflows/ci.yml
└── README.md
```
