from pyramid.httpexceptions import HTTPForbidden

from app.models import UserRole

VIEW = "view"
MANAGE_BOOKS = "manage_books"
MANAGE_USERS = "manage_users"
MANAGE_BORROWINGS = "manage_borrowings"

ROLE_PERMISSIONS = {
    UserRole.ADMIN: {VIEW, MANAGE_BOOKS, MANAGE_USERS, MANAGE_BORROWINGS},
    UserRole.LIBRARIAN: {VIEW, MANAGE_BOOKS, MANAGE_BORROWINGS},
    UserRole.STUDENT: {VIEW},
}


def check_permission(user, permission: str):
    allowed = ROLE_PERMISSIONS.get(user.role, set())
    if permission not in allowed:
        raise HTTPForbidden(f"Missing permission: {permission}")


def require_role(*roles):
    def decorator(fn):
        def wrapped(context, request):
            if not getattr(request, "user", None):
                raise HTTPForbidden("User not authenticated")
            if request.user.role not in roles:
                raise HTTPForbidden("Insufficient role")
            return fn(context, request)

        return wrapped

    return decorator
