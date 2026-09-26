# Figma Design Prompt — TeamOps (siêu chi tiết)

Nguồn sự thật: `docs/plans/teamops-microservices.md`. Customer field = `notes` (không dùng `address` từ stub types). Role = `owner | admin | staff`.

**Cách dán (bắt buộc):** mỗi session Figma Make dán **PACK 0** trước, rồi **một** pack màn hình. Không nhét cả file một lần.

Không vẽ: marketing landing, social login, chat, checkout, Bull Board, Horizon, Mailpit.

Copy UI: tiếng Việt. Tên sản phẩm: TeamOps. Tenant mẫu cố định bên dưới — **cấm bịa thêm người/dịch vụ**.

---

## PACK 0 — Foundations (dán mọi session)

```
You are designing TeamOps, a multi-tenant SaaS operations console for a Hà Nội interior studio. Visual language: Linear + Cal.com + Stripe Dashboard. Dense, calm, professional. Desktop-first. Production hi-fi, auto-layout, component variants. Not wireframes. Not consumer marketplace.

LOCKED TENANT (use these exact strings everywhere)
Org: Atelier Bắc · slug atelier-bac · logo monogram “AB” on indigo
People:
- Minh Trần · minh@atelierbac.vn · owner · avatar initials MT
- Lan Phạm · lan@atelierbac.vn · admin · LP
- Huy Đỗ · huy@atelierbac.vn · staff · HĐ
Customers (notes not address):
- Nguyễn Thu Hà · thuha@gmail.com · 0901 234 567 · notes “Căn hộ 2PN Tây Hồ, thích gỗ sồi”
- Trần Đức Anh · ducanh@gmail.com · 0912 345 678 · notes “Nhà phố Long Biên, ngân sách 400tr”
- Lê Mai · lemai@gmail.com · 0987 654 321 · notes “Studio Ba Đình, cần 3D trước 5/10”
Services:
- Tư vấn nội thất · 90 phút · 1.500.000 ₫ · active
- Khảo sát hiện trạng · 60 phút · 800.000 ₫ · active
- Review 3D · 120 phút · 2.200.000 ₫ · active
- Gói staging (ngưng) · 180 phút · 3.500.000 ₫ · inactive
Today in UI: Thứ 3, 22 Th9 2026. Clock 24h. Money: 1.500.000 ₫ (dot thousands, no decimals, tabular figures).
Logged-in user default: Minh (owner), unless a frame says otherwise.

TOKENS
Sidebar #1A1A2E · hover/active #2A2A4A · nav text #CCCCCC · active #FFFFFF
Page #F5F5F7 · surface #FFFFFF · hairline #E5E7EB
Primary #3B5BDB · hover #364FC7 · text #111827 · muted #6B7280
Success #12B886 · warning #F59F00 · danger #FA5252 · info #228BE6
Type Inter/Geist. Title 24/32 semibold · section 16/24 medium · body 14/20 · meta 12/16 · table 14/20
Radius card 8 · modal/slide-over 16. Shadow cards 0 1px 3px rgba(0,0,0,.06)
NO glass, NO button gradients, NO heavy shadows, NO mascots, NO 3D charts.
Grid 8. Sidebar 240 / collapsed 64. Header 56. Content pad 24. Table row 40. Slide-over 480.
Toasts top-right, 320 wide, 8 from top/right, auto-dismiss. Overlay 40% black.

PILLS (component Badge/Status=value — never raw colored text)
Booking: pending Xám “Chờ xác nhận” · confirmed Xanh “Đã xác nhận” · cancelled Đỏ “Đã hủy” · completed Xanh lá “Hoàn tất” · no_show Cam “Không đến”
Task status: todo “Cần làm” · in_progress “Đang làm” · review “Review” · done “Xong” · cancelled “Hủy”
Task priority: low “Thấp” · medium “Trung bình” · high “Cao” · urgent “Khẩn”
Incident severity: low “Thấp” · medium “TB” · high “Cao” · critical “Nghiêm trọng” (+ 3px left red bar on card)
Incident status: open “Mở” · investigating “Đang xử lý” · resolved “Đã xử lý” · closed “Đóng”
Invoice: draft “Nháp” · sent “Đã gửi” · paid “Đã thu” · overdue “Quá hạn” · cancelled “Hủy”
Role pills: owner indigo · admin blue · staff gray

BOOKING STATE MACHINE (disable illegal buttons, do not hide them — disabled + tooltip)
pending → confirmed → completed
pending → cancelled
confirmed → cancelled
confirmed → no_show
Cancel blocked if now > start_at − 2h. Tooltip: “Không thể hủy trong vòng 2 giờ trước giờ hẹn.”
Reschedule = tạo booking mới, booking cũ cancelled. Copy: “Tạo lịch mới. Lịch hiện tại sẽ bị hủy.”

ERROR SHAPE (inline or toast): never dump stack. Title + one sentence.
API-style: { statusCode, message, error } but UI shows message only.

IA — do not add routes
Auth: /login /register /forgot-password /reset-password
App: /dashboard /customers /customers/:id /services /bookings /tasks /incidents /incidents/:id /notifications /settings/availability /settings/members /settings/profile
Admin (owner+admin only): /admin/dashboard /admin/reports /admin/import /admin/invoices /admin/invoices/:id /admin/audit-log
System: /403 /404

APP SHELL
Left sidebar 240: mark TO + wordmark TeamOps. Collapse ☰.
Nav + 16px icon (use simple stroke icons):
  Tổng quan /dashboard
  Khách hàng /customers
  Dịch vụ /services
  Lịch hẹn /bookings
  Công việc /tasks
  Sự cố /incidents
  Thông báo /notifications
Divider. Cài đặt group:
  Lịch rảnh /settings/availability
  Thành viên /settings/members  (owner/admin; staff: hide item)
Active: left 2px primary + #2A2A4A fill + white text.
Header 56 white, bottom hairline: left H1 page title 18/24 semibold; right cluster gap 12:
  Org switcher button: 28 avatar AB + “Atelier Bắc” + chevron
  Bell 20px, badge 16 red with number if unread>0 (sample 3), pulse 1s when increment
  Avatar 32 MT, menu
Avatar menu 220px: Minh Trần / minh@atelierbac.vn · Hồ sơ · Đổi tổ chức · Admin panel · Đăng xuất (danger)
Staff session: no “Admin panel”, no “Thành viên”.
Main #F5F5F7 scroll.

ADMIN SHELL
Same tokens. Sidebar top: 10px eyebrow “ADMIN” tracking wide + “Admin Panel”.
Nav: Tổng quan · Báo cáo · Hóa đơn · Nhật ký · Import CSV
Footer: ← Về ứng dụng (/dashboard) · Đăng xuất
Header title only (no org switcher duplicate — org still in a compact chip).

ORG SWITCHER DROPDOWN 280px
List: Atelier Bắc (check) · Studio Kite (other org)
Button “+ Tạo tổ chức”
Clicking Studio Kite shows toast “Đã chuyển sang Studio Kite” — do not design that org’s data.

COMPONENTS (name exactly)
Button/Type=primary|secondary|ghost|danger, Size=sm|md, State=default|hover|disabled|loading
Input, Textarea, Select, Date, Time, Search
Checkbox Radio Switch Tabs
Badge/Status, Avatar, AvatarGroup
Table (header sort caret, row hover, selected, empty, skeleton 8 rows)
Pagination: “Hiển thị 1–20” + Prev + Next (cursor, NO page numbers)
Modal 480 or 640, SlideOver/Right=480, Toast, ConfirmDialog
EmptyState icon 40 + title 16 + body 14 muted + optional CTA
Dropzone, CalendarWeek, CalendarDay, KanbanColumn, TaskCard, TimelineItem, StatCard, NotifItem
Skeleton/Table Kanban Calendar StatRow
```

---

## PACK 1 — Auth + system errors

```
Using PACK 0 tokens. No app chrome. Centered card 400×auto on #F5F5F7. Card pad 32, radius 16, one shadow. Logo TO 32 + “TeamOps” above card. Footer muted 12: “© 2026 TeamOps”.

FRAME Login / 1440×900
H2 “Đăng nhập” · subtitle “Chào mừng trở lại TeamOps”
Fields stacked gap 16:
  Email* placeholder “you@studio.vn” value empty, type email
  Mật khẩu* + eye toggle, placeholder “••••••••”
Primary full width “Đăng nhập”
Row: link “Quên mật khẩu?” left · “Tạo tài khoản” right
No Google/Apple. No remember-me.

FRAME Login / error
Email filled minh@atelierbac.vn. Under password, 12px danger: “Email hoặc mật khẩu không đúng.”
Toast optional off — inline only. CTA still enabled.

FRAME Login / field validation
Email “minh@” → “Email không hợp lệ.”
Password empty on submit → “Bắt buộc.”
Both 12px under field.

FRAME Login / loading
Button disabled, spinner 16 + label “Đang đăng nhập…” · inputs disabled.

FRAME Register / 1440×900
H2 “Tạo tài khoản”
Fields: Họ tên* · Email* · Mật khẩu* helper “Tối thiểu 8 ký tự”
CTA “Tạo tài khoản”
Link “Đã có tài khoản? Đăng nhập”
Error variant: password “abc” → “Mật khẩu tối thiểu 8 ký tự.”
Email taken → “Email này đã được dùng.”

FRAME Forgot password
H2 “Quên mật khẩu” · “Nhập email, chúng tôi gửi link đặt lại.”
Email* · CTA “Gửi link đặt lại” · link “← Về đăng nhập”

FRAME Forgot / sent
Same card. Icon check success. Title “Đã gửi email.” Body “Nếu minh@atelierbac.vn tồn tại, link có hiệu lực 30 phút. Kiểm tra cả spam.” CTA ghost “Gửi lại” · link login.
Do not reveal whether email exists beyond this copy.

FRAME Reset password /reset-password?token=…
H2 “Đặt mật khẩu mới”
Mật khẩu mới* · Xác nhận mật khẩu*
CTA “Lưu mật khẩu”
Mismatch → “Hai mật khẩu không khớp.”
Success frame: “Đã cập nhật. Đăng nhập lại.” CTA to login.

FRAME 404 / 1440
App shell. Center empty: title “Không tìm thấy trang” · “Đường dẫn không tồn tại hoặc đã bị xóa.” CTA “Về tổng quan”

FRAME 403
App shell. “Không có quyền” · “Tài khoản staff không truy cập được khu vực này.” CTA “Về tổng quan”
Use this if Huy opens /admin/* or /settings/members.

FRAME Session expired
Modal 400, no overlay close.
Title “Phiên đăng nhập hết hạn”
Body “Đăng nhập lại để tiếp tục. Dữ liệu chưa lưu có thể mất.”
Primary “Đăng nhập” → /login · ghost “Ở lại” disabled-looking secondary that still goes login.

MOBILE 375 Login: card full width pad 16, logo 24. No sidebar.
```

---

## PACK 2 — Org, members, profile

```
PACK 0 + App shell. User Minh unless noted.

FRAME Create org / first login (no org yet)
No sidebar (or sidebar disabled empty). Center card 480.
H2 “Tạo tổ chức”
Body “Mọi lịch hẹn, khách, task gắn với một tổ chức.”
Họ tên tổ chức* value “Atelier Bắc”
Slug* prefix fixed “teamops.app/” + input “atelier-bac” live-sanitized lowercase kebab.
Helper “Chỉ a-z, 0-9, dấu gạch. Không đổi sau này dễ dàng.”
Logo optional dropzone 96 square “Tải logo (PNG/JPG, ≤2MB)”
CTA “Tạo tổ chức”
Slug taken → “Slug đã được dùng.”

FRAME Org switcher / open
Header dropdown as PACK 0. 2 orgs. Hover row #F5F5F7. Check 16 on current.

FRAME Members /settings/members · 1440×900 · owner
H1 “Thành viên” · subtitle “3 người trong Atelier Bắc”
Primary right “Mời thành viên”
Table columns: Người (avatar+name+email) · Vai trò (pill) · Tham gia · empty actions header
Rows:
  MT Minh Trần minh@… · owner · 01 Th8 2026 · no delete on self; role select disabled “Owner”
  LP Lan Phạm · admin · 12 Th8 2026 · select role admin/staff · icon ⋯
  HĐ Huy Đỗ · staff · 02 Th9 2026 · ⋯
⋯ menu: “Đổi vai trò” · “Gỡ khỏi tổ chức” (danger)
Pagination “Hiển thị 1–3”

FRAME Members / empty
Only owner just created org. EmptyState: “Chưa có ai khác.” CTA “Mời thành viên”

FRAME Members / staff 403
Huy session. Do not show this nav. If forced: FRAME 403.

FRAME Invite modal 480
Title “Mời thành viên”
Email* placeholder “ban@studio.vn”
Vai trò* select: Admin · Staff (default Staff). Helper: “Admin: khách, lịch, hóa đơn, báo cáo. Staff: lịch, task, sự cố. Owner không mời qua form — liên hệ support.”
Do NOT include Owner in select.
CTA “Gửi lời mời” · ghost “Hủy”
Loading: “Đang gửi…”
Success toast: “Đã gửi lời mời tới lan2@atelierbac.vn”
Duplicate member → inline “Người này đã trong tổ chức.”

FRAME Remove member confirm
Title “Gỡ Huy Đỗ?”
Body “Huy mất quyền với Atelier Bắc. Lịch hẹn đã gán vẫn giữ, assignee trống.”
Danger “Gỡ” · ghost “Không”

FRAME Change role
Small modal. Select Admin/Staff. Huy→Admin. CTA “Lưu”
Owner row: cannot change, tooltip “Tổ chức phải có đúng 1 owner.”

FRAME Profile /settings/profile
H1 “Hồ sơ”
Card 640: Avatar 80 + “Đổi ảnh” (dropzone 2MB jpg/png) · Họ tên Minh Trần · Email minh@… (disabled, helper “Email không đổi tại đây”) · CTA “Lưu thay đổi”
Card 2: “Mật khẩu” · CTA secondary “Đổi mật khẩu” opens fields current / new / confirm.
Unsaved: button primary enabled. Success toast “Đã lưu hồ sơ.”

MOBILE 375 Members: table horizontally scrollable, sticky first column name. Invite CTA full-width below title.
```

---

## PACK 3 — Dashboard

```
PACK 0 App shell. H1 “Tổng quan”. Header right no extra CTA.

FRAME Dashboard / populated / 1440×900
Greeting 14 muted “Thứ 3, 22 Th9 2026” + 24 “Xin chào, Minh”
4 StatCards 1-row gap 16, each: label 12 muted · value 28 semibold tabular · delta 12 success/danger
  Khách hàng · 3 · +1 tuần này (green)
  Lịch hôm nay · 3 · 0 so với T2 (muted)
  Task đang mở · 4 · −2 (green)
  Sự cố mở · 2 · 1 critical (danger “1 nghiêm trọng”)
No sparklines (delta text only — keep calm).

Two columns 60/40 gap 24 below.

LEFT card “Lịch hôm nay”
Rows 56 height, time 14 semibold tabular 72 wide, then name+service 14/12, staff avatar 24, pill:
  09:00–10:30 · Nguyễn Thu Hà · Tư vấn nội thất · MT · Đã xác nhận
  11:00–12:00 · Trần Đức Anh · Khảo sát hiện trạng · HĐ · Chờ xác nhận
  14:00–16:00 · Lê Mai · Review 3D · LP · Đã xác nhận
Row click → booking detail. Footer link “Xem lịch tuần →”

RIGHT stacked two cards:
“Việc khẩn” — 2 TaskCards:
  Gửi báo giá đợt 2 · urgent · overdue “Quá hạn 20 Th9” red · MT · customer Trần Đức Anh
  Chốt moodboard căn hộ Tây Hồ · high · due 25 Th9 · LP · Nguyễn Thu Hà
“Sự cố critical”
  Khách complain màu sơn lệch · critical · open · 3px red bar · 2h ago · Minh

FRAME Dashboard / empty
All KPI 0. Left EmptyState “Chưa có lịch hôm nay” CTA “Tạo lịch hẹn”. Right “Không có việc khẩn.”

FRAME Dashboard / loading
4 Stat skeleton (gray 12 + 28 bars). List 5 skeleton rows. No real numbers.

FRAME Dashboard / error
KPI placeholders —. Toast danger “Không tải được tổng quan. Thử lại.” + ghost button on canvas “Tải lại”

FRAME Dashboard / 375
Greeting + 2×2 KPI. Bookings list full width then tasks. Sidebar hidden; hamburger opens overlay drawer 240 from left, dim overlay, current item Tổng quan.
```

---

## PACK 4 — Customers + Services

```
PACK 0. Customer fields ONLY: name*, email, phone, notes. No address.

FRAME Customers / list populated /customers
H1 “Khách hàng” · Search 280 placeholder “Tên, email, SĐT…” · primary “Thêm khách”
Table width 100%:
  Tên (sort) · Email · SĐT · Ghi chú (truncate 40 chars + …) · Tạo lúc · (40px ⋯)
Rows:
  Nguyễn Thu Hà · thuha@gmail.com · 0901 234 567 · Căn hộ 2PN Tây Hồ… · 03 Th9 2026
  Trần Đức Anh · ducanh@… · 0912 345 678 · Nhà phố Long Biên… · 08 Th9 2026
  Lê Mai · lemai@… · 0987 654 321 · Studio Ba Đình… · 15 Th9 2026
⋯: Xem · Sửa · (no delete in v1)
Click name → detail. Sort caret on Tên default asc.
Footer “Hiển thị 1–3” Prev disabled Next disabled.
Search “Hà” filters to 1 row (show this as a variant frame).

FRAME Customers / empty
EmptyState user-plus “Chưa có khách hàng” · “Thêm khách để đặt lịch.” CTA “Thêm khách”

FRAME Customers / loading
Title+search+button real. Table 8 skeleton rows.

FRAME Customer create modal 480
Title “Thêm khách”
Họ tên* · Email · Số điện thoại helper “Không bắt buộc” · Ghi chú textarea 3 rows
Primary “Lưu” · ghost “Hủy”
Validation frame: name empty “Bắt buộc.” · email “abc” “Email không hợp lệ.”
Success: close modal, toast “Đã thêm Nguyễn Thu Hà”, row appears.

FRAME Customer edit
Same modal title “Sửa khách” · prefilled Hà · CTA “Cập nhật”

FRAME Customer detail /customers/:id  1440
Back “← Khách hàng”
Header card: 56 avatar initials NH · 20 “Nguyễn Thu Hà” · email · phone · notes paragraph
Actions: Sửa · “Tạo lịch hẹn” primary
Tabs: Lịch hẹn · Công việc · Tệp
Tab Lịch hẹn: mini table 3 bookings (same as dashboard for Hà — only 09:00 row)
Tab Công việc: moodboard task
Tab Tệp: dropzone + 2 files:
  grid image “mat-bang-tay-ho.jpg” 240px thumb
  list “hop-dong-draft.pdf” 220 KB · download icon
Empty tab: “Chưa có tệp.”

FRAME Services /services
H1 “Dịch vụ” · primary “Thêm dịch vụ”
Table: Tên · Thời lượng · Giá · Trạng thái · ⋯
  Tư vấn nội thất · 90 phút · 1.500.000 ₫ · switch ON · ⋯
  Khảo sát hiện trạng · 60 · 800.000 ₫ · ON
  Review 3D · 120 · 2.200.000 ₫ · ON
  Gói staging (ngưng) · 180 · 3.500.000 ₫ · OFF, entire row opacity 0.5, name muted + pill “Ngưng”
⋯ Sửa
Click switch OFF → confirm “Ngưng dịch vụ này? Lịch đã đặt không đổi.”

FRAME Service form modal 480
Title Thêm/Sửa
Tên* · Mô tả textarea · Thời lượng (phút)* number stepper default 60 · Giá (₫)* input formatted 1.500.000 · Active switch default on
Helper under giá: “Lưu nội bộ theo đồng (cents). UI luôn ₫.”
Validation: duration <15 → “Tối thiểu 15 phút.” price empty “Bắt buộc.”

FRAME Services empty
“Chưa có dịch vụ.” CTA Thêm.

MOBILE: tables scroll X, sticky Tên. Modals become full-screen sheets.
```

---

## PACK 5 — Bookings + Availability (flagship)

```
PACK 0. Flagship. Highest fidelity.

FRAME Bookings week /bookings · 1440×900
H1 “Lịch hẹn”
Toolbar: segmented Week | Day (Week selected) · date “21–27 Th9 2026” with ‹ › today button “Hôm nay”
Staff filter chips: Tất cả (selected) · Minh · Lan · Huy. Multi-select allowed; default Tất cả.
Legend pills small under toolbar.

Calendar:
Left time gutter 64px, 08:00–20:00, 30-min lines, 08:00–12:00 and 13:00–18:00 emphasized; 12:00–13:00 “Nghỉ” muted band.
Columns Mon–Sun 21–27 Th9. Today 22 column bg #EEF2FF 40%.
Working hours from availability: Minh 09:00–18:00 weekdays; outside hours bg #F3F4F6 diagonal hatch, not clickable.
Bookings as rounded 6px blocks, 4px left color = status, white text if confirmed indigo fill 90% else tint:
  Tue 22 09:00–10:30 block “Thu Hà · Tư vấn” confirmed indigo
  Tue 22 11:00–12:00 “Đức Anh · Khảo sát” pending gray
  Tue 22 14:00–16:00 “Lê Mai · 3D” confirmed
NO overlapping geometry.

Empty slot hover: dashed primary outline + cursor pointer. Click opens Create step 1 with that start_at prefilled.

FRAME Bookings day
One column 22 Th9, wider blocks, show staff name on block “Thu Hà · Tư vấn · Minh”. Same data.

FRAME Bookings / loading
Grid lines + 6 gray blocks random.

FRAME Bookings / empty week
No blocks. Hatch still. Empty overlay none — calendar stays; toolbar secondary hint “Chưa có lịch tuần này.”

FRAME Bookings / 375
Day view default (week is horizontal scroll 7 cols min-width 80 each). Filters in horizontal chip scroll. Hamburger shell.

CREATE BOOKING — right SlideOver 480, overlay, title “Tạo lịch hẹn” stepper 1–5 dots. Footer: secondary “Quay lại” (hidden on 1) + primary next/confirm. Close X.

FRAME Create / step 1 Service
List radio cards:
  Tư vấn nội thất · 90 phút · 1.500.000 ₫
  Khảo sát hiện trạng · 60 · 800.000 ₫
  Review 3D · 120 · 2.200.000 ₫
Inactive “Gói staging” not listed.
Selected: Tư vấn, border primary.
Primary “Tiếp tục”

FRAME Create / step 2 Staff
Radio rows avatar+name+role:
  Minh Trần · owner · “Rảnh khung này”
  Lan Phạm · admin · “Rảnh”
  Huy Đỗ · staff · muted “Bận 09:00–10:30” disabled if slot was 09:00 (for empty 15:00 all enabled)
Helper “Chỉ hiện người có lịch rảnh ngày đã chọn.”

FRAME Create / step 3 Slot
Mini day column. Available chips 30-min: 09:00, 09:30… except occupied+outside hours greyed “Đã kín” / “Ngoài giờ”.
Duration lock 90 min: selecting 09:00 highlights 09:00–10:30. If 09:30 occupied, 09:00 disabled “Không đủ 90 phút.”
Prefilled if came from empty-slot click.

FRAME Create / step 4 Customer
Search select. Results 3 customers. Button ghost “+ Khách mới” expands name*/phone/email inline (same validation as customer modal).
Selected Nguyễn Thu Hà chip.

FRAME Create / step 5 Confirm
Summary list: service, staff, 22 Th9 2026 09:00–10:30, customer, giá 1.500.000 ₫
Notes textarea
Primary “Xác nhận đặt lịch”
Loading “Đang tạo…”

FRAME Create / conflict
Toast + inline banner danger: “Nhân sự này đã có lịch trong khung giờ đó.”
Stay on step 3. Occupied slot now grey. Do not show two blocks overlapping.

FRAME Booking detail slide-over 480
Title “Lịch hẹn” · pill status
Rows: Khách Nguyễn Thu Hà (link) · Dịch vụ Tư vấn 90p · Nhân sự Minh · 22 Th9 2026 · 09:00–10:30 · Ghi chú “Mang moodboard v2”
Timeline vertical:
  03 Th9 10:12 Tạo · pending
  03 Th9 10:15 Minh xác nhận · confirmed
  (future) Hoàn tất
Actions row wrap:
  confirmed state: [Hoàn tất] primary · [Không đến] secondary · [Đổi lịch] secondary · [Hủy] danger
  pending: [Xác nhận] [Hủy]  (Hoàn tất and Không đến disabled tooltip “Chỉ sau khi xác nhận”)
  completed: all disabled, text “Đã hoàn tất”
  cancelled: all disabled

FRAME Cancel confirm modal
Title “Hủy lịch Thu Hà 09:00?”
Body “Email hủy sẽ gửi cho khách. Không hoàn tiền trong TeamOps (ghi chú nội bộ).”
Danger “Hủy lịch” · ghost “Giữ lịch”

FRAME Cancel / blocked
Hủy disabled. Tooltip 2-hour rule. Show a clock meta “Còn 1 giờ 12 phút — quá hạn hủy.”

FRAME Reschedule
Title “Đổi lịch”
Body banner warning “Tạo lịch mới; lịch 22 Th9 09:00 sẽ chuyển sang Đã hủy.”
Reuse steps 2–3 (keep service+customer locked).
CTA “Tạo lịch mới”
After success: old block cancelled red, new block pending.

FRAME Booking / no_show
From confirmed, “Không đến” confirm “Đánh dấu khách không đến?” Result pill Cam.

AVAILABILITY /settings/availability
H1 “Lịch rảnh” · subtitle “Lặp mỗi tuần. Calendar chỉ cho đặt trong các khoảng này.”
Staff tabs: Minh | Lan | Huy (Minh selected)
Grid 7 rows CN→T7 (day_of_week 0–6, CN first):
  CN: empty + ghost “Thêm khoảng” · muted “Nghỉ”
  T2–T6: 09:00–18:00 · delete icon
  T7: 09:00–13:00
Add range: start time · end time · Lưu. Invalid end≤start inline “Giờ kết thúc phải sau giờ bắt đầu.”
Two ranges same day allowed (e.g. 09:00–12:00 and 13:00–18:00) — show lunch gap.
Save bar sticky “Có thay đổi chưa lưu” · CTA Lưu · toast “Đã cập nhật lịch rảnh Minh.”
Staff Huy can only edit own tab; Minh/Lan can edit all (helper text).
```

---

## PACK 6 — Tasks

```
PACK 0. H1 “Công việc”. Primary “Thêm việc”.

FILTER BAR
Assignee select (Tất cả / Minh / Lan / Huy) · Priority · Due (date range) · Switch “Hiện việc đã hủy” default off.

KANBAN 4 columns equal, header count badge:
Cần làm (1) · Đang làm (1) · Review (1) · Xong (1)
Column bg #F5F5F7, cards white.

TaskCard 100% pad 12:
  title 14 medium
  row: priority pill · customer chip 12 · due 12
  bottom: avatar 20
  6 dots drag handle top-right

DATA (do not invent extras)
TODO: Gửi báo giá đợt 2 · urgent · Trần Đức Anh · due 20 Th9 RED “Quá hạn” · MT
IN_PROGRESS: Chốt moodboard căn hộ Tây Hồ · high · Nguyễn Thu Hà · 25 Th9 · LP
REVIEW: Model SketchUp phòng khách · medium · Lê Mai · 28 Th9 · HĐ
DONE: Gửi NDA · low · Nguyễn Thu Hà · 18 Th9 · MT · card 70% opacity
CANCELLED (only if switch on): Hủy survey lần 1 · gray strikethrough

FRAME Kanban populated 1440
Drag affordance: lifted card shadow, column dashed drop. Optimistic — card already in new column.

FRAME Kanban empty
4 columns with Empty “Thả việc vào đây” in each, plus page-level if literally 0 tasks: “Chưa có việc.” CTA Thêm.

FRAME Kanban loading
4 columns × 3 skeleton cards.

FRAME Kanban 375
Horizontal snap-scroll columns, min-width 280, dots indicator. Filters in a “Bộ lọc” bottom sheet.

FRAME Create task modal 480
Title* · Mô tả · Status default Cần làm · Priority default Trung bình · Assignee select · Customer optional · Due date
CTA Tạo. Title empty “Bắt buộc.”

FRAME Task slide-over 480
H2 title editable · pills status+priority
Fields: assignee · customer link · due (red if overdue)
Mô tả paragraph
Attachments dropzone + “moodboard-v2.png”
Activity (not a full chat): 12 muted
  18 Th9 09:00 Minh tạo việc
  19 Th9 14:22 Lan → Đang làm
Composer none except “Thêm ghi chú nội bộ” textarea + “Thêm” appends activity line.
Status select must follow any→any except we still allow all 5; cancelled via select + confirm “Hủy việc này?”
Footer delete none.

Confirm dialog when dragging to Xong: none (optimistic, no confirm). Drag to cancelled not possible; only filter+select.
```

---

## PACK 7 — Incidents

```
PACK 0. H1 “Sự cố”. Primary “Báo sự cố”.
Filters: Severity All/low/medium/high/critical · Status All/open/investigating/resolved/closed

FRAME List populated
Table: Sự cố · Mức độ · Trạng thái · Assignee · Tạo · SLA
Rows:
  Delay vật liệu đá ốp · high · investigating · Huy · 21 Th9 16:40 · MTTA 22m
  Khách complain màu sơn lệch · critical · open · Minh · 22 Th9 08:05 · MTTA — (chưa ack) · row bg #FFF5F5 · 3px left red
SLA hint column: “MTTA 22m” or “Chưa ack” danger if open+no events.

FRAME List empty
“Chưa có sự cố — tốt.” No CTA required; still show “Báo sự cố”.

FRAME Create modal 480
Tiêu đề* · Mô tả* · Severity select default medium · Assignee
Helper if critical: warning banner “Owner (Minh) sẽ được thông báo ngay.”
CTA “Tạo sự cố”

FRAME Detail /incidents/:id  critical 1440
Back ← Sự cố
Header: 3px red bar · 24 “Khách complain màu sơn lệch” · pills critical + open
Meta: Minh · 22 Th9 08:05 · “Owner đã được notify”
SLA cards 2: MTTA “—” · MTTR “—” (open)
Description paragraph “Khách Tây Hồ: màu sơn tường lệch moodboard v2.”
LEFT 64% Timeline append-only (cannot edit/delete items):
  08:05 Hệ thống · “Sự cố được tạo · critical · notify owner”
  08:12 Minh · “Đã gọi khách, hẹn kiểm tra 17:00”
Composer bottom: textarea “Thêm cập nhật” + attach · CTA “Thêm” · posts new TimelineItem with user+time
RIGHT 36% properties card: status select (open→investigating→resolved→closed; resolved sets resolved_at, show “Đóng lúc”) · assignee
Status to resolved confirm “Đánh dấu đã xử lý?”

FRAME Detail / investigating (đá ốp)
Same layout, no red page bg. Timeline 3 events. MTTA 22m · MTTR —.

MOBILE: list cards not table. Detail timeline full width, properties below.
```

---

## PACK 8 — Notifications + files

```
PACK 0.

BELL DROPDOWN 320×auto, align right under bell
Header “Thông báo” · unread “3 mới” · link “Xem tất cả”
5 max items (show 5, 3 unread):
NotifItem: 8px unread indigo dot · 16 type icon · title 14 · message 12 muted 2-line · time 12
  calendar-check · “Lịch đã xác nhận” · “Thu Hà · 22 Th9 09:00” · 2 giờ trước · UNREAD
  clock · “Nhắc lịch 24h” · “Mai · Review 3D ngày mai 14:00” · 3 giờ · UNREAD
  alert · “Sự cố nghiêm trọng” · “Màu sơn lệch” · 4 giờ · UNREAD
  check-square · “Việc được gán” · “Moodboard Tây Hồ → Lan” · 1 ngày · read (no dot, 70% title)
  receipt · “Hóa đơn đã thu” · “INV-2026-001 1.500.000 ₫” · 2 ngày · read
Footer “Xem tất cả”
Empty dropdown: “Không có thông báo.”

FRAME Notifications page /notifications
H1 · secondary “Đánh dấu đã đọc hết”
List 40px+ rows, unread row bg #F8F9FF.
Same 5 items, message full width, no truncate.
Click row → related entity (booking/task/incident/invoice) — show as prototype link.
Mark all: dots disappear, toast “Đã đọc hết.”

FILE COMPONENT states (put on a Foundations/Components page as variants, also on customer detail)
Dropzone 100% dashed #E5E7EB pad 24: icon · “Kéo thả hoặc bấm để tải” · “PNG, JPG, PDF, DOC, XLS · tối đa 10MB”
Hover: border primary
Progress: file name + bar 60% “1.2 / 2.0 MB”
Error: “File 12MB vượt quá 10MB.” danger
Reject type: “Định dạng .exe không hỗ trợ.”
Image gallery: 3-col thumbs 160, hover overlay download
Doc list: icon mime · name · size · download (arrow), never show signed querystring
```

---

## PACK 9 — Admin

```
PACK 0 Admin shell. User Minh.

FRAME Admin dashboard /admin/dashboard
H1 “Tổng quan admin”
KPI row 4 cards, equal width:
  1 Lịch — 3 numbers: hôm nay 3 · tuần 11 · tháng 9 42
  2 Doanh thu tháng 9 · 18.400.000 ₫ · +12% vs Th8 (green)
  3 Tỉ lệ hủy · 8%
  4 Sự cố mở · 2
Charts card row:
  Bar 30 days bookings, simple 12 bars, indigo, no 3D, y-axis 0–6, title “Lịch 30 ngày”
  Line revenue Th3–Th9, title “Doanh thu”
No gauges. No pie.

FRAME Reports /admin/reports
H1 “Báo cáo”
Controls: Date range 01 Th9 2026 – 22 Th9 2026 · Report type select:
  Lịch theo dịch vụ
  Doanh thu theo tuần
  Tỉ lệ hủy
  SLA sự cố
Buttons: Export PDF · Export CSV (both secondary/primary pair)
Table example type “Lịch theo dịch vụ”:
  Dịch vụ · Số lịch · Hoàn tất · Hủy · Doanh thu
  Tư vấn nội thất · 18 · 14 · 1 · 21.000.000 ₫
  Khảo sát · 12 · 10 · 1 · 8.000.000 ₫
  Review 3D · 12 · 8 · 2 · 17.600.000 ₫
FRAME Reports / queued
Buttons disabled. Banner info spinner “Đang tạo báo cáo… job trong hàng đợi. Trang này tự cập nhật.”
Do not design Horizon UI.

FRAME Bulk import /admin/import  (own page, also linked from Reports “Import khách”)
H1 “Import khách CSV”
Steps 1–3 horizontal.
Step 1: dropzone “CSV, tối đa 10MB” · helper columns required: name,email,phone,notes
Download link “Tải file mẫu”
Step 2 preview table 5 rows, invalid email row red “email không hợp lệ” on row 4
CTA “Bắt đầu import” 
Step 3 progress: bar 40% · “12 / 30 dòng · 1 lỗi” · list errors
Done: “28 khách mới, 2 bỏ qua.” CTA “Về khách hàng”

FRAME Invoices list /admin/invoices
H1 · primary “Tạo hóa đơn”
Filter status chips All/draft/sent/paid/overdue/cancelled
Table: Số · Khách · Lịch · Tiền · Trạng thái · Hạn · Thanh toán
  INV-2026-001 · Nguyễn Thu Hà · 22 Th9 Tư vấn · 1.500.000 ₫ · Đã thu · 30 Th9 · 20 Th9 11:02
  INV-2026-002 · Trần Đức Anh · 22 Th9 Khảo sát · 800.000 ₫ · Đã gửi · 30 Th9 · —
  INV-2026-003 · Lê Mai · 22 Th9 3D · 2.200.000 ₫ · Quá hạn · 15 Th9 · —  row bg #FFF5F5
  INV-2026-004 · Nguyễn Thu Hà · — · 0 ₫ · Nháp · — · —
Number format INV-YYYY-000
Click row → editor.

FRAME Invoice editor /admin/invoices/:id  INV-2026-002
Back. Header INV-2026-002 pill Đã gửi · customer · optional booking link
Line items table:
  Mô tả · SL · Đơn giá · Thành tiền · delete
  Khảo sát hiện trạng · 1 · 800.000 · 800.000
Ghost “+ Dòng”
Totals right: Tạm tính 800.000 · Thuế 0 ₫ helper “TeamOps không tính VAT trong v1” · Tổng 800.000 ₫
Due date datepicker 30 Th9 2026
Actions: Lưu nháp · Generate PDF · Gửi · Đánh dấu đã thu · Hủy HĐ (danger, confirm)
Paid state: paid_at shown, amounts locked.

FRAME Invoice PDF preview (A4 794×1123 frame)
Header logo AB + Atelier Bắc · địa chỉ “12 Ngõ 123, Tây Hồ, Hà Nội” (this address is org print block ONLY, not a customer field)
Invoice INV-2026-002 · Ngày 22 Th9 2026
Bill to Trần Đức Anh · email · phone
Table line items · Tổng 800.000 ₫
Footer “Cảm ơn quý khách.” · status watermark “ĐÃ GỬI” 10% opacity rotate -18°
Overdue variant watermark “QUÁ HẠN” red.

FRAME Send invoice modal
Title “Gửi INV-2026-002?”
To: ducanh@gmail.com (from customer, readonly) · subject “Hóa đơn INV-2026-002 — Atelier Bắc”
CTA Gửi · queued toast “Đã đưa vào hàng đợi gửi.”

FRAME Invoice empty list
“Chưa có hóa đơn.” CTA Tạo.

FRAME Audit log /admin/audit-log
H1 “Nhật ký” subtitle “Chỉ đọc. Không sửa, không xóa.”
Filters: User select · Action (create/update/delete/status_change/invite) · Entity (customer/booking/task/incident/invoice/member) · date range
Dense table 36px rows 13px font:
  22 Th9 08:05 · Minh Trần · create · incident · 7a1c… · expand ▸
  22 Th9 07:50 · Lan Phạm · status_change · booking · 3e9a… 
  21 Th9 16:40 · Huy Đỗ · create · incident · …
  20 Th9 11:02 · Minh · status_change · invoice · INV-2026-001 paid
NO edit/delete icons anywhere.
Expand row 2:
JSON pretty, 12px mono, bg #F5F5F7:
{
  "status": { "from": "sent", "to": "paid" },
  "paid_at": "2026-09-20T11:02:00+07:00"
}
Staff cannot open this page → 403.

ADMIN 375: KPI 2×2, charts full width scroll, tables X-scroll.
```

---

## PACK 10 — Chrome variants + prototype

```
PACK 0.

FRAME Shell / sidebar collapsed 1440
Sidebar 64, icons only, tooltip on hover with label. Logo TO centered. Header unchanged.

FRAME Shell / staff Huy
Nav without Thành viên. Avatar menu without Admin panel. Bell badge 1.

FRAME ConfirmDialog component
480, title, body, danger+ghost. Used by: hủy lịch, gỡ member, ngưng dịch vụ, hủy việc, đánh dấu resolved, hủy HĐ.

TOAST catalog (component page, 4 items stacked)
Success green “Đã thêm Nguyễn Thu Hà”
Info “Đang tạo báo cáo…”
Danger “Nhân sự này đã có lịch trong khung giờ đó.”
Default “Đã đọc hết.”

PROTOTYPE FLOWS (link frames)
1 Login → Dashboard populated
2 Dashboard “Xem lịch tuần” → Bookings week → click 15:00 empty → Create s1–s5 → back to week with new pending block
3 Week click Thu Hà block → detail → Hủy → confirm → cancelled
4 Tasks: drag Moodboard to Review
5 Incidents list critical row → detail → add timeline comment
6 Bell → notifications page
7 Avatar Admin panel → admin dashboard → invoices → INV-2026-002 → PDF preview → Gửi modal
8 Huy session → 403 on /admin
9 Org switcher
10 Collapse sidebar

FIGMA PAGES
0 Cover: TeamOps · Atelier Bắc · 1440 + 375 · date 22 Th9 2026
1 Foundations (tokens, type, pills, icons)
2 Components
3 Auth + system
4 App shell + org
5 Dashboard
6 Customers + Services
7 Bookings + Availability
8 Tasks
9 Incidents
10 Notifications + files
11 Admin
12 Mobile 375
13 Prototype

Cover frame 1440×900: TO mark, TeamOps, “Operations for studios”, 3 screenshot thumbs (calendar, kanban, invoice).
```

---

## Checklist frame (nghiệm thu)

Mọi frame phải có: auto-layout, named layers, Vietnamese copy đúng bảng tenant, pills, 1 trạng thái loading/empty nếu là list.

| Pack | Frames bắt buộc |
|---|---|
| 0 | Tokens, pills, shells, switcher, components |
| 1 | Login×4, Register, Forgot×2, Reset, 404, 403, session |
| 2 | Create org, Members, empty, invite, remove, role, profile, staff 403 |
| 3 | Dashboard populated/empty/loading/error/375 |
| 4 | Customers list/empty/loading/search, create, edit, validation, detail; Services list/form/empty/inactive |
| 5 | Week, day, loading, 375, create 1–5, conflict, detail, cancel, cancel-blocked, reschedule, no_show, availability |
| 6 | Kanban, empty, loading, 375, create, slide-over |
| 7 | List, empty, create, detail critical, detail investigating |
| 8 | Bell, page, dropzone variants |
| 9 | Admin dash, reports, queued, import 3 steps, invoices, editor, PDF, send, audit+expand |
| 10 | Collapsed, staff shell, toasts, prototype links |
