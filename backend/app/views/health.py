from pyramid.response import Response


def includeme(config):
    config.add_route("health", "/health")
    config.add_view(health, route_name="health", renderer="json")


def health(request):
    return {"status": "ok"}
