# TeamOps — Multi-tenant Operations Platform

Side project luyện middle-level full-stack: Vue 3 + NestJS + Laravel microservices.

## Documentation

- Current codebase map and implementation status: [docs/PROJECT_MAP.md](docs/PROJECT_MAP.md)
- Full architecture, schema, queue design, and milestones: [docs/plans/teamops-microservices.md](docs/plans/teamops-microservices.md)

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Vue 3 Frontend                │
│         (Vite dev proxy → core/admin)           │
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
              │    PostgreSQL 16  │
              │    Redis 7        │
              │    Supabase       │
              └───────────────────┘
```

## Tech Stack

| Component | Tech |
|---|---|
| Frontend | Vue 3, TypeScript, Vite, Pinia, TanStack Query, Zod |
| Core Service | NestJS, Prisma, BullMQ, Socket.IO |
| Admin Service | Laravel, Horizon, Sanctum |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis 7 |
| File Storage | Supabase Storage |
| Testing | Vitest, Playwright |
| Infra | Docker Compose, GitHub Actions |

## Quick Start

```bash
# 1. Clone
git clone <repo-url> && cd teamops

# 2. Copy env
cp .env.example .env

# 3. Start services
docker compose up -d

# 4. Setup NestJS
cd services/core
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
cd ../..

# 5. Setup Laravel
cd services/admin
composer install
php artisan key:generate
php artisan migrate
cd ../..

# 6. Setup Frontend
cd frontend
pnpm install
cd ..

# 7. Run (in separate terminals)
cd services/core && pnpm start:dev     # http://localhost:3000
cd services/admin && php artisan serve  # http://localhost:8000
cd frontend && pnpm dev                 # http://localhost:5173
```

## Services

| Service | URL | Description |
|---|---|---|
| Frontend | http://localhost:5173 | Vue 3 SPA |
| Core API | http://localhost:3000 | NestJS REST API |
| Admin API | http://localhost:8000 | Laravel REST API |
| Health (Core) | http://localhost:3000/health | Health check |
| Health (Admin) | http://localhost:8000/api/health | Health check |
| Bull Board | http://localhost:3000/admin/queues | Queue dashboard |
| Horizon | http://localhost:8000/horizon | Laravel queue dashboard |
| Mailpit | http://localhost:8025 | Email testing UI |

## Project Structure

```
teamops/
├── frontend/                    # Vue 3
│   ├── src/
│   │   ├── api/                 # Axios instances
│   │   ├── components/          # Reusable components
│   │   ├── composables/         # Vue composables
│   │   ├── layouts/             # Page layouts
│   │   ├── pages/               # Route pages
│   │   ├── router/              # Vue Router config
│   │   ├── stores/              # Pinia stores
│   │   └── types/               # TypeScript interfaces
│   └── vite.config.ts
├── services/
│   ├── core/                    # NestJS
│   │   ├── src/
│   │   │   ├── auth/            # Auth module
│   │   │   ├── booking/         # Booking module
│   │   │   ├── customer/        # Customer module
│   │   │   ├── task/            # Task module
│   │   │   ├── incident/        # Incident module
│   │   │   ├── notification/    # Notification + queue consumers
│   │   │   ├── storage/         # Supabase file upload
│   │   │   ├── realtime/        # WebSocket gateway
│   │   │   └── common/          # Guards, interceptors, filters
│   │   └── prisma/
│   │       └── schema.prisma    # Database schema
│   └── admin/                   # Laravel
│       ├── app/
│       │   ├── Http/Controllers/Admin/
│       │   ├── Models/
│       │   └── Jobs/
│       └── routes/api.php
├── docker-compose.yml
├── .env.example
└── .github/workflows/ci.yml
```

## Database

Shared PostgreSQL database. Ownership convention:

| Service | Tables (read/write) | Tables (read-only) |
|---|---|---|
| NestJS | ALL tables | — |
| Laravel | invoices, invoice_items, audit_logs | users, organizations, bookings, etc. |

## Queue Architecture

| Queue | Service | Tech | Jobs |
|---|---|---|---|
| email-confirmation | NestJS | BullMQ | Send booking confirmation email |
| booking-reminder | NestJS | BullMQ | Remind 24h before appointment |
| notification-dispatch | NestJS | BullMQ | In-app notification dispatch |
| cleanup-expired | NestJS | BullMQ | Clean up expired pending bookings |
| report-export | Laravel | Horizon | Generate report PDF/CSV |
| invoice-generate | Laravel | Horizon | Generate invoice PDF |
| bulk-import | Laravel | Horizon | Process CSV customer import |
| daily-stats | Laravel | Horizon | Aggregate daily statistics |

## Development Milestones

| Phase | Content | Status |
|---|---|---|
| 0 | Monorepo & Infrastructure | ✅ Done |
| 1 | Auth & Organization | ⬜ |
| 2 | Customer & Service CRUD | ⬜ |
| 3 | Booking Engine | ⬜ |
| 4 | Notifications & Queue | ⬜ |
| 5 | Task & Workflow | ⬜ |
| 6 | Incident Tracker | ⬜ |
| 7 | Admin Service | ⬜ |
| 8 | File Upload (Supabase) | ⬜ |
| 9 | Realtime (WebSocket) | ⬜ |
| 10 | Polish & Deploy | ⬜ |

## License

MIT
