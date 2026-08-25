# 💰 FinAgenda Web — Platform Manajemen Keuangan Pribadi

> Aplikasi web modern untuk manajemen keuangan pribadi & agenda, dibangun dengan **Next.js 16**, **Tailwind CSS v4**, dan terkoneksi ke **REST API Go** sebagai backend.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 📊 **Dashboard Analytics** | Ringkasan keuangan, grafik arus kas gelombang (area chart), filter tanggal & cut-off period |
| 💳 **Manajemen Transaksi** | Catat pemasukan & pengeluaran, kelola kategori custom |
| 💰 **Budget Bulanan** | Set anggaran per kategori, monitoring sisa budget real-time |
| 📈 **Laporan Keuangan** | Ikhtisar & cashflow bulanan / harian |
| 📑 **Detail Alokasi Kas** | Audit lengkap kemana uang pergi — tabel kategori + itemized ledger, export PDF & Excel |
| 📅 **Agenda & Kalender** | Reminder agenda keuangan & jadwal |
| 🏦 **Tabungan Bersama** | Kelola goals tabungan, setor & tarik dana |
| 👥 **Pusat Kontak** | Daftar kontak terkait keuangan |
| ⚙️ **Pengaturan** | Profil akun, ganti password, cut-off payroll |
| 🌙 **Dark / Light Mode** | Toggle tema gelap & terang |
| ⏳ **Loading Skeleton** | Animasi skeleton glassmorphism di semua halaman |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **UI**: [Tailwind CSS v4](https://tailwindcss.com) + Custom Glassmorphism Design System
- **Charts**: [Recharts](https://recharts.org) — Smooth AreaChart
- **Icons**: [Lucide React](https://lucide.dev)
- **HTTP Client**: [Axios](https://axios-http.com)
- **Export**: [jsPDF](https://github.com/parallax/jsPDF) + [SheetJS (xlsx)](https://sheetjs.com)
- **Auth**: JWT via Cookie (`js-cookie`)
- **Backend**: [keuangan-go-api](https://github.com/MuhRidwaan/keuangan-go-api) — REST API Go + Fiber + GORM + PostgreSQL (Neon)

---

## 🚀 Cara Menjalankan Lokal

### 1. Clone repo

```bash
git clone https://github.com/MuhRidwaan/keuangan-web.git
cd keuangan-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Buat file environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Untuk development lokal (pastikan Go API berjalan di port 8080)
NEXT_PUBLIC_API_URL=http://localhost:8080

# Untuk production
# NEXT_PUBLIC_API_URL=https://keuangan-go-api.vercel.app
```

### 4. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🌐 Deploy ke Vercel

1. Push repo ke GitHub
2. Buka [vercel.com](https://vercel.com) → **Add New Project** → Import repo ini
3. Tambahkan **Environment Variable** di Vercel dashboard:

```
NEXT_PUBLIC_API_URL = https://keuangan-go-api.vercel.app
```

4. Klik **Deploy** ✅

---

## 📁 Struktur Folder

```
keuangan-web/
├── app/
│   ├── (auth)/              # Login, Register, Forgot Password
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   └── (dashboard)/         # Halaman utama (protected)
│       ├── dashboard/
│       ├── transactions/
│       ├── budget/
│       ├── reports/
│       │   └── details/     # Detail Alokasi Kas (Tabel)
│       ├── agendas/
│       ├── savings/
│       ├── contacts/
│       └── settings/
├── components/
│   ├── layout/              # Header, Sidebar
│   ├── providers/           # ThemeProvider, ToastProvider
│   └── ui/                  # Card, Button, Input, Badge, Modal, Skeleton
├── lib/
│   ├── api.ts               # Axios instance
│   ├── auth.ts              # JWT auth helper
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # formatIDR, getCutOffPeriod, dll
└── public/                  # Static assets
```

---

## 🔗 Repository Terkait

- 🦾 **Backend Go API**: [MuhRidwaan/keuangan-go-api](https://github.com/MuhRidwaan/keuangan-go-api) — REST API menggunakan Go + Fiber + GORM + PostgreSQL
- 📱 **Mobile Flutter**: [MuhRidwaan/finance_agenda_app](https://github.com/MuhRidwaan/finance_agenda_app) — Aplikasi mobile Flutter

---

## 👤 Author

**M Ridwan** — [@MuhRidwaan](https://github.com/MuhRidwaan)