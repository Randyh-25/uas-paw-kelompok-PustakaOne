from sqlalchemy import Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from . import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    isbn = Column(String(50), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False)
    copies_total = Column(Integer, nullable=False, default=1)
    copies_available = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    borrowings = relationship("Borrowing", back_populates="book")


__all__ = ["Book"]
