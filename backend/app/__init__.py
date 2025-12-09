from pyramid.config import Configurator
from pyramid.response import Response
from sqlalchemy import engine_from_config

from .config import Settings
from .db.base import Base
from .db.session import DBSession, configure_engine


def main(global_config, **settings):
    settings_obj = Settings(settings)
    engine = engine_from_config(settings, prefix="sqlalchemy.")
    configure_engine(engine)
    Base.metadata.bind = engine

    config = Configurator(settings=settings)
    config.registry.settings_obj = settings_obj

    config.include("pyramid_tm")

    config.include("app.security")
    config.include("app.views.health")
    config.include("app.views.auth")
    config.include("app.views.books")
    config.include("app.views.borrowings")
    config.include("app.views.users")

    config.scan("app.security")
    config.scan("app.views")

    return config.make_wsgi_app()
