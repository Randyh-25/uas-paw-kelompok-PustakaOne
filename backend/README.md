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
1. Buat dan aktifkan virtualenv di folder `backend`.
2. Buat virtual environment
    ```bash
    python -m venv venv 
    ``` 
    Aktifkan virtual environment:
    ```bash
    # Untuk Windows
    venv\Scripts\activate
    # Untuk macOS/Linux
    source venv/bin/activate
    ```
3. Install dependensi: `pip install -r requirements.txt`
4. Setel koneksi database di `development.ini` (`sqlalchemy.url`). Pastikan database PostgreSQL sudah dibuat.
5. Inisialisasi tabel/migrasi:
   ```bash
   alembic upgrade head
   ```
6. Install dependensi proyek:
   ```bash
   pip install -e .
7. Jalankan server:
   ```bash
   pserve development.ini --reload
   ```
8. API tersedia di `http://localhost:6543`.

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
