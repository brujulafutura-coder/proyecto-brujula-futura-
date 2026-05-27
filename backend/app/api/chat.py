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
        
        # Construir y sanitizar el historial para Gemini
        # Gemini exige que el historial empiece con 'user' y que los roles alternen estrictamente.
        gemini_history = []
        for msg in data.history:
            role = "user" if msg["role"] == "user" else "model"
            # Evitar que empiece con 'model' (ej. el saludo inicial del frontend)
            if not gemini_history and role == "model":
                continue
            # Combinar mensajes consecutivos del mismo rol para no romper la regla de alternancia
            if gemini_history and gemini_history[-1]["role"] == role:
                gemini_history[-1]["parts"][0] += f"\n\n{msg['content']}"
            else:
                gemini_history.append({"role": role, "parts": [msg["content"]]})
            
        # Iniciar chat con historial sanitizado
        chat = model.start_chat(history=gemini_history)
        
        # Enviar el nuevo mensaje
        response = chat.send_message(data.message)
        
        return {"reply": response.text}
        
    except Exception as e:
        print(f"Error Gemini: {e}")
        raise HTTPException(status_code=500, detail=f"Error al comunicar con la IA: {str(e)}")
