"""
Brújula Futura — API del Versus (Comparador de Carreras)
Compara 2 o 3 carreras lado a lado con análisis de datos.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.models.models import Carrera, CarreraUniversidad
from app.schemas.schemas import VersusRequest, VersusResponse, VersusCarreraItem
from app.services.versus_engine import analizar_versus

router = APIRouter(prefix="/api/versus", tags=["Versus - Comparador"])


@router.post("/comparar", response_model=VersusResponse)
def comparar_carreras(datos: VersusRequest, db: Session = Depends(get_db)):
    """
    Compara 2 o 3 carreras lado a lado.
    Devuelve datos normalizados + análisis con Pandas.
    """
    if len(datos.ids_carreras) < 2 or len(datos.ids_carreras) > 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe seleccionar 2 o 3 carreras para comparar."
        )

    # Cargar carreras con sus ofertas y universidades
    carreras = (
        db.query(Carrera)
        .options(joinedload(Carrera.ofertas).joinedload(CarreraUniversidad.universidad))
        .options(joinedload(Carrera.area))
        .filter(Carrera.id_carrera.in_(datos.ids_carreras), Carrera.estado == "ACT")
        .all()
    )

    if len(carreras) != len(datos.ids_carreras):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Una o más carreras no fueron encontradas."
        )

    # Construir items para cada carrera
    items = []
    for c in carreras:
        costos = [float(o.costo_matricula) for o in c.ofertas if o.costo_matricula and float(o.costo_matricula) > 0]
        modalidades_set = set()
        for o in c.ofertas:
            if o.modalidad:
                modalidades_set.add(o.modalidad.strip())

        items.append(VersusCarreraItem(
            id_carrera=c.id_carrera,
            nombre_carrera=c.nombre_carrera,
            tipo_opcion=c.tipo_opcion.strip(),
            duracion_meses=c.duracion_meses,
            salida_laboral=c.salida_laboral,
            perfil_recomendado=c.perfil_recomendado,
            area_nombre=c.area.nombre_area if c.area else None,
            costo_promedio=round(sum(costos) / len(costos), 2) if costos else None,
            universidades_disponibles=len(c.ofertas),
            modalidades=list(modalidades_set),
        ))

    # Ejecutar análisis con Pandas
    analisis = analizar_versus(items)

    return VersusResponse(carreras=items, analisis=analisis)
