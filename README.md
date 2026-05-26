
# Sistem Web Sederhana

Stack: Node.js + Express + SQLite

Aplikasi: Warehouse inventory sederhana dengan field nama, SKU, kuantitas, dan lokasi.

Setup lokal:

```powershell
cd Sample
npm install
npm start
```

Lalu buka http://localhost:3000

Test otomatis (lokal):

```powershell
cd Sample
npm test
```

CI: repository sudah menyertakan GitHub Actions workflow di `.github/workflows/ci.yml` yang menjalankan `npm test` pada push dan pull request (menggunakan `DB_PATH=':memory:'` dan `NODE_ENV=test`).

Migrasi database:

1. Letakkan file SQL migrasi di folder `migrations/` dengan nama berformat `NNN_description.sql`.
2. Jalankan migrasi:

```powershell
cd Sample
npm run migrate
# atau gunakan DB_PATH custom: DB_PATH=./prod.db npm run migrate
```

Skrip migrasi mencatat file yang sudah dijalankan di tabel `migrations` sehingga tidak akan dijalankan ulang.

Seed data contoh:

```powershell
cd Sample
npm run seed
# untuk mengosongkan tabel terlebih dulu: SEED_FORCE=1 npm run seed
```

Script `scripts/seed.js` menambahkan 10 item contoh ke tabel `items` dengan kategori dan supplier.

Export CSV:

- Gunakan tombol `Export CSV` di halaman untuk mengunduh seluruh data yang sesuai filter saat ini.


