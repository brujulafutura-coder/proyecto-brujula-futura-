"""
Brújula Futura — API de Carreras
Consulta de carreras, oferta académica y detalle con universidades.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from app.core.database import get_db
from app.models.models import Carrera, CarreraUniversidad, AreaVocacional
from app.schemas.schemas import CarreraResponse, CarreraDetalleResponse

router = APIRouter(prefix="/api/carreras", tags=["Carreras"])


@router.get("/", response_model=List[CarreraResponse])
def listar_carreras(
    area: Optional[str] = Query(None, description="Filtrar por código de área RIASEC (R, I, A, S, E, C)"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo: UNI, TEC, OFI, CUR"),
    db: Session = Depends(get_db),
):
    """Lista todas las carreras activas. Permite filtrar por área RIASEC y tipo."""
    query = db.query(Carrera).join(AreaVocacional).filter(Carrera.estado == "ACT")

    if area:
        query = query.filter(AreaVocacional.codigo_area == area.upper())
    if tipo:
        query = query.filter(Carrera.tipo_opcion == tipo.upper())

    carreras = query.order_by(Carrera.nombre_carrera).all()

    # Transformar para incluir el nombre del área
    resultado = []
    for c in carreras:
        resultado.append(CarreraResponse(
            id_carrera=c.id_carrera,
            codigo_carrera=c.codigo_carrera.strip(),
            nombre_carrera=c.nombre_carrera,
            tipo_opcion=c.tipo_opcion.strip(),
            duracion_meses=c.duracion_meses,
            salida_laboral=c.salida_laboral,
            perfil_recomendado=c.perfil_recomendado,
            costo_referencial=c.costo_referencial,
            area_nombre=c.area.nombre_area if c.area else None,
            area_codigo=c.area.codigo_area.strip() if c.area else None,
        ))

    return resultado


@router.get("/{id_carrera}", response_model=CarreraDetalleResponse)
def obtener_carrera_detalle(id_carrera: int, db: Session = Depends(get_db)):
    """Obtiene detalle de una carrera con su oferta universitaria."""
    carrera = (
        db.query(Carrera)
        .options(joinedload(Carrera.ofertas).joinedload(CarreraUniversidad.universidad))
        .options(joinedload(Carrera.area))
        .filter(Carrera.id_carrera == id_carrera, Carrera.estado == "ACT")
        .first()
    )

    if not carrera:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Carrera no encontrada.")

    return CarreraDetalleResponse(
        id_carrera=carrera.id_carrera,
        codigo_carrera=carrera.codigo_carrera.strip(),
        nombre_carrera=carrera.nombre_carrera,
        tipo_opcion=carrera.tipo_opcion.strip(),
        duracion_meses=carrera.duracion_meses,
        salida_laboral=carrera.salida_laboral,
        perfil_recomendado=carrera.perfil_recomendado,
        costo_referencial=carrera.costo_referencial,
        area_nombre=carrera.area.nombre_area if carrera.area else None,
        area_codigo=carrera.area.codigo_area.strip() if carrera.area else None,
        ofertas=carrera.ofertas,
    )
