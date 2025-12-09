from functools import wraps
from typing import Optional

from pyramid.httpexceptions import HTTPUnauthorized
from pyramid.security import remember

from app.db import DBSession
from app.models import User, UserRole


def _get_bearer_token(request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


def authenticate_with_google(request):
    token = _get_bearer_token(request)
    if not token:
        raise HTTPUnauthorized("Missing Authorization token")

    # TODO: Verify the token using firebase_admin.auth.verify_id_token
    # For now, this is a stub that trusts the token format "email:role" or defaults to STUDENT.
    email = None
    role = UserRole.STUDENT
    if ":" in token:
        email_part, role_part = token.split(":", 1)
        email = email_part
        try:
            role = UserRole(role_part)
        except ValueError:
            role = UserRole.STUDENT
    else:
        email = f"user_{token}@example.com"

    user = DBSession.query(User).filter_by(email=email).first()
    if not user:
        user = User(email=email, name=email.split("@")[0], role=role)
        DBSession.add(user)
    else:
        # Keep role in sync with token if provided.
        user.role = role or user.role
    request.user = user
    return user


def require_auth(view):
    @wraps(view)
    def wrapper(context, request):
        user = authenticate_with_google(request)
        request.user = user
        headers = remember(request, str(user.id))
        request.response.headerlist.extend(headers)
        return view(context, request)

    return wrapper
