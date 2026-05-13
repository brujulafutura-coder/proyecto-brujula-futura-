"""
Brújula Futura — API del Test Vocacional
Endpoint de preguntas y procesamiento RIASEC.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.models.models import PreguntaTest, OpcionTest, AreaVocacional, Carrera
from app.schemas.schemas import (
    PreguntaResponse, TestSubmitRequest, ResultadoTestResponse,
    ResultadoRIASECItem, CarreraResponse
)
from app.services.riasec_engine import calcular_perfil_riasec

router = APIRouter(prefix="/api/test", tags=["Test Vocacional"])


@router.get("/preguntas", response_model=List[PreguntaResponse])
def obtener_preguntas(db: Session = Depends(get_db)):
    """Devuelve todas las preguntas activas del test con sus opciones, ordenadas."""
    preguntas = (
        db.query(PreguntaTest)
        .options(joinedload(PreguntaTest.opciones))
        .filter(PreguntaTest.estado == "ACT")
        .order_by(PreguntaTest.orden)
        .all()
    )

    if not preguntas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay preguntas cargadas en el sistema."
        )

    return preguntas


@router.post("/procesar", response_model=ResultadoTestResponse)
def procesar_test(datos: TestSubmitRequest, db: Session = Depends(get_db)):
    """
    Recibe las respuestas del test y calcula el perfil RIASEC.
    Devuelve el perfil completo + carreras recomendadas para el área dominante.
    """
    if len(datos.respuestas) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debe enviar al menos una respuesta."
        )

    # Obtener las opciones seleccionadas con sus puntajes
    ids_opciones = [r.id_opcion for r in datos.respuestas]
    opciones = db.query(OpcionTest).filter(OpcionTest.id_opcion.in_(ids_opciones)).all()

    if not opciones:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Las opciones enviadas no son válidas."
        )

    # Obtener las preguntas para mapear a áreas RIASEC
    ids_preguntas = [o.id_pregunta for o in opciones]
    preguntas = (
        db.query(PreguntaTest)
        .filter(PreguntaTest.id_pregunta.in_(ids_preguntas))
        .all()
    )

    # Obtener áreas vocacionales
    areas = db.query(AreaVocacional).filter(AreaVocacional.estado == "ACT").all()

    # Calcular perfil RIASEC
    perfil = calcular_perfil_riasec(datos.respuestas, opciones, preguntas, areas)

    # Obtener el área dominante
    area_dominante = max(perfil, key=lambda x: x["puntaje"])

    # Buscar carreras recomendadas para el área dominante
    carreras_db = (
        db.query(Carrera)
        .join(AreaVocacional)
        .filter(
            AreaVocacional.codigo_area == area_dominante["codigo_area"],
            Carrera.estado == "ACT"
        )
        .all()
    )

    carreras_resp = [
        CarreraResponse(
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
        )
        for c in carreras_db
    ]

    return ResultadoTestResponse(
        perfil_riasec=[ResultadoRIASECItem(**p) for p in perfil],
        codigo_dominante=area_dominante["codigo_area"],
        nombre_dominante=area_dominante["nombre_area"],
        carreras_recomendadas=carreras_resp,
    )
