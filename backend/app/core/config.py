"""
Brújula Futura — Configuración Central
Carga variables de entorno desde .env
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Base de Datos (Supabase PostgreSQL)
    DATABASE_URL: str

    # Seguridad JWT
    SECRET_KEY: str = "brujula-futura-dev-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Supabase (para uso futuro con integraciones)
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cachea la configuración para no leer .env en cada request."""
    return Settings()
