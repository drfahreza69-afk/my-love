# REZA NEVERMIND • Sovereign Edition

Aplikasi ruang personal, sistem disiplin harian, manajemen target tabungan, arsip catatan Document Control (DC), galeri sinematik, statistik analitik, dan jadwal ibadah untuk **Daffa Rifki Fahreza**.

Repositori ini dirancang agar **siap di-upload langsung ke GitHub** dan **siap di-deploy otomatis ke Railway** (maupun **GitHub Pages**).

---

## Struktur Berkas Repositori

* `index.html` — Aplikasi utama **REZA NEVERMIND** (lengkap dengan seluruh foto asli, data, navigasi tab sebelah kiri, warna latar Terang Elegan / Hitam Elegan, serta modul sinkronisasi Cloud Railway).
* `server.js` — Server produksi Node.js (tanpa dependensi eksternal) dengan kompresi otomatis **Brotli/Gzip**, endpoint healthcheck `/api/health`, serta **API Sinkronisasi Cloud** (`/api/state`) yang menyimpan progres ke `data/cloud-state.json`.
* `package.json` — Konfigurasi proyek Node.js untuk Railway.
* `railway.json` & `nixpacks.toml` — Konfigurasi otomatis deployment Railway (`startCommand: "node server.js"` & `healthcheckPath: "/api/health"`).
* `Procfile` — Kompatibilitas proses web (`web: node server.js`).
* `manifest.json` — Manifest PWA agar aplikasi dapat diinstal ke layar utama ponsel/desktop.

---

## Cara Upload ke GitHub

### Opsi 1: Upload Langsung Lewat Browser (Tanpa Terminal)
1. Ekstrak seluruh isi file ZIP **`reza-nevermind-github-railway.zip`** ke sebuah folder di komputer/HP Anda.
2. Buka [github.com/new](https://github.com/new) dan buat repositori baru (misalnya `reza-nevermind`).
3. Klik tautan **uploading an existing file**, lalu tarik (*drag & drop*) semua file (`index.html`, `server.js`, `package.json`, `railway.json`, `nixpacks.toml`, `Procfile`, `manifest.json`, `.gitignore`, `README.md`) ke halaman tersebut.
4. Klik **Commit changes**.

### Opsi 2: Menggunakan Terminal (Git CLI)
```bash
git init
git add .
git commit -m "Deploy REZA NEVERMIND Sovereign Edition"
git branch -M main
git remote add origin https://github.com/USERNAME/reza-nevermind.git
git push -u origin main
```

---

## Cara Deploy ke Railway

1. Masuk ke [railway.app](https://railway.app) menggunakan akun GitHub Anda.
2. Klik **New Project** → pilih **Deploy from GitHub repo**.
3. Pilih repositori **`reza-nevermind`** yang sudah Anda buat.
4. Railway akan otomatis membaca `package.json` dan `railway.json`, lalu menjalankan `node server.js`.
5. Setelah status menjadi **Active (Hijau)**, buka tab **Settings** → bagian **Networking (Public Networking)** → klik **Generate Domain** untuk mendapatkan link publik aplikasi Anda (misalnya `https://reza-nevermind-production.up.railway.app`).
6. *(Opsional — Penyimpanan Cloud Permanen)*: Agar data sinkronisasi server (`/api/state`) tidak ter-reset saat redeploy, klik kanan pada canvas Railway → **Add Volume** → hubungkan ke service Anda dengan **Mount Path**: `/app/data`.

---

## Cara Mengaktifkan GitHub Pages (Alternatif Gratis Tanpa Server)

Karena file utama sudah bernama `index.html` di root repositori, Anda juga dapat mengaktifkan **GitHub Pages**:
1. Buka repositori Anda di GitHub → klik **Settings** → **Pages**.
2. Pada bagian **Build and deployment**, pilih **Deploy from a branch** → pilih branch `main` dan folder `/ (root)` → klik **Save**.

---

## Akses Login Pemilik (Admin / Commander)

* **PIN / Password Akses Pemilik Bawaan:** `18082004` *(tidak memerlukan ID/Username, cukup masukkan kode PIN `18082004`)*.
* **Mode Tamu:** Klik tombol **Masuk Sebagai Tamu** pada layar pembuka untuk menjelajahi aplikasi dalam mode baca-saja.
