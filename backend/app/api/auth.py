"""
Brújula Futura — API de Autenticación
Registro de usuarios con Bcrypt + Login con JWT.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.models import Usuario, RolUsuario
from app.schemas.schemas import RegistroRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


@router.post("/registro", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(datos: RegistroRequest, db: Session = Depends(get_db)):
    """Registra un nuevo estudiante con contraseña hasheada (Bcrypt)."""

    # Verificar si el correo ya existe
    existe = db.query(Usuario).filter(Usuario.correo == datos.correo.lower()).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El correo ya está registrado."
        )

    # Obtener rol de Estudiante (EST)
    rol = db.query(RolUsuario).filter(RolUsuario.cod_rol == "EST").first()
    if not rol:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno: rol de estudiante no configurado."
        )

    # Crear usuario con hash Bcrypt
    nuevo_usuario = Usuario(
        id_rol=rol.id_rol,
        id_institucion=datos.id_institucion,
        nombres=datos.nombres.strip(),
        apellidos=datos.apellidos.strip(),
        alias_usuario=datos.alias_usuario.strip() if datos.alias_usuario else None,
        correo=datos.correo.lower().strip(),
        clave_hash=hash_password(datos.clave),
        estado="ACT",
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    # Generar token JWT
    token = create_access_token(data={"sub": str(nuevo_usuario.id_usuario)})

    return TokenResponse(
        access_token=token,
        usuario={
            "id_usuario": nuevo_usuario.id_usuario,
            "nombres": nuevo_usuario.nombres,
            "correo": nuevo_usuario.correo,
            "rol": rol.nombre_rol,
        }
    )


@router.post("/login", response_model=TokenResponse)
def login_usuario(datos: LoginRequest, db: Session = Depends(get_db)):
    """Autentica al usuario y devuelve un token JWT."""

    usuario = db.query(Usuario).filter(Usuario.correo == datos.correo.lower()).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo no registrado."
        )

    if usuario.estado != "ACT":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo. Contacte al administrador."
        )

    if not usuario.clave_hash or not verify_password(datos.clave, usuario.clave_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta."
        )

    # Obtener nombre del rol
    rol = db.query(RolUsuario).filter(RolUsuario.id_rol == usuario.id_rol).first()

    token = create_access_token(data={"sub": str(usuario.id_usuario)})

    return TokenResponse(
        access_token=token,
        usuario={
            "id_usuario": usuario.id_usuario,
            "nombres": usuario.nombres,
            "correo": usuario.correo,
            "rol": rol.nombre_rol if rol else "Desconocido",
        }
    )
