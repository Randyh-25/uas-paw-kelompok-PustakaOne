from pyramid.view import view_config

from app.security.firebase_auth import authenticate_with_google, require_auth


def includeme(config):
    config.add_route("auth_google", "/auth/google")
    config.add_route("auth_me", "/auth/me")
    config.add_view(google_login, route_name="auth_google", renderer="json")
    config.add_view(me, route_name="auth_me", renderer="json")


@view_config(route_name="auth_google", renderer="json")
def google_login(request):
    user = authenticate_with_google(request)
    return user.to_dict()


@view_config(route_name="auth_me", renderer="json")
@require_auth
def me(context, request):
    return request.user.to_dict()
