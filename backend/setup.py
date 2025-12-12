from setuptools import setup, find_packages

setup(
    name='library-app',
    version='0.0.1',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'pyramid==2.0.2',
        'pyramid_tm==2.5',
        'pyramid_retry==2.1',
        'SQLAlchemy==2.0.23',
        'psycopg2-binary==2.9.9',
        'alembic==1.12.1',
        'zope.sqlalchemy==3.1',
        'passlib[bcrypt]==1.7.4',
        'itsdangerous==2.1.2',
        'waitress==2.1.2',
    ],
    entry_points={
        'paste.app_factory': [
            'main = app:main',
        ],
    },
)
