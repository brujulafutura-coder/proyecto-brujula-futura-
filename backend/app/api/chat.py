from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import google.generativeai as genai

from app.core.config import get_settings

router = APIRouter(prefix="/api/chat", tags=["Chatbot"])

class ChatMessage(BaseModel):
    message: str
    history: list[dict] = []

@router.post("/")
async def chat_with_gemini(data: ChatMessage):
    settings = get_settings()
    
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key no configurada en el servidor.")
        
    try:
        # Configurar Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        # System Prompt Base (Fase 1)
        system_prompt = (
            "Eres el Orientador Vocacional Oficial de Brújula Futura, una plataforma ecuatoriana. "
            "Tu misión es ayudar a bachilleres a explorar carreras y universidades. "
            "Sé amigable, directo, usa formato Markdown para resaltar textos clave (listas, negritas) "
            "y no uses un lenguaje robótico. Mantén las respuestas concisas (máximo 2 párrafos) a menos que te pidan detalles."
        )
        
        # Seleccionar el modelo rápido con System Instruction nativo de Gemini 1.5
        model = genai.GenerativeModel("gemini-1.5-flash", system_instruction=system_prompt)
        
        # Modo Diagnóstico
        if data.message.strip() == "/debug":
            try:
                models = genai.list_models()
                available_models = [m.name for m in models if "generateContent" in m.supported_generation_methods]
                models_str = "\n".join([f"- `{name}`" for name in available_models])
                if not available_models:
                    return {"reply": "⚠️ **Diagnóstico:** Tu API Key es válida, pero Google reporta que tienes **CERO modelos** de generación disponibles. Podría ser un bloqueo regional o tu cuenta de AI Studio no tiene habilitado el API."}
                return {"reply": f"🛠️ **Diagnóstico Exitoso!** Tu API Key tiene acceso a estos modelos:\n\n{models_str}\n\n👉 *Por favor, envía una captura de esta lista para que configuremos el correcto.*"}
            except Exception as inner_e:
                return {"reply": f"⚠️ **Error en Diagnóstico:** Falló al listar modelos. La API Key podría ser inválida o hay un problema de red: {str(inner_e)}"}

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
            # Intento 1: Gemini 1.5 Flash (Mejor y más rápido)
            model = genai.GenerativeModel("gemini-1.5-flash-latest", system_instruction=system_prompt)
            chat = model.start_chat(history=gemini_history)
            response = chat.send_message(data.message)
        except Exception as inner_e:
            print(f"Fallback a gemini-pro por error: {inner_e}")
            # Intento 2: Fallback a Gemini Pro (1.0) si 1.5-flash no está disponible en la región/API Key
            # Gemini Pro 1.0 no soporta system_instruction como parámetro, hay que inyectarlo
            model = genai.GenerativeModel("gemini-pro")
            fallback_history = [{"role": "user", "parts": [system_prompt]}, {"role": "model", "parts": ["Entendido."]}] + gemini_history
            chat = model.start_chat(history=fallback_history)
            response = chat.send_message(data.message)
        
        return {"reply": response.text}
        
    except Exception as e:
        print(f"Error Gemini: {e}")
        raise HTTPException(status_code=500, detail=f"Error al comunicar con la IA: {str(e)}")
