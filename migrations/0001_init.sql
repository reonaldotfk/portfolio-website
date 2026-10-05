-- Migrasi awal: tabel proyek & pesan kontak
-- Dijalankan dengan: wrangler d1 migrations apply portfolio_db --remote

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tech TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Data contoh (hapus/ganti dari halaman /admin.html setelah deploy)
INSERT INTO projects (title, description, tech, url, image) VALUES
  ('Website Portfolio', 'Template portfolio modern dengan Cloudflare Pages, R2 untuk file, dan D1 untuk data.', 'HTML, CSS, JS, Cloudflare', 'https://github.com/reonaldotfk/portfolio-website', ''),
  ('API Serverless', 'REST API tanpa server menggunakan Cloudflare Pages Functions dan database D1 di edge.', 'Cloudflare Workers, D1, R2', '', '');
