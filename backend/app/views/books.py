from pyramid.httpexceptions import HTTPBadRequest, HTTPNotFound
from pyramid.view import view_config

from ..models.book import Book
from ..models.user import UserRole
from .utils import current_user, json_payload, require_role


def serialize_book(book: Book):
    return {
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "isbn": book.isbn,
        "category": book.category,
        "copies_total": book.copies_total,
        "copies_available": book.copies_available,
    }


@view_config(route_name="books.list", request_method="GET", renderer="json")
def list_books(request):
    search = (request.params.get("search") or "").strip().lower()
    category = (request.params.get("category") or "").strip().lower()

    query = request.dbsession.query(Book)
    if search:
        pattern = f"%{search}%"
        query = query.filter((Book.title.ilike(pattern)) | (Book.author.ilike(pattern)))
    if category:
        query = query.filter(Book.category.ilike(f"%{category}%"))

    books = query.order_by(Book.title.asc()).all()
    return {"items": [serialize_book(book) for book in books]}


@view_config(route_name="books.detail", request_method="GET", renderer="json")
def get_book(request):
    book = request.dbsession.get(Book, int(request.matchdict["id"]))
    if not book:
        raise HTTPNotFound(json_body={"error": "Book not found"})
    return serialize_book(book)


@view_config(route_name="books.list", request_method="POST", renderer="json")
def create_book(request):
    user = current_user(request)
    require_role(user, [UserRole.librarian.value])

    data = json_payload(request)
    required_fields = ["title", "author", "isbn", "category", "copies_total"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        raise HTTPBadRequest(json_body={"error": f"Missing fields: {', '.join(missing)}"})

    copies_total = int(data.get("copies_total", 1))
    copies_available = int(data.get("copies_available", copies_total))
    if copies_available > copies_total:
        raise HTTPBadRequest(json_body={"error": "copies_available cannot exceed copies_total"})

    book = Book(
        title=data["title"],
        author=data["author"],
        isbn=data["isbn"],
        category=data["category"],
        copies_total=copies_total,
        copies_available=copies_available,
    )
    request.dbsession.add(book)
    return {"message": "Book created", "book": serialize_book(book)}


@view_config(route_name="books.detail", request_method="PUT", renderer="json")
def update_book(request):
    user = current_user(request)
    require_role(user, [UserRole.librarian.value])

    book = request.dbsession.get(Book, int(request.matchdict["id"]))
    if not book:
        raise HTTPNotFound(json_body={"error": "Book not found"})

    data = json_payload(request)
    for field in ["title", "author", "isbn", "category"]:
        if field in data and data[field]:
            setattr(book, field, data[field])

    if "copies_total" in data:
        new_total = int(data["copies_total"])
        delta = new_total - book.copies_total
        book.copies_total = new_total
        book.copies_available = max(0, book.copies_available + delta)

    if "copies_available" in data:
        copies_available = int(data["copies_available"])
        if copies_available > book.copies_total:
            raise HTTPBadRequest(json_body={"error": "copies_available cannot exceed copies_total"})
        book.copies_available = copies_available

    return {"message": "Book updated", "book": serialize_book(book)}


@view_config(route_name="books.detail", request_method="DELETE", renderer="json")
def delete_book(request):
    user = current_user(request)
    require_role(user, [UserRole.librarian.value])

    book = request.dbsession.get(Book, int(request.matchdict["id"]))
    if not book:
        raise HTTPNotFound(json_body={"error": "Book not found"})

    # Check if there are active borrowings
    from ..models.borrowing import Borrowing
    active_borrows = (
        request.dbsession.query(Borrowing)
        .filter(Borrowing.book_id == book.id, Borrowing.return_date.is_(None))
        .count()
    )
    if active_borrows > 0:
        raise HTTPBadRequest(
            json_body={"error": f"Cannot delete: {active_borrows} active borrowing(s)"}
        )

    request.dbsession.delete(book)
    return {"message": "Book deleted"}
