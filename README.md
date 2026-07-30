# Koperasi Simpan Pinjam — KPRI MTSn 3 Padang

Sistem Informasi Koperasi Simpan Pinjam berbasis Web dibangun menggunakan **Laravel 13**, **PHP 8.5**, **Inertia.js v3**, **React 19**, **TypeScript**, **Tailwind CSS**, **PostgreSQL 18**, dan **Service Layer**.

## 🛠️ Stack Teknologi

- **Backend**: Laravel 13 (PHP 8.5) + Eloquent ORM + Service Layer
- **Frontend**: Inertia.js v3 + React 19 + TypeScript (Strict Mode) + Tailwind CSS v4
- **Database**: PostgreSQL 18
- **Web Server**: Nginx Reverse Proxy ke PHP-FPM 8.5
- **Domain Development**: `koperasi.test`

---

## 🏗️ Pola Arsitektur Dependensi

Aplikasi menggunakan alur dependensi ketat:
```text
React 19 / Inertia.js v3 → Laravel Controller → Service Layer → Eloquent ORM / Query Object → PostgreSQL 18
                                ↓
                     Domain Calculator / DTO / Enum
```

### Aturan Utama:
1. **Controller**: Menerima request, mengecek otorisasi endpoint, memanggil Service Layer, dan mengembalikan `Inertia::render()`.
2. **Service Layer**: Mengorkestrasikan use case, transaksi database (`DB::transaction`), row locking, idempotency, dan audit log.
3. **Domain Calculator**: Pure function murni untuk kalkulasi bunga flat dan alokasi angsuran tanpa dependensi UI atau database.
4. **Eloquent Model**: Digunakan untuk representasi entitas dan query database PostgreSQL 18.

---

## 🚀 Panduan Setup Development

### 1. Prasyarat
- PHP 8.5+
- Composer 2.10+
- Node.js 22+ & npm 9+
- PostgreSQL 18+
- Nginx dengan konfigurasi `koperasi.test.conf`

### 2. Langkah Instalasi
```bash
# Clone & masuk folder proyek
cd /home/naval/www/koperasi.test

# Instalasi dependensi PHP & Node
composer install
npm install

# Konfigurasi environment
cp .env.example .env
php artisan key:generate

# Build aset frontend
npm run build
```

### 3. Perintah Pengujian & Linting
```bash
# Build frontend Vite
npm run build

# TypeScript strict type-check
npx tsc --noEmit

# Pint PHP code formatter
composer run lint
```
