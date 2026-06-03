import os
import re

CHAT_PY_PATH = r"backend/app/api/chat.py"

with open(CHAT_PY_PATH, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace("from fastapi import APIRouter, HTTPException", "from fastapi import APIRouter, HTTPException, BackgroundTasks")

# 2. Update route signature
content = content.replace("async def chat_with_gemini(data: ChatMessage):", "async def chat_with_gemini(data: ChatMessage, background_tasks: BackgroundTasks):")

# 3. Replace process_and_save_json with background_extract_and_save
old_func_regex = re.compile(r"def process_and_save_json\(.*?return text_reply\n", re.DOTALL)

new_func = r"""
def background_extract_and_save(query_name, context_text, api_key, is_openrouter, gemini_key):
    import re
    import json
    import hashlib
    import urllib.request
    from app.db.session import SessionLocal
    from app.db.models import Carrera
    import logging
    logger = logging.getLogger(__name__)

    prompt = f\"\"\"
Analiza la siguiente información extraída sobre {query_name}: {context_text}
Tu ÚNICA tarea es generar un bloque JSON estricto en formato Markdown (```json ... ```) con los datos extraídos para guardarlos en una base de datos.
Claves obligatorias:
{{
  "id_area": 1, // (1:Realista, 2:Investigador, 3:Artístico, 4:Social, 5:Emprendedor, 6:Convencional)
  "tipo_opcion": "UNI", // (UNI, TEC, OFI, o CUR)
  "descripcion": "Resumen conciso max 300 chars",
  "duracion_meses": 48,
  "modalidad": "PRE", // (PRE, VIR o HIB)
  "salida_laboral": "Opciones de trabajo, max 200 chars",
  "perfil_recomendado": "Aptitudes, max 200 chars",
  "costo_referencial": 1500.00
}}
IMPORTANTE: RESPONDE ÚNICA Y EXCLUSIVAMENTE CON EL BLOQUE JSON. Nada de saludos ni texto adicional.
\"\"\"
    
    text_reply = ""
    try:
        if api_key:
            url = "https://openrouter.ai/api/v1/chat/completions" if is_openrouter else "https://api.openai.com/v1/chat/completions"
            model_name = "openrouter/free" if is_openrouter else "gpt-4o-mini"
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            payload = {"model": model_name, "messages": [{"role": "user", "content": prompt}]}
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=30) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                text_reply = res_body["choices"][0]["message"]["content"]
        elif gemini_key:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt)
            text_reply = response.text
    except Exception as e:
        logger.error(f"Error en llamada LLM background: {e}")
        return

    json_str = None
    json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text_reply, re.DOTALL)
    if json_match:
        json_str = json_match.group(1)
    else:
        json_match = re.search(r"(\{\s*\"id_area\".*?\})", text_reply, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)

    if json_str:
        try:
            db_data = json.loads(json_str)
            try:
                db = SessionLocal()
                existe = db.query(Carrera).filter(Carrera.nombre_carrera.ilike(f"%{query_name}%")).first()
                if not existe:
                    tipo_raw = str(db_data.get("tipo_opcion", "UNI")).upper()
                    tipo_final = "TEC" if "TEC" in tipo_raw else ("OFI" if "OFI" in tipo_raw else ("CUR" if "CUR" in tipo_raw else "UNI"))
                    mod_raw = str(db_data.get("modalidad", "PRE")).upper()
                    mod_final = "VIR" if "VIR" in mod_raw else ("HIB" if "HIB" in mod_raw else "PRE")
                    
                    nueva_carrera = Carrera(
                        id_area=int(db_data.get("id_area", 1)),
                        codigo_carrera=f"IA-{hashlib.md5(query_name.encode()).hexdigest()[:4].upper()}",
                        nombre_carrera=query_name.capitalize()[:120],
                        tipo_opcion=tipo_final,
                        descripcion=str(db_data.get("descripcion", context_text[:300]))[:350],
                        duracion_meses=int(db_data.get("duracion_meses", 48)),
                        modalidad=mod_final,
                        salida_laboral=str(db_data.get("salida_laboral", "Datos en proceso."))[:200],
                        perfil_recomendado=str(db_data.get("perfil_recomendado", "Estudiantes analíticos."))[:200],
                        costo_referencial=float(db_data.get("costo_referencial", 0.00)),
                        estado="ACT"
                    )
                    db.add(nueva_carrera)
                    db.commit()
                    logger.info(f"✅ Carrera '{query_name}' guardada exitosamente desde BackgroundTask.")
            except Exception as db_err:
                logger.error(f"Error BD en BackgroundTask: {db_err}")
            finally:
                if 'db' in locals(): db.close()
        except Exception as parse_e:
            logger.error(f"Error parseando json en BackgroundTask: {parse_e}")
"""

content = old_func_regex.sub(lambda x: new_func, content)

# 4. Modify the injected prompt and add background task
old_prompt_block_regex = re.compile(r"=== SISTEMA AUTO-ALIMENTADOR INVISIBLE \(BÚSQUEDA PREVENTIVA\).*?============================================================", re.DOTALL)
new_prompt_block = r"""=== INFORMACIÓN WEB EXTRAÍDA ===
Se buscó automáticamente la siguiente información actualizada en internet para la consulta del usuario:
{search_context}
Por favor, responde amigablemente al estudiante basándote en esta información. Actúa de forma natural, no menciones que buscaste en internet.
============================================================
"""

content = old_prompt_block_regex.sub(lambda x: new_prompt_block, content)

# 5. Inject background_tasks.add_task right after DuckDuckGo
duck_block_regex = re.compile(r"(if search_context and query_for_db:.*?\"\"\")", re.DOTALL)

new_duck_block = r"""    if search_context and query_for_db:
        system_prompt += f\"\"\"

=== INFORMACIÓN WEB EXTRAÍDA ===
Se buscó automáticamente la siguiente información actualizada en internet para la consulta del usuario:
{search_context}
Por favor, responde amigablemente al estudiante basándote en esta información. Actúa de forma natural, no menciones que buscaste en internet.
============================================================
\"\"\"
        
        # Enviar extracción de DB a segundo plano (sin bloquear respuesta al usuario)
        is_openrouter = True if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-or-") else False
        background_tasks.add_task(background_extract_and_save, query_for_db, search_context, settings.OPENAI_API_KEY, is_openrouter, settings.GEMINI_API_KEY)
"""
content = duck_block_regex.sub(lambda x: new_duck_block, content)

# 6. Remove synchronous process_and_save_json calls
content = re.sub(r"\s*if search_context and query_for_db:\n\s*reply = process_and_save_json\(reply, query_for_db, search_context\)", "", content)

with open(CHAT_PY_PATH, "w", encoding="utf-8") as f:
    f.write(content)

print("BackgroundTasks refactor complete.")
