"""
Brújula Futura — Esquemas Pydantic
Validación de datos de entrada (Request) y salida (Response).
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


# =========================================================
# Auth Schemas
# =========================================================
class RegistroRequest(BaseModel):
    nombres: str
    apellidos: str
    correo: EmailStr
    clave: str
    alias_usuario: Optional[str] = None
    id_institucion: Optional[int] = None


class LoginRequest(BaseModel):
    correo: EmailStr
    clave: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: dict


# =========================================================
# Universidad Schemas
# =========================================================
class UniversidadResponse(BaseModel):
    id_universidad: int
    codigo_universidad: str
    nombre_universidad: str
    tipo_universidad: str
    provincia: Optional[str] = None
    ciudad: Optional[str] = None
    sitio_web: Optional[str] = None

    class Config:
        from_attributes = True


# =========================================================
# Carrera Schemas
# =========================================================
class OfertaUniversitariaResponse(BaseModel):
    id_carrera_universidad: int
    nombre_programa: str
    modalidad: Optional[str] = None
    jornada: Optional[str] = None
    costo_matricula: Optional[Decimal] = None
    universidad: UniversidadResponse

    class Config:
        from_attributes = True


class CarreraResponse(BaseModel):
    id_carrera: int
    codigo_carrera: str
    nombre_carrera: str
    tipo_opcion: str
    duracion_meses: Optional[int] = None
    salida_laboral: Optional[str] = None
    perfil_recomendado: Optional[str] = None
    costo_referencial: Optional[Decimal] = None
    area_nombre: Optional[str] = None
    area_codigo: Optional[str] = None

    class Config:
        from_attributes = True


class CarreraDetalleResponse(CarreraResponse):
    ofertas: List[OfertaUniversitariaResponse] = []


# =========================================================
# Test Vocacional Schemas
# =========================================================
class OpcionResponse(BaseModel):
    id_opcion: int
    texto_opcion: str
    valor_puntaje: Decimal
    orden: int

    class Config:
        from_attributes = True


class PreguntaResponse(BaseModel):
    id_pregunta: int
    codigo_pregunta: str
    texto_pregunta: str
    orden: int
    opciones: List[OpcionResponse] = []

    class Config:
        from_attributes = True


class RespuestaTestRequest(BaseModel):
    """Una respuesta individual del test."""
    id_pregunta: int
    id_opcion: int


class TestSubmitRequest(BaseModel):
    """Todas las respuestas del test enviadas de golpe."""
    respuestas: List[RespuestaTestRequest]


class ResultadoRIASECItem(BaseModel):
    """Resultado por cada área RIASEC."""
    codigo_area: str
    nombre_area: str
    puntaje: float
    porcentaje: float


class ResultadoTestResponse(BaseModel):
    """Respuesta completa del procesamiento del test."""
    perfil_riasec: List[ResultadoRIASECItem]
    codigo_dominante: str
    nombre_dominante: str
    carreras_recomendadas: List[CarreraResponse]


# =========================================================
# Versus Schemas
# =========================================================
class VersusRequest(BaseModel):
    """IDs de las carreras a comparar (2 o 3)."""
    ids_carreras: List[int]


class VersusCarreraItem(BaseModel):
    id_carrera: int
    nombre_carrera: str
    tipo_opcion: str
    duracion_meses: Optional[int] = None
    salida_laboral: Optional[str] = None
    perfil_recomendado: Optional[str] = None
    area_nombre: Optional[str] = None
    costo_promedio: Optional[float] = None
    universidades_disponibles: int = 0
    modalidades: List[str] = []


class VersusResponse(BaseModel):
    carreras: List[VersusCarreraItem]
    analisis: dict
