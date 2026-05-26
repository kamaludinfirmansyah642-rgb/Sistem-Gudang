# Sistem Gudang

Aplikasi web manajemen inventaris gudang sederhana built dengan Node.js, Express, dan SQLite.

## Fitur utama

- CRUD inventaris barang (Create, Read, Update, Delete)
- Pencarian dan penyaringan barang berdasarkan nama, SKU, lokasi, kategori, dan supplier
- Sorting dan pagination daftar barang
- Statistik ringkas: total item, stok total, stok rendah, jumlah supplier
- Export data ke CSV sesuai filter saat ini
- Dashboard stok dengan visualisasi 5 barang teratas berdasarkan kuantitas
- Dukungan migrasi DB dan seed data contoh
- Testing otomatis dengan Jest + Supertest
- Workflow CI GitHub Actions untuk menjalankan test pada push dan pull request

## Teknologi

- Node.js
- Express
- SQLite
- Vanilla JavaScript
- Tailwind CSS (via CDN)
- Jest
- Supertest
- GitHub Actions

## Cara menjalankan

1. Clone repository:

```powershell
git clone https://github.com/kamaludinfirmansyah642-rgb/Sistem-Gudang.git
cd Sistem-Gudang
```

2. Install dependensi:

```powershell
npm install
```

3. Jalankan migrasi database (opsional):

```powershell
npm run migrate
```

4. Seed data contoh (opsional):

```powershell
npm run seed
```

5. Jalankan server:

```powershell
npm start
```

6. Buka browser:

```text
http://localhost:3000
```

## Testing

Jalankan test unit dan integrasi dengan:

```powershell
npm test
```

## Struktur proyek

- `server.js` — backend Express + API endpoint
- `public/` — frontend static assets
- `public/index.html` — antarmuka aplikasi
- `public/app.js` — logika client-side
- `public/style.css` — styling tambahan
- `scripts/migrate.js` — migrasi database otomatis
- `scripts/seed.js` — seed data inventaris contoh
- `migrations/` — file SQL migrasi
- `tests/` — test API
- `.github/workflows/ci.yml` — GitHub Actions workflow

## Deployment

Aplikasi ini siap untuk di-deploy pada platform hosting Node.js yang mendukung SQLite, contohnya Render atau Railway.

Saran deployment:

- Pastikan file `data.db` dapat ditulis oleh environment deployment
- Atur `DB_PATH` jika database perlu disimpan di lokasi tertentu

## Catatan untuk portofolio

Proyek ini menunjukkan kemampuan dalam:

- membangun full-stack web app sederhana
- mendesain UI modern dengan Tailwind CSS
- membuat API RESTful dan database SQLite
- menulis test otomatis dan mengonfigurasi CI
- membuat dokumentasi dan pipeline deployment

## Kontak

Jika ingin mengembangkan fitur lebih lanjut, tambahkan:

- login / autentikasi admin
- import data CSV / XLSX
- analytics stok dan nilai persediaan
- notifikasi stok rendah otomatis


