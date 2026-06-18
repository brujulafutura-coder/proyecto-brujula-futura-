from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging

from app.core.database import get_db
from app.models.models import EventoAnalitica

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/api/analytics", tags=["Analíticas y Telemetría"])

# Esquema Pydantic para el payload del frontend
class AnalyticsEvent(BaseModel):
    session_id: str
    id_usuario: Optional[int] = None
    tipo_evento: str
    detalles: Optional[Dict[str, Any]] = None

# Función que correrá en background
def guardar_evento_db(db: Session, evento_data: AnalyticsEvent):
    try:
        nuevo_evento = EventoAnalitica(
            session_id=evento_data.session_id,
            id_usuario=evento_data.id_usuario,
            tipo_evento=evento_data.tipo_evento,
            detalles=evento_data.detalles
        )
        db.add(nuevo_evento)
        db.commit()
    except Exception as e:
        logger.error(f"Error guardando evento de analítica ({evento_data.tipo_evento}): {e}")
        db.rollback()
    finally:
        db.close()

@router.post("/track")
async def track_event(evento: AnalyticsEvent, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Endpoint Fire-and-Forget para registrar eventos de usuario.
    Recibe el evento y lo encola en BackgroundTasks para no bloquear al usuario.
    """
    if not evento.session_id or not evento.tipo_evento:
        raise HTTPException(status_code=400, detail="Faltan datos obligatorios para el evento.")
    
    # Enviar al background para escritura asíncrona
    background_tasks.add_task(guardar_evento_db, db, evento)
    
    return {"status": "ok", "message": "Evento encolado exitosamente"}
