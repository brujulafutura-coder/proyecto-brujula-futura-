"""
Brújula Futura — API de Universidades
Consulta de universidades desde Supabase.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.database import get_db
from app.models.models import Universidad
from app.schemas.schemas import UniversidadResponse

router = APIRouter(prefix="/api/universidades", tags=["Universidades"])


@router.get("/", response_model=List[UniversidadResponse])
def listar_universidades(
    tipo: Optional[str] = Query(None, description="Filtrar por tipo: PUB, PRI, TEC, INS"),
    ciudad: Optional[str] = Query(None, description="Filtrar por ciudad"),
    db: Session = Depends(get_db),
):
    """Lista todas las universidades activas. Permite filtrar por tipo y ciudad."""
    query = db.query(Universidad).filter(Universidad.estado == "ACT")

    if tipo:
        query = query.filter(Universidad.tipo_universidad == tipo.upper())
    if ciudad:
        query = query.filter(Universidad.ciudad.ilike(f"%{ciudad}%"))

    return query.order_by(Universidad.nombre_universidad).all()


@router.get("/{id_universidad}", response_model=UniversidadResponse)
def obtener_universidad(id_universidad: int, db: Session = Depends(get_db)):
    """Obtiene una universidad específica por su ID."""
    uni = db.query(Universidad).filter(
        Universidad.id_universidad == id_universidad,
        Universidad.estado == "ACT"
    ).first()

    if not uni:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Universidad no encontrada.")

    return uni
