from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound

from app.db import DBSession
from app.models import Book
from app.security.firebase_auth import require_auth
from app.security.permissions import MANAGE_BOOKS, check_permission


def includeme(config):
    config.add_route("books_list", "/books")
    config.add_route("books_detail", "/books/{id}")
    config.add_view(list_books, route_name="books_list", request_method="GET", renderer="json")
    config.add_view(create_book, route_name="books_list", request_method="POST", renderer="json")
    config.add_view(update_book, route_name="books_detail", request_method="PUT", renderer="json")
    config.add_view(delete_book, route_name="books_detail", request_method="DELETE", renderer="json")


@view_config(route_name="books_list", request_method="GET", renderer="json")
def list_books(request):
    books = DBSession.query(Book).all()
    return [b.to_dict() for b in books]


@view_config(route_name="books_list", request_method="POST", renderer="json")
@require_auth
def create_book(context, request):
    check_permission(request.user, MANAGE_BOOKS)
    data = request.json_body or {}
    book = Book(
        title=data.get("title", ""),
        author=data.get("author", ""),
        isbn=data.get("isbn"),
        copies_total=data.get("copies_total", 1),
        copies_available=data.get("copies_available", data.get("copies_total", 1)),
    )
    DBSession.add(book)
    return book.to_dict()


@view_config(route_name="books_detail", request_method="PUT", renderer="json")
@require_auth
def update_book(context, request):
    check_permission(request.user, MANAGE_BOOKS)
    book_id = int(request.matchdict.get("id"))
    book = DBSession.query(Book).get(book_id)
    if not book:
        raise HTTPNotFound()
    data = request.json_body or {}
    for field in ["title", "author", "isbn", "copies_total", "copies_available"]:
        if field in data:
            setattr(book, field, data[field])
    return book.to_dict()


@view_config(route_name="books_detail", request_method="DELETE", renderer="json")
@require_auth
def delete_book(context, request):
    check_permission(request.user, MANAGE_BOOKS)
    book_id = int(request.matchdict.get("id"))
    book = DBSession.query(Book).get(book_id)
    if not book:
        raise HTTPNotFound()
    DBSession.delete(book)
    return {"deleted": True}
