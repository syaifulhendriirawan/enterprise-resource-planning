# Product Requirements Document (PRD)
## Sistem ERP Sederhana untuk Bisnis Menengah ke Bawah

---

**Versi:** 1.0  
**Tanggal:** 26 Februari 2026  
**Status:** Draft  
**Tipe Proyek:** Portfolio / Local Development  

---

## 1. Ringkasan Proyek

### 1.1 Deskripsi
Sistem ERP (Enterprise Resource Planning) berbasis web yang dirancang untuk membantu bisnis menengah ke bawah dalam mengelola operasional sehari-hari, mencakup penjualan, pembelian, inventori, dan keuangan dalam satu platform terintegrasi.

### 1.2 Tujuan
- Membangun sistem ERP fungsional yang mendemonstrasikan kemampuan full-stack development.
- Mengintegrasikan modul bisnis inti dalam arsitektur yang bersih dan maintainable.
- Menjadi portofolio yang mencerminkan pemahaman domain bisnis dan teknis.

### 1.3 Ruang Lingkup
Proyek ini berjalan secara **lokal (localhost)** dan tidak mencakup proses deployment ke server produksi. Fokus utama adalah fungsionalitas, kualitas kode, dan arsitektur sistem.

---

## 2. Tech Stack

### 2.1 Frontend
| Komponen | Teknologi | Keterangan |
|---|---|---|
| Framework | Next.js (App Router) | SSR + Client Components |
| UI Library | shadcn/ui + Tailwind CSS | Komponen yang konsisten |
| State Management | Zustand | Ringan, cocok untuk skala ini |
| Data Fetching | TanStack Query (React Query) | Caching & sinkronisasi data |
| Form Handling | React Hook Form + Zod | Validasi form yang type-safe |
| Tabel & Grafik | TanStack Table + Recharts | Data grid dan visualisasi |
| HTTP Client | Axios | Komunikasi ke API |

### 2.2 Backend
| Komponen | Teknologi | Keterangan |
|---|---|---|
| Framework | FastAPI | Python, async, auto docs |
| ORM | SQLAlchemy | Async ORM |
| Migrasi DB | Alembic | Versioning skema database |
| Validasi | Pydantic | Schema & validasi data |
| Autentikasi | python-jose + passlib | JWT Token |

### 2.3 Database & Infrastruktur
| Komponen | Teknologi | Keterangan |
|---|---|---|
| Database | PostgreSQL | RDBMS utama |
| Containerisasi | Docker + Docker Compose | Menjalankan semua service lokal |

### 2.4 Struktur Direktori

```
erp/
├── docker-compose.yml
├── frontend/                  # Next.js App
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── sales/
│   │   │   ├── purchases/
│   │   │   ├── inventory/
│   │   │   ├── finance/
│   │   │   └── reports/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/               # shadcn components
│   │   └── shared/           # Custom shared components
│   ├── lib/
│   │   ├── api/              # Axios instances & endpoints
│   │   ├── hooks/            # Custom hooks
│   │   └── stores/           # Zustand stores
│   └── types/                # TypeScript types
│
└── backend/                   # FastAPI App
    ├── app/
    │   ├── api/
    │   │   └── v1/
    │   │       ├── auth.py
    │   │       ├── dashboard.py
    │   │       ├── sales.py
    │   │       ├── purchases.py
    │   │       ├── inventory.py
    │   │       └── finance.py
    │   ├── core/
    │   │   ├── config.py
    │   │   ├── database.py
    │   │   └── security.py
    │   ├── models/            # SQLAlchemy models
    │   ├── schemas/           # Pydantic schemas
    │   ├── services/          # Business logic
    │   └── main.py
    ├── alembic/
    └── requirements.txt
```

---

## 3. Modul & Fitur

### 3.1 Autentikasi & Manajemen User

**Deskripsi:** Sistem login dan manajemen akses pengguna.

**Fitur:**
- Login dengan username & password
- JWT-based authentication (Access Token + Refresh Token)
- Role-based access control (RBAC) dengan 3 role: `owner`, `admin`, `staff`
- Halaman profil pengguna
- Manajemen user (tambah, edit, nonaktifkan) — hanya `owner`

**Tabel Database:**
```
users: id, username, email, password_hash, full_name, role, is_active, created_at
```

**Permission Matrix:**
| Fitur | Owner | Admin | Staff |
|---|---|---|---|
| Semua Modul | ✅ | ✅ | ✅ (read only default) |
| Manajemen User | ✅ | ❌ | ❌ |
| Laporan Keuangan | ✅ | ✅ | ❌ |
| Hapus Data | ✅ | ✅ | ❌ |

---

### 3.2 Dashboard

**Deskripsi:** Halaman utama berisi ringkasan bisnis secara real-time.

**Fitur:**
- Summary card: Total penjualan hari ini, total pembelian bulan ini, jumlah stok kritis, saldo kas
- Grafik penjualan 30 hari terakhir (line chart)
- 5 transaksi penjualan terbaru
- 5 produk dengan stok di bawah minimum
- Quick actions: Buat Invoice, Tambah Stok

**API Endpoint:**
```
GET /api/v1/dashboard/summary
GET /api/v1/dashboard/sales-chart?range=30
GET /api/v1/dashboard/low-stock
```

---

### 3.3 Manajemen Inventori (Stok)

**Deskripsi:** Pengelolaan produk dan pergerakan stok.

**Fitur:**

*Produk:*
- CRUD produk (nama, SKU, kategori, harga beli, harga jual, satuan)
- Upload foto produk (opsional, simpan lokal)
- Manajemen kategori produk
- Filter & pencarian produk

*Stok:*
- Melihat stok saat ini per produk
- Atur stok minimum per produk (trigger notifikasi)
- Riwayat pergerakan stok (masuk dari pembelian, keluar dari penjualan, penyesuaian manual)
- Stock adjustment (tambah/kurangi stok manual dengan keterangan alasan)

**Tabel Database:**
```
categories: id, name, description
products: id, sku, name, category_id, buy_price, sell_price, unit, min_stock, current_stock, image_path, is_active
stock_movements: id, product_id, type (in/out/adjustment), quantity, reference_id, reference_type, notes, created_at, created_by
```

**API Endpoint:**
```
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}
GET    /api/v1/products/{id}/stock-movements
POST   /api/v1/stock/adjustment
GET    /api/v1/categories
POST   /api/v1/categories
```

---

### 3.4 Penjualan (Sales)

**Deskripsi:** Pengelolaan transaksi penjualan dari order hingga pembayaran.

**Fitur:**

*Pelanggan (Customer):*
- CRUD data pelanggan (nama, telepon, email, alamat)
- Riwayat transaksi per pelanggan

*Sales Order & Invoice:*
- Buat penjualan baru: pilih pelanggan (atau walk-in), tambah produk & qty, hitung otomatis subtotal, diskon, dan total
- Invoice otomatis terbuat saat penjualan di-save
- Status invoice: `draft`, `unpaid`, `partial`, `paid`, `cancelled`
- Pencatatan pembayaran (partial payment support)
- Cetak/export invoice ke PDF
- Daftar invoice dengan filter status, tanggal, pelanggan
- Stok otomatis berkurang saat invoice berstatus `paid`

**Tabel Database:**
```
customers: id, name, phone, email, address, created_at
sales_orders: id, order_number, customer_id, order_date, subtotal, discount, total, status, notes, created_by
sales_order_items: id, order_id, product_id, qty, unit_price, discount, subtotal
payments_in: id, order_id, amount, payment_method, payment_date, notes, created_by
```

**API Endpoint:**
```
GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/sales
POST   /api/v1/sales
GET    /api/v1/sales/{id}
PUT    /api/v1/sales/{id}/status
POST   /api/v1/sales/{id}/payment
GET    /api/v1/sales/{id}/invoice-pdf
```

---

### 3.5 Pembelian (Purchasing)

**Deskripsi:** Pengelolaan pembelian produk dari supplier.

**Fitur:**

*Supplier:*
- CRUD data supplier (nama, kontak, alamat)

*Purchase Order:*
- Buat purchase order: pilih supplier, tambah produk & qty, hitung total
- Status PO: `draft`, `ordered`, `received`, `cancelled`
- Penerimaan barang (Goods Receipt): konfirmasi barang diterima → stok otomatis bertambah
- Pencatatan tagihan dari supplier
- Status tagihan: `unpaid`, `partial`, `paid`
- Pencatatan pembayaran ke supplier

**Tabel Database:**
```
suppliers: id, name, contact_name, phone, email, address, created_at
purchase_orders: id, po_number, supplier_id, order_date, subtotal, total, status, notes, created_by
purchase_order_items: id, po_id, product_id, qty, unit_price, subtotal
goods_receipts: id, po_id, receipt_date, notes, created_by
goods_receipt_items: id, receipt_id, product_id, qty_received
payments_out: id, po_id, amount, payment_method, payment_date, notes, created_by
```

**API Endpoint:**
```
GET    /api/v1/suppliers
POST   /api/v1/suppliers
GET    /api/v1/purchases
POST   /api/v1/purchases
GET    /api/v1/purchases/{id}
PUT    /api/v1/purchases/{id}/status
POST   /api/v1/purchases/{id}/receive
POST   /api/v1/purchases/{id}/payment
```

---

### 3.6 Keuangan (Finance)

**Deskripsi:** Pencatatan arus kas dan laporan keuangan sederhana.

**Fitur:**
- Manajemen akun kas (misal: Kas Toko, Bank BCA, Dana)
- Pencatatan transaksi manual (non-penjualan/pembelian): biaya operasional, pemasukan lain-lain
- Melihat saldo per akun kas
- Laporan arus kas (cash flow) per periode
- Ringkasan hutang (ke supplier) dan piutang (dari pelanggan)

**Tabel Database:**
```
cash_accounts: id, name, type (cash/bank), balance, is_active
journal_entries: id, date, description, type (income/expense), amount, cash_account_id, category, reference, created_by
```

**API Endpoint:**
```
GET    /api/v1/finance/accounts
POST   /api/v1/finance/accounts
GET    /api/v1/finance/transactions
POST   /api/v1/finance/transactions
GET    /api/v1/finance/summary
GET    /api/v1/finance/payables        # Hutang ke supplier
GET    /api/v1/finance/receivables     # Piutang dari pelanggan
```

---

### 3.7 Laporan (Reports)

**Deskripsi:** Laporan bisnis yang bisa difilter dan diekspor.

**Laporan yang tersedia:**
- Laporan Penjualan (per periode, per produk, per pelanggan)
- Laporan Pembelian (per periode, per supplier)
- Laporan Stok (stok saat ini, stok kritis, pergerakan stok)
- Laporan Laba Rugi sederhana (pendapatan - HPP - biaya operasional)
- Laporan Piutang & Hutang

**Fitur export:** Download laporan ke format CSV atau PDF.

**API Endpoint:**
```
GET /api/v1/reports/sales?start_date=&end_date=&format=json|csv
GET /api/v1/reports/purchases?start_date=&end_date=&format=json|csv
GET /api/v1/reports/inventory?format=json|csv
GET /api/v1/reports/profit-loss?start_date=&end_date=
GET /api/v1/reports/receivables
GET /api/v1/reports/payables
```

---

## 4. Database Schema (Ringkasan)

```
┌──────────────┐     ┌───────────────────┐     ┌─────────────┐
│    users     │     │   sales_orders    │     │  customers  │
├──────────────┤     ├───────────────────┤     ├─────────────┤
│ id (PK)      │     │ id (PK)           │────▶│ id (PK)     │
│ username     │     │ order_number      │     │ name        │
│ email        │     │ customer_id (FK)  │     │ phone       │
│ password_hash│     │ total             │     │ email       │
│ role         │     │ status            │     │ address     │
└──────────────┘     │ created_by (FK)   │     └─────────────┘
                     └───────────────────┘

┌──────────────┐     ┌───────────────────┐     ┌─────────────┐
│   products   │     │purchase_orders    │     │  suppliers  │
├──────────────┤     ├───────────────────┤     ├─────────────┤
│ id (PK)      │     │ id (PK)           │────▶│ id (PK)     │
│ sku          │     │ po_number         │     │ name        │
│ name         │     │ supplier_id (FK)  │     │ phone       │
│ category_id  │     │ total             │     │ email       │
│ buy_price    │     │ status            │     │ address     │
│ sell_price   │     │ created_by (FK)   │     └─────────────┘
│ current_stock│     └───────────────────┘
│ min_stock    │
└──────────────┘
```

---

## 5. Antarmuka Pengguna (UI/UX)

### 5.1 Layout
- **Sidebar navigasi** di kiri dengan ikon dan label modul
- **Header** berisi nama user, notifikasi stok kritis, dan tombol logout
- **Breadcrumb** untuk navigasi halaman bertingkat
- **Responsive** untuk layar desktop dan tablet (mobile bukan prioritas)

### 5.2 Halaman Utama per Modul
Setiap modul memiliki pola konsisten:
1. **List Page** — tabel data dengan filter, search, dan pagination
2. **Detail Page** — tampilan detail satu record dengan aksi (edit, hapus, cetak)
3. **Form Page** — form tambah/edit data

### 5.3 Komponen UI Standar
- Data Table dengan sorting, filter, dan pagination (TanStack Table)
- Modal/Dialog untuk konfirmasi aksi
- Toast notification untuk feedback (sukses/error)
- Loading skeleton saat data di-fetch
- Empty state saat data kosong

---

## 6. API Design

### 6.1 Standar Response
```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Berhasil"
}

// Pagination
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}

// Error
{
  "success": false,
  "message": "Pesan error",
  "detail": [ ... ]   // Opsional, untuk validasi error
}
```

### 6.2 Autentikasi
Semua endpoint (kecuali `/auth/login`) memerlukan header:
```
Authorization: Bearer <access_token>
```

### 6.3 Base URL
```
Backend API: http://localhost:8000/api/v1
Frontend:    http://localhost:3000
API Docs:    http://localhost:8000/docs  (Swagger UI otomatis dari FastAPI)
```

---

## 7. Setup & Cara Menjalankan

### 7.1 Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### 7.2 Docker Compose Services
```yaml
# docker-compose.yml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: erp_db
      POSTGRES_USER: erp_user
      POSTGRES_PASSWORD: erp_password
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql+asyncpg://erp_user:erp_password@db/erp_db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
```

### 7.3 Langkah Menjalankan
```bash
# 1. Clone repository
git clone <repo-url>
cd erp-system

# 2. Jalankan semua service
docker-compose up -d

# 3. Jalankan migrasi database
docker-compose exec backend alembic upgrade head

# 4. Seed data awal (user default, kategori, dll)
docker-compose exec backend python seed.py

# 5. Akses aplikasi
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

**Default Login:**
```
Username: admin
Password: admin123
```

---

## 8. Milestones & Prioritas Pengerjaan

### Phase 1 — Fondasi (Week 1-2)
- [ ] Setup project structure (Next.js + FastAPI + PostgreSQL via Docker)
- [ ] Implementasi autentikasi (login, JWT, RBAC)
- [ ] Layout dasar frontend (sidebar, header, routing)
- [ ] Database schema & migrasi Alembic

### Phase 2 — Core Business (Week 3-4)
- [ ] Modul Inventori (CRUD produk, kategori, stok)
- [ ] Modul Penjualan (pelanggan, invoice, pembayaran)
- [ ] Modul Pembelian (supplier, PO, penerimaan barang)

### Phase 3 — Financial & Reporting (Week 5)
- [ ] Modul Keuangan (kas, jurnal)
- [ ] Dashboard dengan grafik
- [ ] Laporan dasar (penjualan, pembelian, stok)

### Phase 4 — Polishing (Week 6)
- [ ] Export PDF untuk invoice
- [ ] Export CSV untuk laporan
- [ ] Notifikasi stok kritis
- [ ] Seed data demo yang realistis
- [ ] README dokumentasi

---

## 9. Keterbatasan & Out of Scope

Hal-hal berikut **sengaja tidak dimasukkan** untuk menjaga scope tetap manageable:

- ❌ Deployment ke cloud (fokus lokal)
- ❌ Modul Payroll / Penggajian
- ❌ Multi-cabang / Multi-gudang
- ❌ Point of Sale (POS) / kasir
- ❌ Integrasi payment gateway
- ❌ Email notification
- ❌ Audit log lengkap
- ❌ Mobile app
- ❌ Multi-currency
- ❌ Akuntansi double-entry penuh

---

## 10. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope creep — terus menambah fitur | Proyek tidak selesai | Patuhi batas fitur di PRD ini |
| Kompleksitas relasi antar modul | Bug pada stok & keuangan | Buat unit test untuk business logic kritis |
| State management frontend kompleks | Performa lambat, bug | Gunakan React Query sebagai sumber kebenaran data |

---

*Dokumen ini adalah panduan hidup — dapat diperbarui seiring progres pengerjaan.*
