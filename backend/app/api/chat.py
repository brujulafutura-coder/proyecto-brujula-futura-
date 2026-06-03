from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import google.generativeai as genai
import urllib.request
import json
import logging
import re
import urllib.parse
import hashlib

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.models import Carrera, AreaVocacional

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

class ChatMessage(BaseModel):
    message: str
    history: list[dict] = []
    context: dict = None


def background_extract_and_save(query_name, context_text, api_key, is_openrouter, gemini_key):
    import re
    import json
    import hashlib
    import urllib.request
    from app.db.session import SessionLocal
    from app.db.models import Carrera
    import logging
    logger = logging.getLogger(__name__)

    prompt = f"""
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
"""
    
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

@router.post("/")
async def chat_with_gemini(data: ChatMessage, background_tasks: BackgroundTasks):
    settings = get_settings()
    
    # System Prompt Base (Altamente optimizado y contextualizado para Ecuador)
    system_prompt = (
        "Eres el Orientador Vocacional Oficial de Brújula Futura, la plataforma de orientación educativa líder en Ecuador. "
        "Tu misión es ayudar a estudiantes de bachillerato a explorar carreras y universidades.\n"
        "REGLAS DE ORO:\n"
        "1. Contexto Ecuatoriano: Conoce la realidad académica y laboral de Ecuador (ej. Senescyt, universidades públicas como UCE, EPN, privadas como USFQ, PUCE). Sé realista sobre las oportunidades laborales a nivel nacional e internacional.\n"
        "2. Formato: Responde de forma muy amigable, fluida y empática. NO uses lenguaje robótico.\n"
        "3. Estructura: Usa listas o viñetas (Markdown) para facilitar la lectura. Mantén las respuestas rápidas, directas y concisas (máximo 2 párrafos cortos a menos que te pidan detalles profundos).\n"
    )

    # Si recibimos el contexto del Test Vocacional, inyectarlo dinámicamente en el cerebro del modelo
    if data.context:
        system_prompt += "\n\n=== CONTEXTO ACTUAL DEL USUARIO (MEMORIA EN TIEMPO REAL) ===\n"
        system_prompt += "El usuario acaba de realizar el Test Vocacional RIASEC y estos son sus resultados oficiales. Usa esta información para personalizar toda tu orientación a partir de ahora:\n"
        if data.context.get("nombre_dominante"):
            system_prompt += f"- Perfil Dominante: **{data.context['nombre_dominante']}** ({data.context.get('codigo_dominante', '')})\n"
        if data.context.get("perfil_riasec"):
            system_prompt += "- Distribución de Intereses:\n"
            for area in data.context["perfil_riasec"]:
                system_prompt += f"  * {area.get('nombre_area')}: {area.get('porcentaje')}%\n"
        if data.context.get("carreras_recomendadas"):
            system_prompt += "- Carreras Sugeridas por el Test:\n"
            for c in data.context["carreras_recomendadas"]:
                system_prompt += f"  * {c.get('nombre_carrera')} (Área: {c.get('area_nombre', 'N/A')})\n"
        system_prompt += "============================================================\n"

# BÚSQUEDA PREVENTIVA HEURÍSTICA (SINGLE LLM CALL ARCHITECTURE)
    search_context = ""
    query_for_db = None
    keywords = ["carrera", "estudiar", "universidad", "costo", "información", "informacion", "qué trata", "que trata", "opciones", "salida"]
    
    if any(kw in data.message.lower() for kw in keywords) and data.message.strip() != "/debug":
        match = re.search(r'(?:carrera de|estudiar|sobre la|sobre|en)\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{5,35})', data.message.lower())
        if match:
            query_for_db = match.group(1).strip()
            for stop in [" en ", " ecuador", " y ", " me ", " la ", " las ", " los ", " el ", " quiero ", " saber "]:
                if query_for_db.endswith(stop.strip()): 
                    query_for_db = query_for_db.replace(stop, "").strip()
        
        try:
            search_url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(f"{data.message} universidades costos Ecuador")
            search_req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(search_req, timeout=8) as response:
                html = response.read().decode('utf-8')
                snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
                clean_snippets = [re.sub(r'<[^>]+>', '', s).strip() for s in snippets]
                search_context = "\n".join(clean_snippets[:3])
        except Exception as search_e:
            logger.error(f"Error Búsqueda Preventiva: {search_e}")
            
        if search_context and query_for_db:
            system_prompt += f"""

=== INFORMACIÓN WEB EXTRAÍDA ===
Se buscó automáticamente la siguiente información actualizada en internet para la consulta del usuario:
{search_context}
Por favor, responde amigablemente al estudiante basándote en esta información. Actúa de forma natural, no menciones que buscaste en internet.
============================================================
"""
            
            # Enviar extracción de DB a segundo plano (sin bloquear respuesta al usuario)
            is_openrouter = True if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-or-") else False
            background_tasks.add_task(background_extract_and_save, query_for_db, search_context, settings.OPENAI_API_KEY, is_openrouter, settings.GEMINI_API_KEY)

    # 1. MODO DE PURA COMPATIBILIDAD CON OPENAI / OPENROUTER (RECOMENDADO)
    if settings.OPENAI_API_KEY:
        api_key = settings.OPENAI_API_KEY.strip()
        is_openrouter = api_key.startswith("sk-or-")
        
        # URL y modelo según el proveedor
        if is_openrouter:
            url = "https://openrouter.ai/api/v1/chat/completions"
            # Usamos openrouter/free para enrutamiento automático e inteligente entre los modelos gratuitos activos
            model_name = "openrouter/free"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://brujula-futura.render.com",
                "X-Title": "Brujula Futura"
            }
        else:
            url = "https://api.openai.com/v1/chat/completions"
            model_name = "gpt-4o-mini"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }

        # Modo Diagnóstico para OpenAI / OpenRouter
        if data.message.strip() == "/debug":
            provider_name = "OpenRouter" if is_openrouter else "OpenAI"
            test_payload = {
                "model": model_name,
                "messages": [{"role": "user", "content": "Ping"}]
            }
            try:
                req = urllib.request.Request(
                    url, 
                    data=json.dumps(test_payload).encode("utf-8"), 
                    headers=headers,
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    res_body = json.loads(response.read().decode("utf-8"))
                    text_reply = res_body["choices"][0]["message"]["content"]
                    return {
                        "reply": f"🛠️ **Diagnóstico Exitoso ({provider_name})!** Tu API Key está conectada correctamente.\n\n"
                                 f"Model: `{model_name}`\n"
                                 f"Respuesta de prueba: *\"{text_reply}\"*\n\n"
                                 f"¡Todo está listo y en pleno funcionamiento!"
                    }
            except Exception as e:
                err_msg = str(e)
                if hasattr(e, 'read'):
                    err_msg += f" - Detalle: {e.read().decode('utf-8')}"
                return {
                    "reply": f"⚠️ **Error en Diagnóstico ({provider_name}):** Falló la conexión con {provider_name}.\n"
                             f"Detalle del error: `{err_msg}`\n\n"
                             f"Revisa que tu API Key sea correcta y que la variable de entorno esté bien guardada."
                }

        # Construir historial en formato estándar de Chat Completions
        messages = [{"role": "system", "content": system_prompt}]
        for msg in data.history:
            role = "user" if msg["role"] == "user" else "assistant"
            messages.append({"role": role, "content": msg["content"]})
        messages.append({"role": "user", "content": data.message})

        def make_api_call(msgs):
            payload = {
                "model": model_name,
                "messages": msgs
            }
            try:
                req = urllib.request.Request(
                    url, 
                    data=json.dumps(payload).encode("utf-8"), 
                    headers=headers,
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=30) as response:
                    res_body = json.loads(response.read().decode("utf-8"))
                    return res_body["choices"][0]["message"]["content"]
            except Exception as e:
                err_msg = str(e)
                if hasattr(e, 'read'):
                    try:
                        err_detail = json.loads(e.read().decode('utf-8'))
                        err_msg = err_detail.get("error", {}).get("message", err_msg)
                    except: pass
                logger.error(f"Error en llamada a {url}: {err_msg}")
                
                # Fallback a Llama 3
                if is_openrouter and "openrouter/free" in model_name:
                    logger.info("Intentando fallback a Llama 3.2 3B en OpenRouter...")
                    try:
                        payload["model"] = "meta-llama/llama-3.2-3b-instruct:free"
                        req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
                        with urllib.request.urlopen(req, timeout=25) as response:
                            res_body = json.loads(response.read().decode("utf-8"))
                            return res_body["choices"][0]["message"]["content"]
                    except Exception as fallback_e:
                        logger.error(f"Fallback falló: {fallback_e}")
                
                raise HTTPException(status_code=500, detail=f"Error al comunicar con la IA: {err_msg}")

        reply = make_api_call(messages)

        return {"reply": reply}

    # 2. MODO NATIVO DE GEMINI (FALLBACK)
    if not settings.GEMINI_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="Configuración incompleta: No se detectó ni OPENAI_API_KEY (para OpenRouter/OpenAI) ni GEMINI_API_KEY."
        )
        
    try:
        # Configurar Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # Modo Diagnóstico nativo
        if data.message.strip() == "/debug":
            try:
                models = genai.list_models()
                available_models = [m.name for m in models if "generateContent" in m.supported_generation_methods]
                models_str = "\n".join([f"- `{name}`" for name in available_models])
                if not available_models:
                    return {"reply": "⚠️ **Diagnóstico:** Tu API Key es válida, pero Google reporta que tienes **CERO modelos** disponibles en tu región."}
                return {"reply": f"🛠️ **Diagnóstico Exitoso!** Tu API Key tiene acceso a estos modelos:\n\n{models_str}"}
            except Exception as inner_e:
                return {"reply": f"⚠️ **Error en Diagnóstico:** Falló al listar modelos: {str(inner_e)}"}

        # Construir y sanitizar el historial para Gemini
        gemini_history = []
        for msg in data.history:
            role = "user" if msg["role"] == "user" else "model"
            if not gemini_history and role == "model":
                continue
            if gemini_history and gemini_history[-1]["role"] == role:
                gemini_history[-1]["parts"][0] += f"\n\n{msg['content']}"
            else:
                gemini_history.append({"role": role, "parts": [msg["content"]]})
            
        try:
            model = genai.GenerativeModel("gemini-2.0-flash", system_instruction=system_prompt)
            chat = model.start_chat(history=gemini_history)
            response = chat.send_message(data.message)
            reply = response.text
            
            return {"reply": reply}
            
        except Exception as inner_e:
            logger.error(f"Error Gemini Principal: {inner_e}")
            # Fallback simple
            model = genai.GenerativeModel("gemini-2.0-flash")
            fallback_history = [{"role": "user", "parts": [system_prompt]}, {"role": "model", "parts": ["Entendido."]}] + gemini_history
            chat = model.start_chat(history=fallback_history)
            response = chat.send_message(data.message)
            return {"reply": response.text}
        
    except Exception as e:
        logger.error(f"Error Gemini Nativo General: {e}")
        raise HTTPException(status_code=500, detail=f"Error al comunicar con la IA: {str(e)}")

