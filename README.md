# Portfolio Website — Cloudflare Pages + R2 + D1

Website portfolio modern yang berjalan **100% di Cloudflare**:

| Komponen | Layanan Cloudflare |
|---|---|
| Hosting website statis | **Pages** (folder `public/`) |
| API serverless | **Pages Functions** (folder `functions/`) |
| Database (proyek & pesan kontak) | **D1** (binding `DB`) |
| Penyimpanan file/gambar | **R2** (binding `ASSETS`) |

## Struktur proyek

```
portfolio-website/
├── public/                 # Website statis (HTML/CSS/JS)
│   ├── index.html          # Halaman utama portfolio
│   ├── admin.html          # Panel admin (kelola proyek, pesan, upload)
│   ├── styles.css
│   ├── app.js
│   └── admin.js
├── functions/              # Pages Functions (API)
│   ├── api/projects.js         → GET daftar proyek (D1)
│   ├── api/projects/[id].js    → PUT / DELETE proyek (admin)
│   ├── api/messages.js         → POST pesan kontak (D1), GET daftar (admin)
│   ├── api/messages/[id].js    → DELETE pesan (admin)
│   ├── api/upload.js           → POST upload file (admin → R2)
│   ├── api/files/[key].js      → GET file dari R2
│   └── lib/util.js             → utilitas bersama (auth, binding)
├── migrations/
│   └── 0001_init.sql       # Skema D1 + data contoh
└── wrangler.toml           # Konfigurasi binding R2 & D1
```

Endpoint admin dilindungi token (`ADMIN_TOKEN`) via header `x-admin-token`.

## Prasyarat

- Node.js 18+
- Akun Cloudflare (gratis cukup)
- Wrangler sudah termasuk di `devDependencies`

## Langkah setup (sekali saja)

### 1. Login ke Cloudflare

```bash
npx wrangler login
```

### 2. Buat database D1

```bash
npm run db:create
# → catat "database_id" yang muncul, lalu tempel ke wrangler.toml (ganti GANTI_DENGAN_D1_DATABASE_ID)
```

### 3. Buat bucket R2

```bash
npm run r2:create
```

### 4. Jalankan migrasi database

```bash
npm run db:migrate:remote
```

### 5. Set token admin (rahasia)

```bash
npm run secret:admin
# → masukkan token acak yang kuat, mis. hasil dari: openssl rand -hex 32
```

### 6. Deploy

```bash
npm install
npm run deploy
```

Wrangler akan memberikan URL seperti `https://portfolio-website.pages.dev`.

> **Catatan:** Jika kamu deploy via **integrasi GitHub di dashboard Cloudflare Pages** (bukan via CLI),
> binding D1 & R2 diatur di dashboard: **Pages → project → Settings → Bindings**,
> dan secret `ADMIN_TOKEN` di **Settings → Environment variables**.

## Development lokal

```bash
npm install
npm run db:migrate:local   # siapkan D1 lokal
npm run dev                # http://localhost:8788
```

Untuk halaman admin lokal, set token via file `.dev.vars` (jangan di-commit):

```
ADMIN_TOKEN=token-lokal-kamu
```

## Cara pakai halaman admin

1. Buka `https://<domain-kamu>/admin.html`
2. Masukkan `ADMIN_TOKEN`
3. Tambah/ubah/hapus proyek — otomatis tampil di halaman utama
4. Upload gambar proyek ke R2 — URL-nya otomatis terisi
5. Lihat & hapus pesan yang masuk dari formulir kontak

## Keamanan

- Token admin hanya disimpan sebagai **secret** di Cloudflare, tidak di repo.
- Upload dibatasi 10 MB dan hanya di folder `uploads/` di R2.
- Input formulir divalidasi & di-escape untuk mencegah XSS.
