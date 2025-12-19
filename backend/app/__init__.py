import os
from dotenv import load_dotenv
from pyramid.config import Configurator
from pyramid.response import Response
from sqlalchemy import engine_from_config
from sqlalchemy.orm import sessionmaker
from zope.sqlalchemy import register as zope_register


from .models import Base

# Load environment variables from .env file
load_dotenv()


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
    # Override settings with environment variables if they exist
    settings['cloudinary.cloud_name'] = os.getenv('CLOUDINARY_CLOUD_NAME', settings.get('cloudinary.cloud_name', ''))
    settings['cloudinary.api_key'] = os.getenv('CLOUDINARY_API_KEY', settings.get('cloudinary.api_key', ''))
    settings['cloudinary.api_secret'] = os.getenv('CLOUDINARY_API_SECRET', settings.get('cloudinary.api_secret', ''))
    settings['auth.secret'] = os.getenv('AUTH_SECRET', settings.get('auth.secret', 'change-me'))
    
    # Override database URL if provided in env
    if os.getenv('DATABASE_URL'):
        settings['sqlalchemy.url'] = os.getenv('DATABASE_URL')
    
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
