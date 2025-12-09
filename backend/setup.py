from setuptools import setup, find_packages

requires = [
    "pyramid",
    "SQLAlchemy",
    "psycopg2-binary",
    "alembic",
    "zope.sqlalchemy",
    "pyramid_tm",
    "firebase-admin",
    "PyJWT",
]

setup(
    name="app",
    version="0.1",
    description="Library Management Backend",
    packages=find_packages(),
    include_package_data=True,
    install_requires=requires,
    entry_points={
        "paste.app_factory": [
            "main = app:main",
        ],
    },
)
