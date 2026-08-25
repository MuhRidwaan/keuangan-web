# ðŸ’° FinAgenda Web â€” Platform Manajemen Keuangan Pribadi

> Aplikasi web modern untuk manajemen keuangan pribadi & agenda, dibangun dengan **Next.js 16**, **Tailwind CSS v4**, dan terkoneksi ke **REST API Go** sebagai backend.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

---

## âœ¨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| ðŸ“Š **Dashboard Analytics** | Ringkasan keuangan, grafik arus kas gelombang (area chart), filter tanggal & cut-off period |
| ðŸ’³ **Manajemen Transaksi** | Catat pemasukan & pengeluaran, kelola kategori custom |
| ðŸ’° **Budget Bulanan** | Set anggaran per kategori, monitoring sisa budget real-time |
| ðŸ“ˆ **Laporan Keuangan** | Ikhtisar & cashflow bulanan / harian |
| ðŸ“‘ **Detail Alokasi Kas** | Audit lengkap kemana uang pergi â€” tabel kategori + itemized ledger, export PDF & Excel |
| ðŸ“… **Agenda & Kalender** | Reminder agenda keuangan & jadwal |
| ðŸ¦ **Tabungan Bersama** | Kelola goals tabungan, setor & tarik dana |
| ðŸ‘¥ **Pusat Kontak** | Daftar kontak terkait keuangan |
| âš™ï¸ **Pengaturan** | Profil akun, ganti password, cut-off payroll |
| ðŸŒ™ **Dark / Light Mode** | Toggle tema gelap & terang |
| â³ **Loading Skeleton** | Animasi skeleton glassmorphism di semua halaman |

---

## ðŸ› ï¸ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **UI**: [Tailwind CSS v4](https://tailwindcss.com) + Custom Glassmorphism Design System
- **Charts**: [Recharts](https://recharts.org) â€” Smooth AreaChart
- **Icons**: [Lucide React](https://lucide.dev)
- **HTTP Client**: [Axios](https://axios-http.com)
- **Export**: [jsPDF](https://github.com/parallax/jsPDF) + [SheetJS (xlsx)](https://sheetjs.com)
- **Auth**: JWT via Cookie (`js-cookie`)
- **Backend**: [keuangan-go-api](https://github.com/MuhRidwaan/keuangan-go-api) â€” REST API Go + Fiber + GORM + PostgreSQL (Neon)

---

## ðŸš€ Cara Menjalankan Lokal

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

## ðŸŒ Deploy ke Vercel

1. Push repo ke GitHub
2. Buka [vercel.com](https://vercel.com) â†’ **Add New Project** â†’ Import repo ini
3. Tambahkan **Environment Variable** di Vercel dashboard:

```
NEXT_PUBLIC_API_URL = https://keuangan-go-api.vercel.app
```

4. Klik **Deploy** âœ…

---

## ðŸ“ Struktur Folder

```
financeagenda-web/
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ (auth)/              # Login, Register, Forgot Password
â”‚   â”‚   â”œâ”€â”€ login/
â”‚   â”‚   â”œâ”€â”€ register/
â”‚   â”‚   â””â”€â”€ forgot-password/
â”‚   â””â”€â”€ (dashboard)/         # Halaman utama (protected)
â”‚       â”œâ”€â”€ dashboard/
â”‚       â”œâ”€â”€ transactions/
â”‚       â”œâ”€â”€ budget/
â”‚       â”œâ”€â”€ reports/
â”‚       â”‚   â””â”€â”€ details/     # Detail Alokasi Kas (Tabel)
â”‚       â”œâ”€â”€ agendas/
â”‚       â”œâ”€â”€ savings/
â”‚       â”œâ”€â”€ contacts/
â”‚       â””â”€â”€ settings/
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ layout/              # Header, Sidebar
â”‚   â”œâ”€â”€ providers/           # ThemeProvider, ToastProvider
â”‚   â””â”€â”€ ui/                  # Card, Button, Input, Badge, Modal, Skeleton
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ api.ts               # Axios instance
â”‚   â”œâ”€â”€ auth.ts              # JWT auth helper
â”‚   â”œâ”€â”€ types.ts             # TypeScript types
â”‚   â””â”€â”€ utils.ts             # formatIDR, getCutOffPeriod, dll
â””â”€â”€ public/                  # Static assets
```

---

## ðŸ”— Repository Terkait

- ðŸ¦¾ **Backend Go API**: [MuhRidwaan/keuangan-go-api](https://github.com/MuhRidwaan/keuangan-go-api) â€” REST API menggunakan Go + Fiber + GORM + PostgreSQL
- ðŸ“± **Mobile Flutter**: [MuhRidwaan/finance_agenda_app](https://github.com/MuhRidwaan/finance_agenda_app) â€” Aplikasi mobile Flutter

---

## ðŸ‘¤ Author

**M Ridwan** â€” [@MuhRidwaan](https://github.com/MuhRidwaan)