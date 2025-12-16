import math
from datetime import date, timedelta

from pyramid.httpexceptions import HTTPBadRequest, HTTPForbidden, HTTPNotFound
from pyramid.view import view_config

from ..models.book import Book
from ..models.borrowing import Borrowing
from ..models.user import UserRole
from .utils import current_user, json_payload, require_role

FINE_PER_DAY = 5000
BORROW_LIMIT = 3
BORROW_DURATION_DAYS = 14


def serialize_borrowing(borrow: Borrowing):
    return {
        "id": borrow.id,
        "book": {
            "id": borrow.book.id,
            "title": borrow.book.title,
            "author": borrow.book.author,
        },
        "member_id": borrow.member_id,
        "borrow_date": borrow.borrow_date.isoformat(),
        "due_date": borrow.due_date.isoformat(),
        "return_date": borrow.return_date.isoformat() if borrow.return_date else None,
        "fine": float(borrow.fine or 0),
    }


@view_config(route_name="borrow.create", request_method="POST", renderer="json")
def borrow_book(request):
    user = current_user(request)
    require_role(user, [UserRole.member.value])

    book_id = int(request.matchdict["book_id"])
    book = request.dbsession.get(Book, book_id)
    if not book:
        raise HTTPNotFound(json_body={"error": "Book not found"})
    if book.copies_available <= 0:
        raise HTTPBadRequest(json_body={"error": "No copies available"})

    active_count = (
        request.dbsession.query(Borrowing)
        .filter(Borrowing.member_id == user.id, Borrowing.return_date.is_(None))
        .count()
    )
    if active_count >= BORROW_LIMIT:
        raise HTTPBadRequest(json_body={"error": "Borrowing limit reached (3 active)"})

    today = date.today()
    borrowing = Borrowing(
        book=book,
        member=user,
        borrow_date=today,
        due_date=today + timedelta(days=BORROW_DURATION_DAYS),
        fine=0,
    )
    book.copies_available -= 1
    request.dbsession.add(borrowing)

    return {"message": "Borrowed successfully", "borrowing": serialize_borrowing(borrowing)}


@view_config(route_name="return.create", request_method="POST", renderer="json")
def return_book(request):
    user = current_user(request)
    borrowing_id = int(request.matchdict["borrowing_id"])

    borrowing = request.dbsession.get(Borrowing, borrowing_id)
    if not borrowing:
        raise HTTPNotFound(json_body={"error": "Borrowing not found"})

    if user.role == UserRole.member and borrowing.member_id != user.id:
        raise HTTPForbidden(json_body={"error": "Cannot return other member's borrow"})

    if borrowing.return_date:
        raise HTTPBadRequest(json_body={"error": "Already returned"})

    today = date.today()
    borrowing.return_date = today

    if today > borrowing.due_date:
        days_late = (today - borrowing.due_date).days
        borrowing.fine = days_late * FINE_PER_DAY
    else:
        borrowing.fine = 0

    borrowing.book.copies_available += 1
    return {"message": "Return processed", "borrowing": serialize_borrowing(borrowing)}


@view_config(route_name="borrowings.list", request_method="GET", renderer="json")
def list_borrowings(request):
    user = current_user(request)

    try:
        page = int(request.params.get("page", 1))
        limit = int(request.params.get("limit", 10))
    except ValueError:
        raise HTTPBadRequest(json_body={"error": "Invalid page or limit parameter"})

    query = request.dbsession.query(Borrowing).join(Book)
    only_active = request.params.get("active") == "true"

    if user.role == UserRole.member:
        query = query.filter(Borrowing.member_id == user.id)
    else:
        member_id = request.params.get("member_id")
        if member_id:
            query = query.filter(Borrowing.member_id == int(member_id))

    if only_active:
        query = query.filter(Borrowing.return_date.is_(None))

    total_items = query.count()
    total_pages = math.ceil(total_items / limit)
    offset = (page - 1) * limit

    borrows = query.order_by(Borrowing.borrow_date.desc()).limit(limit).offset(offset).all()
    return {
        "items": [serialize_borrowing(b) for b in borrows],
        "page": page,
        "limit": limit,
        "total_items": total_items,
        "total_pages": total_pages,
    }


@view_config(route_name="history.list", request_method="GET", renderer="json")
def borrowing_history(request):
    user = current_user(request)

    try:
        page = int(request.params.get("page", 1))
        limit = int(request.params.get("limit", 10))
    except ValueError:
        raise HTTPBadRequest(json_body={"error": "Invalid page or limit parameter"})

    query = request.dbsession.query(Borrowing).join(Book)
    if user.role == UserRole.member:
        query = query.filter(Borrowing.member_id == user.id)
    else:
        member_id = request.params.get("member_id")
        if member_id:
            query = query.filter(Borrowing.member_id == int(member_id))

    total_items = query.count()
    total_pages = math.ceil(total_items / limit)
    offset = (page - 1) * limit

    borrows = query.order_by(Borrowing.borrow_date.desc()).limit(limit).offset(offset).all()
    return {
        "items": [serialize_borrowing(b) for b in borrows],
        "page": page,
        "limit": limit,
        "total_items": total_items,
        "total_pages": total_pages,
    }
