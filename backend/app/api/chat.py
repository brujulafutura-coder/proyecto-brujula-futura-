from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import urllib.request
import json
import logging

from app.core.config import get_settings

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

class ChatMessage(BaseModel):
    message: str
    history: list[dict] = []

@router.post("/")
async def chat_with_gemini(data: ChatMessage):
    settings = get_settings()
    
    # System Prompt Base
    system_prompt = (
        "Eres el Orientador Vocacional Oficial de Brújula Futura, una plataforma ecuatoriana. "
        "Tu misión es ayudar a bachilleres a explorar carreras y universidades. "
        "Sé amigable, directo, usa formato Markdown para resaltar textos clave (listas, negritas) "
        "y no uses un lenguaje robótico. Mantén las respuestas concisas (máximo 2 párrafos) a menos que te pidan detalles."
    )

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

        payload = {
            "model": model_name,
            "messages": messages
        }

        try:
            req = urllib.request.Request(
                url, 
                data=json.dumps(payload).encode("utf-8"), 
                headers=headers,
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=25) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                reply = res_body["choices"][0]["message"]["content"]
                return {"reply": reply}
        except Exception as e:
            err_msg = str(e)
            if hasattr(e, 'read'):
                try:
                    err_detail = json.loads(e.read().decode('utf-8'))
                    err_msg = err_detail.get("error", {}).get("message", err_msg)
                except:
                    pass
            logger.error(f"Error en llamada a {url}: {err_msg}")
            
            # Fallback en caso de que el enrutador gratuito general de OpenRouter falle, intentar con Llama 3.2 3B gratis directamente
            if is_openrouter and "openrouter/free" in model_name:
                logger.info("Intentando fallback a Llama 3.2 3B en OpenRouter...")
                try:
                    payload["model"] = "meta-llama/llama-3.2-3b-instruct:free"
                    req = urllib.request.Request(
                        url, 
                        data=json.dumps(payload).encode("utf-8"), 
                        headers=headers,
                        method="POST"
                    )
                    with urllib.request.urlopen(req, timeout=25) as response:
                        res_body = json.loads(response.read().decode("utf-8"))
                        reply = res_body["choices"][0]["message"]["content"]
                        return {"reply": reply}
                except Exception as fallback_e:
                    logger.error(f"Fallback a Llama 3 también falló: {fallback_e}")
            
            raise HTTPException(status_code=500, detail=f"Error al comunicar con la IA: {err_msg}")

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
            return {"reply": response.text}
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

