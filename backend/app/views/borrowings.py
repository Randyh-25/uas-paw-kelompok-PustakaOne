from datetime import datetime, timedelta

from pyramid.httpexceptions import HTTPBadRequest, HTTPNotFound
from pyramid.view import view_config

from app.db import DBSession
from app.models import Book, Borrowing
from app.security.firebase_auth import require_auth
from app.security.permissions import MANAGE_BORROWINGS, check_permission

MAX_ACTIVE_BORROWINGS = 3
LATE_FEE_PER_DAY = 1000


def includeme(config):
    config.add_route("borrowings_list", "/borrowings")
    config.add_route("borrowings_return", "/borrowings/{id}/return")
    config.add_view(list_borrowings, route_name="borrowings_list", request_method="GET", renderer="json")
    config.add_view(borrow_book, route_name="borrowings_list", request_method="POST", renderer="json")
    config.add_view(return_book, route_name="borrowings_return", request_method="POST", renderer="json")


@view_config(route_name="borrowings_list", request_method="GET", renderer="json")
@require_auth
def list_borrowings(context, request):
    check_permission(request.user, MANAGE_BORROWINGS)
    borrowings = DBSession.query(Borrowing).all()
    return [b.to_dict() for b in borrowings]


@view_config(route_name="borrowings_list", request_method="POST", renderer="json")
@require_auth
def borrow_book(context, request):
    user = request.user
    active_count = DBSession.query(Borrowing).filter(Borrowing.user_id == user.id, Borrowing.returned_at.is_(None)).count()
    if active_count >= MAX_ACTIVE_BORROWINGS:
        raise HTTPBadRequest(f"Maximum active borrowings reached: {MAX_ACTIVE_BORROWINGS}")

    data = request.json_body or {}
    book_id = data.get("book_id")
    if not book_id:
        raise HTTPBadRequest("book_id is required")

    book = DBSession.query(Book).get(book_id)
    if not book:
        raise HTTPNotFound("Book not found")

    if book.copies_available <= 0:
        raise HTTPBadRequest("No copies available")

    due_days = data.get("due_days", 7)
    borrowing = Borrowing(
        user_id=user.id,
        book_id=book.id,
        due_date=datetime.utcnow() + timedelta(days=due_days),
    )
    DBSession.add(borrowing)
    book.copies_available -= 1
    return borrowing.to_dict()


@view_config(route_name="borrowings_return", request_method="POST", renderer="json")
@require_auth
def return_book(context, request):
    borrowing_id = int(request.matchdict.get("id"))
    borrowing = DBSession.query(Borrowing).get(borrowing_id)
    if not borrowing:
        raise HTTPNotFound("Borrowing not found")

    if borrowing.returned_at:
        return borrowing.to_dict()

    borrowing.returned_at = datetime.utcnow()
    overdue_days = (borrowing.returned_at.date() - borrowing.due_date.date()).days
    if overdue_days > 0:
        borrowing.late_fee = overdue_days * LATE_FEE_PER_DAY
    else:
        borrowing.late_fee = 0

    book = DBSession.query(Book).get(borrowing.book_id)
    if book:
        book.copies_available += 1

    return borrowing.to_dict()
