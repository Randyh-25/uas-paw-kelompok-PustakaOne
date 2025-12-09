from pyramid.httpexceptions import HTTPNotFound
from pyramid.view import view_config

from app.db import DBSession
from app.models import User
from app.security.firebase_auth import require_auth
from app.security.permissions import MANAGE_USERS, check_permission


def includeme(config):
    config.add_route("users_list", "/users")
    config.add_route("users_detail", "/users/{id}")
    config.add_view(list_users, route_name="users_list", request_method="GET", renderer="json")
    config.add_view(get_user_detail, route_name="users_detail", request_method="GET", renderer="json")


@view_config(route_name="users_list", request_method="GET", renderer="json")
@require_auth
def list_users(context, request):
    check_permission(request.user, MANAGE_USERS)
    users = DBSession.query(User).all()
    return [u.to_dict() for u in users]


@view_config(route_name="users_detail", request_method="GET", renderer="json")
@require_auth
def get_user_detail(context, request):
    user_id = int(request.matchdict.get("id"))
    check_permission(request.user, MANAGE_USERS)
    user = DBSession.query(User).get(user_id)
    if not user:
        raise HTTPNotFound()
    return user.to_dict()
