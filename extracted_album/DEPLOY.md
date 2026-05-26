# Hướng dẫn Deploy lên Netlify

## Yêu cầu
- Tài khoản Netlify (miễn phí)
- PostgreSQL database (Neon, Supabase, hoặc Railway — đều có free tier)

---

## Bước 1: Tạo Database PostgreSQL

### Dùng Neon (khuyến nghị, miễn phí)
1. Vào https://neon.tech → Tạo tài khoản → New Project
2. Copy **Connection string** dạng:
   ```
   postgresql://user:password@host/dbname?sslmode=require
   ```

### Tạo bảng (chạy trong SQL Editor của Neon/Supabase)
```sql
CREATE TABLE IF NOT EXISTS "photos" (
  "id" serial PRIMARY KEY,
  "filename" text NOT NULL,
  "original_name" text NOT NULL,
  "caption" text,
  "uploaded_by" text,
  "is_approved" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY,
  "username" text NOT NULL UNIQUE,
  "password_hash" text NOT NULL,
  "is_admin" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now()
);

-- Tạo tài khoản admin (mật khẩu mặc định: admin123)
INSERT INTO "users" ("username", "password_hash", "is_admin")
VALUES ('admin', '$2b$10$X4kv7j5ZcG39WgURi1HdHOxpWDrQJpFzknWhKaJOIdz1cFHpEwdFe', true);
```

---

## Bước 2: Deploy lên Netlify

### Cách A: Kéo thả (nhanh nhất)
1. Vào https://app.netlify.com → **Add new site** → **Deploy manually**
2. Kéo thả **toàn bộ thư mục source code** vào ô drop zone
3. Chờ Netlify tự build (~2-3 phút)

### Cách B: Từ GitHub
1. Push code lên GitHub
2. Netlify → **Add new site** → **Import an existing project** → chọn repo
3. Cấu hình build (Netlify tự đọc từ `netlify.toml`, không cần nhập tay)

---

## Bước 3: Cấu hình Environment Variables

Vào **Site settings** → **Environment variables** → Thêm 3 biến bắt buộc:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` |
| `SESSION_SECRET` | Chuỗi ngẫu nhiên dài ít nhất 32 ký tự |
| `NODE_ENV` | `production` |

Biến tuỳ chọn (để lưu ảnh lên cloud):

| Key | Value |
|-----|-------|
| `BLOB_READ_WRITE_TOKEN` | Token từ Vercel Blob Storage |

### Tạo SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Bước 4: Lưu trữ ảnh

### Lựa chọn 1: Vercel Blob (khuyến nghị)
1. Vào https://vercel.com → Tạo tài khoản miễn phí
2. Dashboard → **Storage** → **Create** → **Blob**
3. Copy `BLOB_READ_WRITE_TOKEN` → thêm vào Netlify environment variables

### Lựa chọn 2: Không cài Blob
- Ảnh lưu tạm trong bộ nhớ của serverless function
- **Sẽ bị mất khi function restart** — chỉ dùng để test

---

## Sau khi deploy thành công

1. Truy cập URL của site (VD: `https://ten-site.netlify.app`)
2. Vào `/admin/login` → đăng nhập: `admin` / `admin123`
3. **Đổi mật khẩu ngay** sau khi vào được trang admin

---

## Lệnh build (test trên máy local)

```bash
# Cài dependencies
pnpm install --no-frozen-lockfile

# Build frontend
pnpm --filter './artifacts/lop9a2' run build
# Output: artifacts/lop9a2/dist/public/
```

---

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| Function timeout | Database kết nối chậm | Kiểm tra DATABASE_URL |
| 500 khi login | SESSION_SECRET chưa set | Thêm env var |
| Ảnh không hiển thị | Chưa cài BLOB_READ_WRITE_TOKEN | Xem Bước 4 |
| Session mất liên tục | DATABASE_URL sai | Kiểm tra lại connection string |
