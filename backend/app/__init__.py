from pyramid.config import Configurator
from pyramid.response import Response
from sqlalchemy import engine_from_config
from sqlalchemy.orm import sessionmaker
from zope.sqlalchemy import register as zope_register


from .models import Base


def get_engine(settings):
    """Create a SQLAlchemy engine from Pyramid settings."""
    return engine_from_config(settings, prefix="sqlalchemy.")


def get_session_factory(engine):
    return sessionmaker(bind=engine, future=True)


def get_tm_session(session_factory, transaction_manager):
    dbsession = session_factory()
    zope_register(dbsession, transaction_manager=transaction_manager)
    return dbsession

def add_cors_headers(request, response):
    """Add CORS headers to response"""
    origin = request.headers.get("Origin")
    if origin:
        response.headers.update({
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "86400",
        })
    return response


def cors_tween_factory(handler, registry):
    """CORS tween to handle preflight and add headers"""
    def cors_tween(request):
        # Handle preflight OPTIONS request
        if request.method == "OPTIONS":
            response = Response(status=204)
            return add_cors_headers(request, response)
        
        # Handle normal request
        response = handler(request)
        return add_cors_headers(request, response)
    
    return cors_tween


def main(global_config, **settings):
    """Pyramid application factory."""
    engine = get_engine(settings)
    session_factory = get_session_factory(engine)
    Base.metadata.bind = engine

    with Configurator(settings=settings) as config:
        # Add CORS tween (must be added before other middlewares)
        config.add_tween("app.cors_tween_factory")
        
        config.include("pyramid_retry")
        config.include("pyramid_tm")
        config.add_request_method(
            lambda request: get_tm_session(session_factory, request.tm),
            "dbsession",
            reify=True,
        )
        config.include(".routes")
        config.scan(".views")
        return config.make_wsgi_app()
