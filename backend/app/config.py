class Settings:
    def __init__(self, settings: dict):
        self._settings = settings

    @property
    def db_url(self) -> str:
        return self._settings.get("sqlalchemy.url", "")

    @property
    def firebase_project_id(self) -> str:
        return self._settings.get("firebase.project_id", "")

    @property
    def jwt_secret(self) -> str:
        return self._settings.get("jwt.secret", "change-me")

    @property
    def jwt_algorithm(self) -> str:
        return self._settings.get("jwt.algorithm", "HS256")
