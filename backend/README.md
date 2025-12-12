# Library Management Backend (Pyramid)

Sistem perpustakaan sederhana dengan autentikasi Member/Librarian, katalog buku, peminjaman, pengembalian, dan riwayat.

## Teknologi
- Python 3.x
- Pyramid
- SQLAlchemy 2.x + zope.sqlalchemy
- Alembic
- PostgreSQL
- Waitress (dev server)

## Struktur
```
backend/
  app/
    models/
    views/
    __init__.py
    routes.py
  alembic/
    env.py
    script.py.mako
    versions/
  development.ini
  requirements.txt
  alembic.ini
```

## Menjalankan secara lokal
1. Install terlebih dahulu PostgresSQL di local komputer
2. Buat user dan database bernama `library_db`
3. Clone project github ini, kemudian masuk ke dalam folder `backend`
4. Buat dan aktifkan virtualenv di folder `backend`
  ```bash
  # MacOS or Linux
  python -m venv .venv
  source .venv/bin/activate
  ```
5. Install dependensi: 
  ```bash
  pip install -r requirements.txt
  ```
6. Ubah konfigurasi koneksi database di `development.ini` dan `alembic.ini` di variable `sqlalchemy.url`. Sesuaikan `user` dan `password` nya.
  ```bash
  # development.ini
  sqlalchemy.url = postgresql+psycopg2://user:password@localhost:5432/library_db
  # alembic.ini
  sqlalchemy.url = postgresql+psycopg2://user:password@localhost:5432/library_db
  ```
7. Inisialisasi tabel/migrasi:
   ```bash
   alembic upgrade head
   ```
8. Jalankan server:
   ```bash
   pserve development.ini --reload
   ```
9. API tersedia di `http://localhost:6543`.

## Endpoint utama
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/books`, `POST /api/books`, `GET/PUT/DELETE /api/books/{id}`
- `POST /api/borrow/{book_id}`
- `POST /api/return/{borrowing_id}`
- `GET /api/borrowings` (aktif dengan `?active=true`)
- `GET /api/history`

Header auth: `Authorization: Bearer <token>`

## Migrasi Alembic
- Buat revisi baru: `alembic revision -m "message"`
- Terapkan migrasi: `alembic upgrade head`
- Rollback: `alembic downgrade -1`

## Catatan
- Batas pinjam: 3 buku aktif, durasi 14 hari, denda 5000/hari terlambat.
- Secret JWT/token: ubah `auth.secret` di `development.ini`.
- Tambah fitur lanjutan (reservasi, review) dapat dibuat di modul views/models baru.
