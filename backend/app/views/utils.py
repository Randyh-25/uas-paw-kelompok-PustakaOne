import json
from typing import Any, Dict, Optional

from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from pyramid.httpexceptions import HTTPBadRequest, HTTPForbidden, HTTPUnauthorized
from pyramid.request import Request

from ..models.user import User, UserRole


def get_serializer(request: Request) -> URLSafeTimedSerializer:
    secret = request.registry.settings.get("auth.secret", "dev-secret-change-me")
    return URLSafeTimedSerializer(secret_key=secret)


def create_token(user: User, request: Request, expires_seconds: int = 86400) -> str:
    serializer = get_serializer(request)
    return serializer.dumps({"user_id": user.id, "role": user.role.value})


def current_user(request: Request) -> User:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPUnauthorized(json_body={"error": "Missing Authorization header"})

    token = auth_header.split(" ", 1)[1].strip()
    serializer = get_serializer(request)
    try:
        payload = serializer.loads(token, max_age=86400)
    except SignatureExpired:
        raise HTTPUnauthorized(json_body={"error": "Token expired"})
    except BadSignature:
        raise HTTPUnauthorized(json_body={"error": "Invalid token"})

    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPUnauthorized(json_body={"error": "Invalid token payload"})

    user = request.dbsession.get(User, user_id)
    if not user:
        raise HTTPUnauthorized(json_body={"error": "User not found"})
    return user


def require_role(user: User, roles: Optional[list[str]] = None) -> None:
    if roles and user.role.value not in roles:
        raise HTTPForbidden(json_body={"error": "Insufficient permissions"})


def json_payload(request: Request) -> Dict[str, Any]:
    try:
        body = request.body.decode("utf-8") if request.body else "{}"
        return json.loads(body) if body else {}
    except json.JSONDecodeError as exc:
        raise HTTPBadRequest(json_body={"error": f"Invalid JSON: {exc}"})
