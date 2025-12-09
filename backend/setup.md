# Backend Setup

Step-by-step to get the Pyramid + PostgreSQL backend running, plus the routes the frontend will call.

## Prerequisites
- Python 3.10+ (tested with CPython)
- PostgreSQL running locally (adjust connection in `development.ini` / `alembic.ini`)
- PowerShell (commands below use Windows paths)

## Install dependencies
From `backend/`:
1) Create and activate a virtualenv:
   ```powershell
   python -m venv .venv; .\.venv\Scripts\activate
   ```
2) Install requirements:
   ```powershell
   pip install -r requirements.txt
   ```

## Configure settings
- Main config: `development.ini`
  - `sqlalchemy.url`: e.g. `postgresql://postgres:postgres@localhost:5432/library`
  - `firebase.project_id`: your Firebase project id
  - `jwt.secret` / `jwt.algorithm`: keep defaults or change
- Alembic config: `alembic.ini` (defaults to same DB URL; override as needed)
- Firebase Admin: if you use real verification, set `GOOGLE_APPLICATION_CREDENTIALS` to your service account JSON path.

## Database setup
1) Create the database in PostgreSQL (if not already):
   ```sql
   CREATE DATABASE library;
   ```
2) Run migrations from `backend/`:
   ```powershell
   alembic -c alembic.ini upgrade head
   ```
   This creates `users`, `books`, `borrowings` and the `userrole` enum.

## Run the dev server
From `backend/`:
```powershell
pserve development.ini --reload
```
Server listens on http://localhost:6543 by default.

## Auth stub (for local dev)
- `Authorization: Bearer <token>` is expected.
- Stub format: `<email>:<ROLE>` (ROLE one of ADMIN, LIBRARIAN, STUDENT). Example: `alice@example.com:ADMIN`.
- If no role segment, role defaults to STUDENT and email is derived from the token value.
- The stub will create the user on first request.

## Key backend routes (for frontend)
Base URL: `http://localhost:6543`
- `GET /health` → `{ "status": "ok" }`
- `POST /auth/google` → returns user; reads bearer token (stubbed)
- `GET /auth/me` → current user; requires auth
- Books:
  - `GET /books`
  - `POST /books` (auth, MANAGE_BOOKS)
  - `PUT /books/{id}` (auth, MANAGE_BOOKS)
  - `DELETE /books/{id}` (auth, MANAGE_BOOKS)
- Borrowings:
  - `GET /borrowings` (auth, MANAGE_BORROWINGS)
  - `POST /borrowings` (auth) body `book_id`, optional `due_days`
  - `POST /borrowings/{id}/return` (auth)
- Users:
  - `GET /users` (auth, MANAGE_USERS)
  - `GET /users/{id}` (auth, MANAGE_USERS)

## Role permissions
- ADMIN: manage everything
- LIBRARIAN: manage books and borrowings
- STUDENT: view-only endpoints that do not require manage permissions

## Common troubleshooting
- Migration errors: ensure DB URL in both `development.ini` and `alembic.ini` is reachable; verify DB exists.
- Auth errors: confirm `Authorization` header is present and follows stub format. For real Google verification, replace the stub in `app/security/firebase_auth.py` with `firebase_admin.auth.verify_id_token` and provide credentials.
- Connection refused: ensure PostgreSQL is running and accessible on the configured host/port.

## Useful one-liners
- Create a revision after model changes: `alembic -c alembic.ini revision -m "message"`
- Auto-generate (if configured): `alembic -c alembic.ini revision --autogenerate -m "message"`
- Reset DB (destructive): drop/recreate database, then `alembic upgrade head`.
