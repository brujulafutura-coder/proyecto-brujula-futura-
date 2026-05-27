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
        
        # Seleccionar el modelo rápido
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        # System Prompt Base (Fase 1)
        system_prompt = (
            "Eres el Orientador Vocacional Oficial de Brújula Futura, una plataforma ecuatoriana. "
            "Tu misión es ayudar a bachilleres a explorar carreras y universidades. "
            "Sé amigable, directo, usa formato Markdown para resaltar textos clave (listas, negritas) "
            "y no uses un lenguaje robótico. Mantén las respuestas concisas (máximo 2 párrafos) a menos que te pidan detalles."
        )
        
        # Construir el historial para Gemini
        gemini_history = [
            {"role": "user", "parts": [system_prompt]},
            {"role": "model", "parts": ["¡Entendido! Soy el Orientador Vocacional de Brújula Futura. ¿En qué te ayudo?"]}
        ]
        
        # Añadir el historial del usuario (mapeando roles)
        for msg in data.history:
            role = "user" if msg["role"] == "user" else "model"
            gemini_history.append({"role": role, "parts": [msg["content"]]})
            
        # Iniciar chat con historial
        chat = model.start_chat(history=gemini_history)
        
        # Enviar el nuevo mensaje
        response = chat.send_message(data.message)
        
        return {"reply": response.text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al comunicar con la IA: {str(e)}")
