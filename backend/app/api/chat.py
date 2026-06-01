from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import urllib.request
import json
import logging
import re
import urllib.parse

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.models import Carrera, AreaVocacional

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

class ChatMessage(BaseModel):
    message: str
    history: list[dict] = []
    context: dict = None

@router.post("/")
async def chat_with_gemini(data: ChatMessage):
    settings = get_settings()
    
    # System Prompt Base (Altamente optimizado y contextualizado para Ecuador)
    system_prompt = (
        "Eres el Orientador Vocacional Oficial de Brújula Futura, la plataforma de orientación educativa líder en Ecuador. "
        "Tu misión es ayudar a estudiantes de bachillerato a explorar carreras y universidades.\n"
        "REGLAS DE ORO:\n"
        "1. Contexto Ecuatoriano: Conoce la realidad académica y laboral de Ecuador (ej. Senescyt, universidades públicas como UCE, EPN, privadas como USFQ, PUCE). Sé realista sobre las oportunidades laborales a nivel nacional e internacional.\n"
        "2. Formato: Responde de forma muy amigable, fluida y empática. NO uses lenguaje robótico.\n"
        "3. Estructura: Usa listas o viñetas (Markdown) para facilitar la lectura. Mantén las respuestas rápidas, directas y concisas (máximo 2 párrafos cortos a menos que te pidan detalles profundos).\n"
        "4. AUTO-ALIMENTACIÓN (MUY IMPORTANTE): Si el estudiante te pregunta por información específica de una CARRERA (ej. costos, dónde estudiarla, de qué trata) y NO estás 100% seguro de los datos exactos y actuales para ECUADOR, DEBES responder ÚNICAMENTE con esta frase exacta: [[REQUIRE_SEARCH: Nombre de la Carrera en Ecuador]]. No agregues ningún otro texto. Yo buscaré la info en la BD y te la enviaré.\n"
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

        # AGENTIC LOOP: Revisar si la IA solicitó buscar en la web (Base de Datos Auto-Alimentada)
        match = re.search(r"\[\[REQUIRE_SEARCH:\s*(.+?)\]\]", reply)
        if match:
            query = match.group(1).strip()
            logger.info(f"IA solicitó búsqueda web automática para: {query}")
            
            try:
                # Búsqueda segura en web sin librerías externas que causen SegFault
                search_url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(f"{query} carrera universidades costos Ecuador")
                search_req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
                with urllib.request.urlopen(search_req, timeout=15) as response:
                    html = response.read().decode('utf-8')
                    snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
                    clean_snippets = [re.sub(r'<[^>]+>', '', s).strip() for s in snippets]
                    search_context = "\n".join(clean_snippets[:4])
                    
                    if not search_context:
                        search_context = "No se encontró información específica en internet en este momento."
                
                # Guardado REAL en Base de Datos (PostgreSQL/Supabase)
                try:
                    db = SessionLocal()
                    # Verificar si ya existe para evitar duplicados en inserción concurrente
                    existe = db.query(Carrera).filter(Carrera.nombre_carrera.ilike(f"%{query}%")).first()
                    if not existe:
                        # Buscar un área vocacional genérica por defecto (ej. id 1)
                        area = db.query(AreaVocacional).first()
                        id_area_defecto = area.id_area if area else 1
                        
                        # Generar un código único simple (máx 10 caracteres para cumplir con CHAR(10))
                        import hashlib
                        hash_str = hashlib.md5(query.encode()).hexdigest()[:4].upper()
                        codigo_carrera = f"IA-{hash_str}"
                        
                        nueva_carrera = Carrera(
                            id_area=id_area_defecto,
                            codigo_carrera=codigo_carrera,
                            nombre_carrera=query.capitalize()[:120],
                            tipo_opcion="UNI", # Solución de Constraint: DEBE ser UNI, TEC, OFI o CUR
                            descripcion=f"Información automática: {search_context[:350]}...",
                            duracion_meses=48, # 4 años promedio
                            modalidad="PRE", # Presencial (PRE, VIR, HIB permitidos)
                            salida_laboral="Datos en proceso de estructuración.",
                            perfil_recomendado="Estudiantes analíticos y curiosos.",
                            costo_referencial=0.00,
                            estado="ACT"
                        )
                        db.add(nueva_carrera)
                        db.commit()
                        logger.info(f"✅ Carrera '{query}' guardada exitosamente en PostgreSQL (Supabase) con ID: {nueva_carrera.id_carrera}")
                    else:
                        logger.info(f"La carrera '{query}' ya existía en la base de datos.")
                    db.close()
                except Exception as db_err:
                    logger.error(f"Error al guardar en base de datos: {db_err}")
                
                db_injection = f"""
                (SISTEMA AUTO-ALIMENTADOR INVISIBLE)
                Se ha extraído exitosamente la información de la web y guardado en la base de datos. Aquí están los datos reales actuales:
                {search_context}
                
                Por favor, analiza estos datos duros y responde amigablemente al estudiante con la información que pidió.
                (OJO: NUNCA menciones que buscaste en internet, actúa como si siempre lo hubieras sabido gracias a tu inmensa base de datos).
                """
                messages.append({"role": "assistant", "content": reply})
                messages.append({"role": "user", "content": db_injection})
                
                # Segunda llamada (Resolución final)
                reply = make_api_call(messages)
            except Exception as search_e:
                logger.error(f"Error en búsqueda web: {search_e}")
                reply = "Lo siento, en este preciso momento mi base de datos de esa carrera se está actualizando. ¿Te gustaría explorar otras opciones mientras tanto?"

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
            
            # AGENTIC LOOP PARA GEMINI NATIVO
            match = re.search(r"\[\[REQUIRE_SEARCH:\s*(.+?)\]\]", reply)
            if match:
                query = match.group(1).strip()
                logger.info(f"Gemini solicitó búsqueda web para: {query}")
                
                try:
                    # Búsqueda segura
                    search_url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(f"{query} carrera universidades costos Ecuador")
                    search_req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                    with urllib.request.urlopen(search_req, timeout=15) as s_response:
                        html = s_response.read().decode('utf-8')
                        snippets = re.findall(r'<a class="result__snippet[^>]*>(.*?)</a>', html, re.IGNORECASE | re.DOTALL)
                        clean_snippets = [re.sub(r'<[^>]+>', '', s).strip() for s in snippets]
                        search_context = "\n".join(clean_snippets[:4])
                        if not search_context: search_context = "No se encontró información."
                        
                    # Guardado en BD
                    try:
                        db = SessionLocal()
                        existe = db.query(Carrera).filter(Carrera.nombre_carrera.ilike(f"%{query}%")).first()
                        if not existe:
                            import hashlib
                            hash_str = hashlib.md5(query.encode()).hexdigest()[:4].upper()
                            area = db.query(AreaVocacional).first()
                            
                            nueva_carrera = Carrera(
                                id_area=area.id_area if area else 1,
                                codigo_carrera=f"IA-{hash_str}",
                                nombre_carrera=query.capitalize()[:120],
                                tipo_opcion="UNI",
                                descripcion=f"Información automática: {search_context[:350]}...",
                                duracion_meses=48,
                                modalidad="PRE",
                                salida_laboral="Datos en proceso de estructuración.",
                                perfil_recomendado="Estudiantes analíticos y curiosos.",
                                costo_referencial=0.00,
                                estado="ACT"
                            )
                            db.add(nueva_carrera)
                            db.commit()
                        db.close()
                    except Exception as db_err:
                        logger.error(f"Error BD en Gemini: {db_err}")
                        
                    db_injection = f"(SISTEMA INVISIBLE) Datos extraídos: {search_context}. Analiza y responde asumiendo que lo sacaste de tu base de datos."
                    response2 = chat.send_message(db_injection)
                    reply = response2.text
                except Exception as search_e:
                    logger.error(f"Error búsqueda Gemini: {search_e}")
                    reply = "Lo siento, mi base de datos se está actualizando. ¿Quieres ver otras opciones?"
                    
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

