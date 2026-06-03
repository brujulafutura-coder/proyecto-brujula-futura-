import sys
sys.path.append('backend')
from app.api.chat import process_and_save_json
from app.db.session import SessionLocal
from app.models.models import Carrera

def test():
    # Simulated LLM output
    text_reply = """¡Claro! Aquí está la información sobre Ingeniería en Software:
```json
{
  "id_area": 2,
  "tipo_opcion": "UNI",
  "descripcion": "Carrera enfocada en el diseño y desarrollo de software.",
  "duracion_meses": 48,
  "modalidad": "PRE",
  "salida_laboral": "Desarrollador de software, ingeniero de datos.",
  "perfil_recomendado": "Habilidades lógicas y matemáticas.",
  "costo_referencial": 2500.00
}
```
Espero que te sirva.
"""
    query_name = "Ingenieria en Software"
    context_text = "Contexto simulado"

    print("Executing process_and_save_json...")
    clean_reply = process_and_save_json(text_reply, query_name, context_text)
    print("Cleaned Reply:", clean_reply)

    # Verify DB
    db = SessionLocal()
    carrera = db.query(Carrera).filter(Carrera.nombre_carrera.ilike(f"%{query_name}%")).first()
    if carrera:
        print(f"SUCCESS: Found in DB: {carrera.nombre_carrera}")
        db.delete(carrera)
        db.commit()
    else:
        print("ERROR: Not found in DB!")
    db.close()

if __name__ == "__main__":
    test()
