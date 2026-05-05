# Rencana Pengembangan Sistem Client Zone & Billing

## 1. Ringkasan Proyek
Sistem portal klien (Client Zone) dan *billing* untuk manajemen pesanan layanan IT (Hosting, VPS, dll). Sistem ini memfasilitasi klien publik untuk mendaftar, memilih paket, dan melakukan pembayaran otomatis melalui integrasi Xendit. Sisi *provisioning* server (seperti pengaturan di Coolify, alokasi VPS, atau setup environment lainnya) akan dilakukan secara manual oleh Admin setelah pembayaran terkonfirmasi.

## 2. Tech Stack Terpilih

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + Shadcn UI (New York style) |
| Database | Cloud Firestore (Firebase) |
| Auth | Firebase Authentication |
| Payment | Xendit (`xendit-node`) — Create Invoice API + Webhook |
| Email | Nodemailer (SMTP) or Firebase Extensions — untuk notifikasi aktivasi |
| Hashing | N/A (Handled by Firebase Auth) |

> [!IMPORTANT]
> **Firebase Project required.** Pastikan sudah membuat project di Firebase Console. Sediakan konfigurasi (API Key, Project ID, dll) di file `.env.local`.

> [!IMPORTANT]
> **Xendit API Key.** Untuk fase pembayaran, diperlukan `XENDIT_SECRET_KEY` dan `XENDIT_WEBHOOK_TOKEN` dari dashboard Xendit.

## 3. Desain Antarmuka (UI/UX)
Mengacu pada referensi UI yang rapi, sistem akan dibagi menjadi dua area utama:

### 3.1. Client Area (Sisi Pengguna Publik)
* **Layout Utama:**
    * **Sidebar Navigasi Kiri:** Berisi menu "Dashboard", "All Product", dan pengelompokan layanan (Domain, Hosting, VPS, dll) beserta *badge* angka jumlah layanan aktif.
    * **Top Bar:** Profil pengguna, bahasa, dan keranjang pesanan.
    * **Main Content:** Menampilkan tabel data yang bersih (*clean table*).
* **Tabel Layanan (List all products & services):**
    * Kolom yang ditampilkan: `Product or Services` (Nama Paket + Domain), `Price` (Harga & Siklus), `Due Date`, `Status` (Active, Pending, Suspended), dan `Action` (Tombol Manage).
    * Dilengkapi filter jumlah *entries*, pencarian nama domain, dan filter *Status*.
* **Halaman Manage Layanan:** Menampilkan detail kredensial server (IP, Username, URL panel) setelah status diubah menjadi *Active* oleh Admin.

### 3.2. Admin Dashboard
* Dashboard operasional dengan menu manajemen Master Data, Klien, Transaksi (Invoices), dan **Provisioning Queue** (Layanan yang sudah dibayar tapi belum disetup).

## 4. Spesifikasi Fitur Inti

### A. Modul Master Data Paket (Dinamis)
* **Create/Edit Paket:** Admin dapat membuat paket baru secara dinamis (contoh: "VPS Cloud 2GB", "Hosting Basic").
* **Atribut Paket:** 
    * Nama Layanan
    * Kategori (VPS, Hosting, Email, Other)
    * Harga Dasar & Siklus (Bulanan/Tahunan)
    * Deskripsi Spesifikasi (RAM, Storage, Bandwidth)

### B. Modul Registrasi & Pesanan (Checkout Flow)
* **Public Catalog:** Pengunjung dapat melihat daftar paket yang tersedia dari Master Data.
* **Order Form:** Pengunjung memasukkan identitas/login dan nama domain atau identitas server yang diinginkan.
* **Invoice Generation:** Sistem membuat *Order Record* dengan status `Unpaid` dan langsung menembak API Xendit untuk membuat tautan pembayaran.

### C. Modul Pembayaran (Otomasi Xendit)
* **Xendit Invoice Link:** Klien menerima URL untuk membayar pesanan melalui metode pilihan (VA, QRIS, e-Wallet).
* **Webhook Listener:** Endpoint backend `POST /api/webhooks/xendit` yang mendengarkan *callback* sukses dari Xendit.
* **State Update:** Saat Webhook menerima status `PAID`, sistem otomatis mengubah status Invoice menjadi `Paid`. Status Layanan (Order) otomatis berubah menjadi **`On Process`** atau **`Pending Setup`**.

### D. Modul Manual Provisioning (Sisi Admin)
* **Queue Notification:** Admin melihat daftar layanan dengan status `On Process`.
* **Eksekusi Manual:** Admin mengalokasikan server, membuat *container* (misal via Coolify), atau setup VPS.
* **Aktivasi & Handover:** 1. Admin masuk ke halaman edit layanan klien tersebut.
    2. Admin mengubah status menjadi **`Active`**.
    3. Admin memasukkan detail kredensial server (IP Address, Control Panel URL, Username, Password).
    4. Sistem mengirimkan Email "Layanan Aktif" beserta instruksi login ke klien.

## 5. Skema Database (Firestore)

1.  **users (Collection):** `uid`, `name`, `email`, `role` (ADMIN/CLIENT), `phone`, `company`, `createdAt`.
2.  **products (Collection):** `id`, `name`, `category`, `description`, `price`, `billing_cycle`, `createdAt`.
3.  **orders (Collection):** `id`, `user_id`, `product_id`, `domain_name`, `status` (Unpaid, On Process, Active, Suspended, Cancelled), `due_date`, `server_credentials` (Map), `createdAt`.
4.  **invoices (Collection):** `id`, `order_id`, `xendit_invoice_url`, `xendit_invoice_id`, `total_amount`, `status` (Pending, Paid, Expired), `paid_at`, `createdAt`.

## 6. Rencana Fase Pengerjaan (Milestones)

* **Fase 1: Setup & Master Data**
    * Inisialisasi Next.js, Tailwind, Shadcn, dan Firebase.
    * Auth System (Firebase Auth).
    * CRUD Master Data Produk oleh Admin.

clientzone/
├── firebase/
│   ├── config.ts              # Client-side Firebase config
│   └── admin.ts               # Server-side Firebase Admin SDK
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (font, theme provider)
│   │   ├── page.tsx               # Landing / redirect
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (client)/              # Client area (protected)
│   │   │   ├── layout.tsx         # Sidebar + TopBar layout
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── services/page.tsx  # All Products & Services table
│   │   │   ├── services/[id]/page.tsx  # Manage single service
│   │   │   ├── orders/page.tsx    # Order history
│   │   │   └── orders/[id]/page.tsx    # Invoice detail
│   │   ├── (admin)/               # Admin area (protected, role=ADMIN)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── products/page.tsx       # CRUD Master Data
│   │   │   ├── products/new/page.tsx
│   │   │   ├── products/[id]/edit/page.tsx
│   │   │   ├── clients/page.tsx        # Client list
│   │   │   ├── invoices/page.tsx       # All invoices
│   │   │   ├── provisioning/page.tsx   # Queue (status=ON_PROCESS)
│   │   │   └── provisioning/[id]/page.tsx  # Activate + enter credentials
│   │   ├── catalog/page.tsx       # Public catalog (browse plans)
│   │   ├── checkout/page.tsx      # Checkout flow
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts      # Custom session handler if needed
│   │       │   └── logout/route.ts
│   │       ├── products/route.ts
│   │       ├── products/[id]/route.ts
│   │       ├── orders/route.ts
│   │       ├── orders/[id]/route.ts
│   │       ├── invoices/route.ts
│   │       ├── invoices/[id]/route.ts
│   │       ├── clients/route.ts
│   │       ├── webhooks/xendit/route.ts   # Xendit webhook
│   │       └── provisioning/[id]/route.ts
│   ├── components/
│   │   ├── ui/                    # Shadcn components
│   │   ├── layout/
│   │   │   ├── client-sidebar.tsx
│   │   │   ├── admin-sidebar.tsx
│   │   │   └── top-bar.tsx
│   │   ├── forms/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── product-form.tsx
│   │   │   ├── checkout-form.tsx
│   │   │   └── provisioning-form.tsx
│   │   ├── auth/
│   │   │   └── auth-provider.tsx   # Client-side Auth context
│   │   ├── tables/
│   │   │   ├── services-table.tsx
│   │   │   ├── products-table.tsx
│   │   │   ├── invoices-table.tsx
│   │   │   ├── clients-table.tsx
│   │   │   └── provisioning-table.tsx
│   │   └── shared/
│   │       ├── status-badge.tsx
│   │       ├── data-table.tsx     # Reusable table w/ filter, search, pagination
│   │       ├── page-header.tsx
│   │       └── empty-state.tsx
│   ├── lib/
│   │   ├── firebase/              # Firebase services helpers
│   │   │   ├── firestore.ts
│   │   │   └── auth.ts
│   │   ├── xendit.ts              # Xendit client helper
│   │   ├── email.ts               # Nodemailer helper
│   │   ├── utils.ts               # cn() + formatters
│   │   └── validators.ts          # Zod schemas
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   └── use-data-table.ts
│   └── types/
│       └── index.ts               # Shared TypeScript types
├── .env.example
├── .env.local
├── next.config.ts
├── package.json
├── tsconfig.json
└── components.json                # Shadcn config

* **Fase 2: Katalog & Pemesanan Publik**
    * Halaman etalase produk untuk publik.
    * Alur Checkout untuk Klien.
* **Fase 3: Integrasi Pembayaran**
    * Koneksi API Xendit (Generate Invoice).
    * Setup Webhook Xendit untuk auto-update status pembayaran.
* **Fase 4: Client Zone & Admin Provisioning**
    * Slicing UI Dashboard Klien (Sidebar, Tabel Layanan dengan status).
    * Sistem antrean *On Process* di sisi Admin.
    * Form input kredensial manual oleh Admin dan perilisan layanan menjadi *Active*.