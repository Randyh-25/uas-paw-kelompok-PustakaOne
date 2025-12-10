from pyramid.httpexceptions import HTTPBadRequest, HTTPConflict
from pyramid.view import view_config

from ..models.user import User, UserRole
from .utils import create_token, json_payload


@view_config(route_name="auth.register", request_method="POST", renderer="json")
def register(request):
    data = json_payload(request)
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""
    role_value = (data.get("role") or "member").lower().strip()

    if not name or not email or not password:
        raise HTTPBadRequest(json_body={"error": "name, email, and password are required"})

    if role_value not in {"member", "librarian"}:
        raise HTTPBadRequest(json_body={"error": "role must be member or librarian"})

    existing = request.dbsession.query(User).filter_by(email=email).first()
    if existing:
        raise HTTPConflict(json_body={"error": "Email already registered"})

    user = User(name=name, email=email, role=UserRole(role_value))
    user.set_password(password)
    request.dbsession.add(user)

    return {
        "message": "Registration successful",
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role.value},
    }


@view_config(route_name="auth.login", request_method="POST", renderer="json")
def login(request):
    data = json_payload(request)
    email = (data.get("email") or "").lower().strip()
    password = data.get("password") or ""

    if not email or not password:
        raise HTTPBadRequest(json_body={"error": "email and password are required"})

    user = request.dbsession.query(User).filter_by(email=email).first()
    if not user or not user.verify_password(password):
        raise HTTPBadRequest(json_body={"error": "Invalid credentials"})

    token = create_token(user, request)
    return {
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role.value},
    }
