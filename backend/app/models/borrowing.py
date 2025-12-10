from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, func
from sqlalchemy.orm import relationship

from . import Base


class Borrowing(Base):
    __tablename__ = "borrowings"

    id = Column(Integer, primary_key=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    member_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    borrow_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    return_date = Column(Date)
    fine = Column(Numeric(10, 2), nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    member = relationship("User", back_populates="borrowings")
    book = relationship("Book", back_populates="borrowings")


__all__ = ["Borrowing"]
