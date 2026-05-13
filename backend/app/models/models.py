"""
Brújula Futura — Modelos SQLAlchemy
Mapeo ORM de todas las tablas del schema de Supabase.
"""
from sqlalchemy import (
    Column, Integer, BigInteger, SmallInteger, String, Text, Numeric,
    DateTime, ForeignKey, UniqueConstraint, CheckConstraint
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


# =========================================================
# Modelo: RolUsuario
# =========================================================
class RolUsuario(Base):
    __tablename__ = "roles_usuario"

    id_rol = Column(Integer, primary_key=True, autoincrement=True)
    cod_rol = Column(String(3), unique=True, nullable=False)
    nombre_rol = Column(String(40), nullable=False)
    descripcion = Column(String(200), nullable=True)
    estado = Column(String(3), nullable=False, default="ACT")

    # Relaciones
    usuarios = relationship("Usuario", back_populates="rol")


# =========================================================
# Modelo: Institucion
# =========================================================
class Institucion(Base):
    __tablename__ = "instituciones"

    id_institucion = Column(Integer, primary_key=True, autoincrement=True)
    codigo_institucion = Column(String(10), unique=True, nullable=False)
    nombre_institucion = Column(String(120), nullable=False)
    tipo_institucion = Column(String(3), nullable=False)
    provincia = Column(String(80), nullable=True)
    ciudad = Column(String(80), nullable=True)
    direccion = Column(String(150), nullable=True)
    estado = Column(String(3), nullable=False, default="ACT")

    # Relaciones
    usuarios = relationship("Usuario", back_populates="institucion")


# =========================================================
# Modelo: Usuario
# =========================================================
class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    id_rol = Column(Integer, ForeignKey("roles_usuario.id_rol"), nullable=False)
    id_institucion = Column(Integer, ForeignKey("instituciones.id_institucion"), nullable=True)
    nombres = Column(String(80), nullable=True)
    apellidos = Column(String(80), nullable=True)
    alias_usuario = Column(String(50), nullable=True)
    correo = Column(String(120), unique=True, nullable=True)
    clave_hash = Column(String(255), nullable=True)
    estado = Column(String(3), nullable=False, default="ACT")
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_actualizacion = Column(DateTime(timezone=True), nullable=True)

    # Relaciones
    rol = relationship("RolUsuario", back_populates="usuarios")
    institucion = relationship("Institucion", back_populates="usuarios")
    perfil = relationship("PerfilEstudiante", back_populates="usuario", uselist=False)


# =========================================================
# Modelo: PerfilEstudiante
# =========================================================
class PerfilEstudiante(Base):
    __tablename__ = "perfiles_estudiante"

    id_perfil = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), unique=True, nullable=False)
    edad = Column(SmallInteger, nullable=True)
    nivel_educativo = Column(String(3), nullable=False)
    curso = Column(String(30), nullable=True)
    estado_decision = Column(String(3), nullable=False, default="IND")
    objetivo_principal = Column(String(150), nullable=True)
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    usuario = relationship("Usuario", back_populates="perfil")


# =========================================================
# Modelo: AreaVocacional
# =========================================================
class AreaVocacional(Base):
    __tablename__ = "areas_vocacionales"

    id_area = Column(Integer, primary_key=True, autoincrement=True)
    codigo_area = Column(String(6), unique=True, nullable=False)
    nombre_area = Column(String(80), nullable=False)
    descripcion = Column(Text, nullable=True)
    estado = Column(String(3), nullable=False, default="ACT")

    # Relaciones
    carreras = relationship("Carrera", back_populates="area")


# =========================================================
# Modelo: PreguntaTest
# =========================================================
class PreguntaTest(Base):
    __tablename__ = "preguntas_test"

    id_pregunta = Column(Integer, primary_key=True, autoincrement=True)
    codigo_pregunta = Column(String(10), unique=True, nullable=False)
    texto_pregunta = Column(String(300), nullable=False)
    tipo_pregunta = Column(String(3), nullable=False)
    orden = Column(SmallInteger, nullable=False)
    estado = Column(String(3), nullable=False, default="ACT")

    # Relaciones
    opciones = relationship("OpcionTest", back_populates="pregunta", order_by="OpcionTest.orden")


# =========================================================
# Modelo: OpcionTest
# =========================================================
class OpcionTest(Base):
    __tablename__ = "opciones_test"

    id_opcion = Column(Integer, primary_key=True, autoincrement=True)
    id_pregunta = Column(Integer, ForeignKey("preguntas_test.id_pregunta", ondelete="CASCADE"), nullable=False)
    id_aptitud = Column(Integer, ForeignKey("aptitudes.id_aptitud", ondelete="SET NULL"), nullable=True)
    id_interes = Column(Integer, ForeignKey("intereses.id_interes", ondelete="SET NULL"), nullable=True)
    texto_opcion = Column(String(250), nullable=False)
    valor_puntaje = Column(Numeric(5, 2), nullable=False, default=0.00)
    orden = Column(SmallInteger, nullable=False)
    estado = Column(String(3), nullable=False, default="ACT")

    # Relaciones
    pregunta = relationship("PreguntaTest", back_populates="opciones")


# =========================================================
# Modelo: Aptitud
# =========================================================
class Aptitud(Base):
    __tablename__ = "aptitudes"

    id_aptitud = Column(Integer, primary_key=True, autoincrement=True)
    codigo_aptitud = Column(String(8), unique=True, nullable=False)
    nombre_aptitud = Column(String(100), nullable=False)
    descripcion = Column(String(250), nullable=True)
    estado = Column(String(3), nullable=False, default="ACT")


# =========================================================
# Modelo: Interes
# =========================================================
class Interes(Base):
    __tablename__ = "intereses"

    id_interes = Column(Integer, primary_key=True, autoincrement=True)
    id_area = Column(Integer, ForeignKey("areas_vocacionales.id_area"), nullable=False)
    codigo_interes = Column(String(8), unique=True, nullable=False)
    nombre_interes = Column(String(100), nullable=False)
    descripcion = Column(String(250), nullable=True)
    estado = Column(String(3), nullable=False, default="ACT")


# =========================================================
# Modelo: Carrera
# =========================================================
class Carrera(Base):
    __tablename__ = "carreras"

    id_carrera = Column(Integer, primary_key=True, autoincrement=True)
    id_area = Column(Integer, ForeignKey("areas_vocacionales.id_area"), nullable=False)
    codigo_carrera = Column(String(10), unique=True, nullable=False)
    codigo_origen = Column(String(100), unique=True, nullable=True)
    nombre_carrera = Column(String(120), nullable=False)
    tipo_opcion = Column(String(3), nullable=False)
    descripcion = Column(Text, nullable=True)
    duracion_meses = Column(SmallInteger, nullable=True)
    modalidad = Column(String(3), nullable=True)
    salida_laboral = Column(Text, nullable=True)
    perfil_recomendado = Column(Text, nullable=True)
    costo_referencial = Column(Numeric(10, 2), nullable=True)
    estado = Column(String(3), nullable=False, default="ACT")

    # Relaciones
    area = relationship("AreaVocacional", back_populates="carreras")
    ofertas = relationship("CarreraUniversidad", back_populates="carrera")


# =========================================================
# Modelo: Universidad
# =========================================================
class Universidad(Base):
    __tablename__ = "universidades"

    id_universidad = Column(Integer, primary_key=True, autoincrement=True)
    codigo_universidad = Column(String(10), unique=True, nullable=False)
    codigo_origen = Column(String(100), unique=True, nullable=True)
    nombre_universidad = Column(String(150), nullable=False)
    tipo_universidad = Column(String(3), nullable=False)
    provincia = Column(String(80), nullable=True)
    ciudad = Column(String(80), nullable=True)
    sitio_web = Column(String(255), nullable=True)
    estado = Column(String(3), nullable=False, default="ACT")

    # Relaciones
    ofertas = relationship("CarreraUniversidad", back_populates="universidad")


# =========================================================
# Modelo: CarreraUniversidad (Oferta Académica)
# =========================================================
class CarreraUniversidad(Base):
    __tablename__ = "carrera_universidad"

    id_carrera_universidad = Column(Integer, primary_key=True, autoincrement=True)
    id_carrera = Column(Integer, ForeignKey("carreras.id_carrera", ondelete="CASCADE"), nullable=False)
    id_universidad = Column(Integer, ForeignKey("universidades.id_universidad", ondelete="CASCADE"), nullable=False)
    codigo_origen = Column(String(100), unique=True, nullable=True)
    nombre_programa = Column(String(150), nullable=False)
    modalidad = Column(String(3), nullable=True)
    jornada = Column(String(3), nullable=True)
    costo_matricula = Column(Numeric(10, 2), nullable=True)
    url_informacion = Column(String(255), nullable=True)
    estado = Column(String(3), nullable=False, default="ACT")

    # Relaciones
    carrera = relationship("Carrera", back_populates="ofertas")
    universidad = relationship("Universidad", back_populates="ofertas")


# =========================================================
# Modelo: LogAuditoria
# =========================================================
class LogAuditoria(Base):
    __tablename__ = "logs_auditoria"

    id_log = Column(BigInteger, primary_key=True, autoincrement=True)
    tabla_afectada = Column(String(80), nullable=False)
    accion = Column(String(6), nullable=False)
    id_registro = Column(String(50), nullable=False)
    usuario_db = Column(String(100), nullable=True)
    fecha_hora = Column(DateTime(timezone=True), server_default=func.now())
    detalles = Column(JSONB, nullable=True)
