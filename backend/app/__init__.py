from pyramid.config import Configurator
from sqlalchemy import engine_from_config
from sqlalchemy.orm import sessionmaker
from zope.sqlalchemy import register as zope_register
from pyramid.events import NewResponse


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

def cors_response_callback(event):
    request = event.request
    response = event.response

    origin = request.headers.get("Origin")
    allowed_origins = (
        "https://pustakaone.vercel.app",
        "http://localhost:5173",
        "http://localhost:6543",
    )

    if origin in allowed_origins:
        response.headers.update({
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
        })


def main(global_config, **settings):
    """Pyramid application factory."""
    engine = get_engine(settings)
    session_factory = get_session_factory(engine)
    Base.metadata.bind = engine

    with Configurator(settings=settings) as config:
        # Configure CORS
        config.add_subscriber(cors_response_callback, NewResponse)

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
