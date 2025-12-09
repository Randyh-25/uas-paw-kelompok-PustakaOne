from sqlalchemy.orm import scoped_session, sessionmaker
import zope.sqlalchemy

DBSession = scoped_session(sessionmaker())


def configure_engine(engine) -> None:
    DBSession.configure(bind=engine)
    zope.sqlalchemy.register(DBSession)
