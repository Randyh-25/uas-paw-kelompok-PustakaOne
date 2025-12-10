from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models so Alembic can autodiscover metadata
from .user import User, UserRole  # noqa: E402,F401
from .book import Book  # noqa: E402,F401
from .borrowing import Borrowing  # noqa: E402,F401

__all__ = [
	"Base",
	"User",
	"UserRole",
	"Book",
	"Borrowing",
]
