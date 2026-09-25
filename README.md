# 🏥 Bệnh viện Đa khoa Hưng Lợi - Web Management System

## 🚀 Cài đặt & Chạy

```bash
npm install
npm run dev
```

## 🗄️ Database Setup

Dự án dùng **SQLite** (`hospital.db`) cho môi trường dev.

### Tạo Database & Seed dữ liệu lần đầu
```bash
# 1. Tạo schema database
npx prisma db push

# 2. Seed toàn bộ dữ liệu (khoa, nhân sự, phòng...)
npm run seed
# hoặc
node prisma/seed.js
```

### Reset & Seed lại từ đầu
```bash
# Xóa database cũ và tạo lại
del hospital.db
npx prisma db push
npm run seed
```

## 👤 Tài khoản mặc định

| Role | Email | Mật khẩu |
|---|---|---|
| Admin | admin@bvhungloi.vn | Admin@123 |
| Bác sĩ/Y tá/NV | *(tạo tự động)* | password123 |

## 📊 Dữ liệu mẫu (sau khi seed)

- 🏢 **50** Khoa/Phòng ban
- 👨‍⚕️ **~467** Bác sĩ
- 👩‍⚕️ **~807** Y tá
- 👨‍💼 **~220** Nhân viên/KTV/Dược sĩ/Kế toán
- 🏥 **~3007** Phòng bệnh (Thường / Dịch vụ / VIP)
- 🛏️ **~11754** Giường bệnh
- 🛎️ **~5928** Tiện nghi VIP/Dịch vụ

### Giá phòng bệnh
| Loại | Giá/ngày | Giường/phòng | Tiện nghi |
|---|---|---|---|
| Phòng thường | 200.000đ | 4-6 giường | — |
| Phòng dịch vụ | 600.000đ | 2 giường | Điều hòa, Tivi, Wifi |
| Phòng VIP | 1.500.000đ | 1 giường | Đầy đủ cao cấp |

## ⚠️ Lưu ý khi deploy lên web

SQLite **không phù hợp cho production**. Khi deploy lên Vercel/Railway:
1. Chuyển `DATABASE_URL` sang **PostgreSQL** (Neon, Supabase miễn phí)
2. Cập nhật `prisma/schema.prisma`: `provider = "postgresql"`
3. Chạy `npx prisma migrate deploy`
4. Chạy `npm run seed` để nạp dữ liệu

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Auth**: NextAuth v5 (Auth.js)
- **ORM**: Prisma v7 + better-sqlite3
- **Database**: SQLite (dev) → PostgreSQL (prod)
- **UI**: Vanilla CSS + Recharts
