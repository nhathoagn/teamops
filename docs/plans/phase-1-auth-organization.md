# Phase 1 Execution Plan: Auth & Organization

> Mục tiêu gần nhất: hoàn thiện luồng đăng ký, đăng nhập, refresh token và tạo organization đầu tiên trên NestJS trước khi nối frontend.

## 1. Trạng thái hiện tại

### Đã có

- Prisma kết nối PostgreSQL.
- Các model `User`, `Organization`, `Member`.
- Migration `auth_org` và `snake_case_columns`.
- `PrismaModule`, health check và DB health check.
- Frontend đã có trang Login/Register, auth store và API client ở mức scaffold.
- Các package auth cần thiết đã cài: `bcryptjs`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`.

### Chưa có

- `AuthModule` và các endpoint `/auth/*`.
- Cơ chế refresh token an toàn.
- JWT strategy/guard hoạt động thực tế.
- Organization API và tenant context.
- Test cho auth flow.

## 2. Thứ tự triển khai đề xuất

Không làm toàn bộ Phase 1 cùng lúc. Chia thành 4 lát cắt có thể kiểm thử độc lập.

### Slice A: Backend auth tối thiểu

1. Chuẩn hóa biến môi trường JWT.
2. Tạo DTO cho register, login và refresh.
3. Tạo `AuthService`.
4. Tạo `AuthController`.
5. Tạo access token và refresh token.
6. Tạo endpoint `GET /auth/me` được bảo vệ bởi JWT.
7. Viết unit test và chạy thử API.

**Kết quả cần đạt:** đăng ký, đăng nhập, refresh và lấy thông tin user thành công.

### Slice B: Organization và membership

1. Khi register, dùng Prisma transaction để tạo đồng thời:
   - user
   - organization đầu tiên
   - member với role `OWNER`
2. Tạo Organization module:
   - `POST /organizations`
   - `GET /organizations`
   - `GET /organizations/:id`
   - `PATCH /organizations/:id`
3. Thêm endpoint mời member bằng email.
4. Kiểm tra user chỉ truy cập organization mà họ là member.

**Kết quả cần đạt:** user có thể tạo, xem, cập nhật organization và mời member.

### Slice C: Authorization và tenant context

1. Hoàn thiện `JwtAuthGuard`.
2. Tạo decorator `@CurrentUser()`.
3. Tạo decorator `@Roles()` và hoàn thiện `RolesGuard`.
4. Quyết định cách chọn tenant hiện tại:
   - Client gửi `X-Organization-Id` trên mỗi request.
   - Backend xác minh user thuộc organization này.
5. Tạo `@CurrentOrganization()` hoặc tenant context service.
6. Không tự động tin `orgId` từ body/query.

**Kết quả cần đạt:** route có thể giới hạn theo role và mọi tenant request đều được xác minh membership.

> Khuyến nghị: không dùng `TenantInterceptor` để âm thầm sửa body/query như roadmap ban đầu. Header rõ ràng cộng với membership validation an toàn và dễ debug hơn.

### Slice D: Nối frontend

1. Đổi Axios client sang Vite proxy hoặc biến môi trường, không hard-code localhost.
2. Nối Login/Register với Core API thật.
3. Khôi phục session bằng `GET /auth/me` khi app khởi động.
4. Xử lý refresh token theo single-flight để nhiều request 401 không refresh đồng thời.
5. Hoàn thiện route guard.
6. Tạo organization switcher và lưu organization đang chọn.
7. Thêm Forgot Password sau khi auth cơ bản ổn định.

**Kết quả cần đạt:** user thao tác được toàn bộ auth flow từ trình duyệt.

## 3. Bước tiếp theo cần làm ngay: Slice A, Auth backend

### 3.1. Contract API

#### `POST /auth/register`

Request:

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "StrongPass123!",
  "organizationName": "A Studio"
}
```

Response `201`:

```json
{
  "user": {
    "id": "uuid",
    "name": "Nguyen Van A",
    "email": "a@example.com"
  },
  "organizations": [
    {
      "id": "uuid",
      "name": "A Studio",
      "slug": "a-studio",
      "role": "OWNER"
    }
  ],
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### `POST /auth/login`

```json
{
  "email": "a@example.com",
  "password": "StrongPass123!"
}
```

#### `POST /auth/refresh`

```json
{
  "refreshToken": "..."
}
```

#### `GET /auth/me`

Header:

```http
Authorization: Bearer <access-token>
```

### 3.2. Cấu trúc file đề xuất

```text
services/core/src/auth/
├── auth.controller.ts
├── auth.module.ts
├── auth.service.ts
├── dto/
│   ├── login.dto.ts
│   ├── refresh-token.dto.ts
│   └── register.dto.ts
├── decorators/
│   └── current-user.decorator.ts
├── strategies/
│   └── jwt.strategy.ts
└── types/
    └── jwt-payload.type.ts
```

### 3.3. JWT payload

Access token chỉ nên chứa định danh ổn định:

```ts
{
  sub: user.id,
  email: user.email,
  type: 'access'
}
```

Không nhúng một `orgId` cố định vào token vì user có thể thuộc nhiều organization và cần switch tenant.

### 3.4. Refresh token

Cho bản đầu tiên, bổ sung vào `User`:

```prisma
refreshTokenHash String? @map("refresh_token_hash")
```

Quy tắc:

- Chỉ lưu hash của refresh token.
- Refresh thành công phải rotate token.
- Logout xóa `refreshTokenHash`.
- Access token sống khoảng 15 phút.
- Refresh token sống khoảng 7 ngày.

Giải pháp một hash/user chỉ hỗ trợ một phiên đăng nhập tại một thời điểm. Đây là phạm vi hợp lý cho Phase 1. Có thể chuyển sang bảng `sessions` khi cần multi-device.

### 3.5. Transaction khi register

Register phải là một transaction:

1. Normalize email về lowercase.
2. Kiểm tra email đã tồn tại.
3. Hash password bằng bcrypt.
4. Tạo user.
5. Sinh slug organization, xử lý trùng slug.
6. Tạo organization.
7. Tạo member role `OWNER`.
8. Phát hành token.
9. Lưu hash refresh token.

Nếu bất kỳ bước nào lỗi, không được để lại user hoặc organization mồ côi.

## 4. Checklist kiểm thử Slice A

### Unit test

- [ ] Register hash password, không lưu plain text.
- [ ] Register từ chối email đã tồn tại.
- [ ] Login trả token khi password đúng.
- [ ] Login trả `401` khi password sai.
- [ ] Refresh từ chối token sai hoặc hết hạn.
- [ ] Refresh rotate refresh token.
- [ ] JWT strategy từ chối token không phải access token.

### API smoke test

- [ ] `POST /auth/register` trả `201`.
- [ ] Database có đúng 1 user, 1 organization, 1 OWNER member.
- [ ] `POST /auth/login` trả cặp token.
- [ ] `GET /auth/me` với access token trả user.
- [ ] `GET /auth/me` không có token trả `401`.
- [ ] `POST /auth/refresh` trả cặp token mới.
- [ ] Refresh token cũ không dùng lại được sau rotation.

## 5. Definition of Done cho Phase 1

- [ ] Register tạo user, organization và OWNER membership atomically.
- [ ] Login, refresh, logout và `/auth/me` hoạt động.
- [ ] Password và refresh token chỉ được lưu dạng hash.
- [ ] User có thể tạo và switch organization.
- [ ] Backend xác minh membership trên mọi tenant route.
- [ ] OWNER/ADMIN/STAFF được kiểm tra bằng guard.
- [ ] Frontend không hard-code API URL.
- [ ] Frontend khôi phục session và refresh token ổn định.
- [ ] Unit/integration tests cho happy path và failure path đều pass.

## 6. Lệnh xác minh sau mỗi bước

```bash
cd services/core
pnpm exec prisma format
pnpm exec prisma validate
pnpm exec prisma generate
pnpm build
pnpm test
```

Khi có thay đổi schema:

```bash
pnpm exec prisma migrate dev --name add_refresh_token_hash
```

## 7. Thứ tự commit gợi ý

1. `feat(core): add auth DTOs and JWT configuration`
2. `feat(core): implement register login and refresh flow`
3. `test(core): cover authentication service`
4. `feat(core): add organization membership APIs`
5. `feat(core): enforce tenant roles and membership`
6. `feat(frontend): connect authentication and organization switcher`
7. `test(auth): cover full authentication flow`
