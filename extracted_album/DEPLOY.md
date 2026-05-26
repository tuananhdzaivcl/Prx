# Hướng dẫn Deploy lên Vercel

## Yêu cầu trước khi deploy

### 1. PostgreSQL database
Cần 1 database PostgreSQL. Khuyến nghị dùng **Neon** (miễn phí):
- Vào https://neon.tech → tạo tài khoản → tạo project mới
- Copy **Connection string** (dạng `postgresql://...`)

### 2. Vercel Blob (lưu ảnh upload)
- Vào Vercel Dashboard → project → Storage → Create Database → Blob
- Vercel tự inject `BLOB_READ_WRITE_TOKEN` vào environment

---

## Bước 1 – Upload code lên GitHub

```bash
# Giải nén file zip vào 1 thư mục
# Sau đó chạy trong thư mục đó:

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

---

## Bước 2 – Deploy trên Vercel

1. Vào https://vercel.com → **Add New Project** → chọn repo GitHub
2. Trong phần **Configure Project**:
   - **Root Directory**: để trống (hoặc `.` nếu yêu cầu)
   - **Framework Preset**: Other
   - Các lệnh build đã có trong `vercel.json`, Vercel sẽ tự đọc
3. Thêm **Environment Variables** (bắt buộc):

| Tên biến | Giá trị |
|---|---|
| `DATABASE_URL` | Connection string từ Neon hoặc PostgreSQL khác |
| `SESSION_SECRET` | Chuỗi bất kỳ dài ≥ 32 ký tự (vd: dùng `openssl rand -hex 32`) |
| `NODE_ENV` | `production` |

4. Nhấn **Deploy**

---

## Bước 3 – Tạo bảng database (chỉ làm 1 lần)

Sau khi deploy xong, chạy SQL này trên Neon Dashboard (SQL Editor):

```sql
-- Bảng members
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bảng photos (có cột is_approved mới)
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  caption TEXT,
  uploader_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Thêm is_approved nếu bảng photos đã tồn tại từ trước
ALTER TABLE photos ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;
```

---

## Bước 4 – Tạo tài khoản admin đầu tiên

Chạy SQL này (thay `tenAdmin` và hash mật khẩu):

```sql
-- Ví dụ tạo admin với password = "admin123" (hash bằng bcrypt rounds=10)
-- Tốt nhất: đăng ký qua web rồi chạy lệnh này để set admin
UPDATE members SET is_admin = true WHERE username = 'tenAdmin';
```

---

## Lệnh build (chạy trên máy local)

```bash
# Cài dependencies
pnpm install

# Build frontend
pnpm --filter @workspace/lop9a2 run build
# Output: artifacts/lop9a2/dist/public/

# Build API server
pnpm --filter @workspace/api-server run build
# Output: artifacts/api-server/dist/index.mjs

# Typecheck toàn bộ
pnpm run typecheck
```

---

## Xử lý lỗi thường gặp

### ❌ Build lỗi: "Cannot find module '@workspace/db'"
```bash
pnpm install  # chạy lại để cài workspace packages
```

### ❌ Lỗi: "DATABASE_URL must be set"
→ Kiểm tra lại Environment Variables trong Vercel Dashboard

### ❌ Lỗi: "SESSION_SECRET environment variable is required"
→ Thêm `SESSION_SECRET` vào Environment Variables

### ❌ Upload ảnh không hoạt động trên Vercel
→ Cần bật **Vercel Blob**:
- Vercel Dashboard → Storage → Blob → Create Store
- Vercel sẽ tự inject `BLOB_READ_WRITE_TOKEN`

### ❌ Session bị mất khi reload (người dùng bị logout liên tục)
→ Bảng sessions chưa được tạo. Chạy SQL sau:
```sql
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
```
*(Thông thường `connect-pg-simple` tự tạo bảng này, nhưng nếu không thì chạy tay)*

### ❌ Deploy lại sau khi thay đổi code
```bash
git add .
git commit -m "mô tả thay đổi"
git push
# Vercel tự động deploy lại khi có push lên main
```
