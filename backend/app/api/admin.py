from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.models import Usuario, RolUsuario, EventoAnalitica

router = APIRouter(prefix="/api/admin", tags=["Administración"])

def require_admin(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)) -> Usuario:
    """Dependencia de FastAPI para verificar privilegios de administrador."""
    usuario = db.query(Usuario).filter(Usuario.id_usuario == user_id).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado.")
    
    rol = db.query(RolUsuario).filter(RolUsuario.id_rol == usuario.id_rol).first()
    if not rol or rol.cod_rol != "ADM":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado. Se requiere rol Administrador.")
    
    return usuario


@router.get("/stats")
def get_dashboard_stats(admin: Usuario = Depends(require_admin), db: Session = Depends(get_db)):
    """Retorna las métricas agregadas para el dashboard administrativo."""
    
    # 1. Total de Usuarios
    total_usuarios = db.query(Usuario).count()
    
    # 2. Tasa de Finalización (TEST_START vs TEST_COMPLETE)
    test_starts = db.query(EventoAnalitica).filter(EventoAnalitica.tipo_evento == "TEST_START").count()
    test_completes = db.query(EventoAnalitica).filter(EventoAnalitica.tipo_evento == "TEST_COMPLETE").count()
    tasa_finalizacion = round((test_completes / test_starts * 100) if test_starts > 0 else 0, 1)

    # 3. Carreras más exploradas
    # Extraemos el nombre de la carrera del JSONB detalles
    carreras_raw = db.query(
        EventoAnalitica.detalles['carrera'].astext.label('carrera'),
        func.count(EventoAnalitica.id_evento).label('visitas')
    ).filter(
        EventoAnalitica.tipo_evento == "CAREER_VIEW"
    ).group_by(
        EventoAnalitica.detalles['carrera'].astext
    ).order_by(func.count(EventoAnalitica.id_evento).desc()).limit(5).all()
    
    top_carreras = [{"name": c.carrera, "visitas": c.visitas} for c in carreras_raw if c.carrera]

    # 4. Universidades más visitadas
    unis_raw = db.query(
        EventoAnalitica.detalles['universidad'].astext.label('universidad'),
        func.count(EventoAnalitica.id_evento).label('clics')
    ).filter(
        EventoAnalitica.tipo_evento == "UNIVERSITY_CLICK"
    ).group_by(
        EventoAnalitica.detalles['universidad'].astext
    ).order_by(func.count(EventoAnalitica.id_evento).desc()).limit(5).all()
    
    top_universidades = [{"name": u.universidad, "clics": u.clics} for u in unis_raw if u.universidad]

    # 5. Distribución RIASEC Global (Agrupando perfiles dominantes)
    areas_raw = db.query(
        EventoAnalitica.detalles['nombre_dominante'].astext.label('area'),
        func.count(EventoAnalitica.id_evento).label('cantidad')
    ).filter(
        EventoAnalitica.tipo_evento == "TEST_COMPLETE"
    ).group_by(
        EventoAnalitica.detalles['nombre_dominante'].astext
    ).order_by(func.count(EventoAnalitica.id_evento).desc()).all()

    distribucion_areas = [{"name": a.area, "value": a.cantidad} for a in areas_raw if a.area]

    return {
        "kpis": {
            "total_usuarios": total_usuarios,
            "tests_iniciados": test_starts,
            "tests_completados": test_completes,
            "tasa_finalizacion": tasa_finalizacion
        },
        "top_carreras": top_carreras,
        "top_universidades": top_universidades,
        "distribucion_areas": distribucion_areas
    }


@router.get("/users")
def get_users_list(admin: Usuario = Depends(require_admin), db: Session = Depends(get_db)):
    """Retorna una lista de usuarios registrados."""
    usuarios_db = db.query(
        Usuario.id_usuario,
        Usuario.nombres,
        Usuario.apellidos,
        Usuario.correo,
        Usuario.fecha_creacion,
        Usuario.estado,
        RolUsuario.nombre_rol
    ).join(RolUsuario).order_by(Usuario.fecha_creacion.desc()).all()

    users_list = []
    for u in usuarios_db:
        users_list.append({
            "id_usuario": u.id_usuario,
            "nombres": f"{u.nombres or ''} {u.apellidos or ''}".strip(),
            "correo": u.correo,
            "fecha_creacion": u.fecha_creacion.isoformat() if u.fecha_creacion else None,
            "rol": u.nombre_rol,
            "estado": u.estado
        })
        
    return users_list
