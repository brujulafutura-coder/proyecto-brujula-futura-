import os
import sys

# Asegurar que las variables de entorno se carguen correctamente
from dotenv import load_dotenv
load_dotenv()

from app.core.database import SessionLocal
from app.models.models import Carrera

def test_db():
    print("Conectando a Supabase (PostgreSQL)...")
    db = SessionLocal()
    try:
        print("Buscando carreras guardadas por la IA...")
        # Buscar todas las carreras que tengan el código IA-
        carreras = db.query(Carrera).filter(Carrera.codigo_carrera.like('IA-%')).all()
        
        if not carreras:
            print("❌ No se encontraron carreras insertadas por la IA todavía.")
        else:
            print(f"✅ Se encontraron {len(carreras)} carreras auto-generadas:")
            for c in carreras:
                print(f" - ID: {c.id_carrera} | Nombre: {c.nombre_carrera} | Código: {c.codigo_carrera}")
    except Exception as e:
        print(f"Error en la consulta: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_db()
