import sys

# Simulamos la lógica exacta del backend para ver si lanza excepción de roles.
try:
    import google.generativeai as genai
    from google.generativeai.types import ContentDict
    
    # Simular la entrada del usuario
    history_from_frontend = [
        {"role": "model", "content": "¡Hola! Soy el Orientador Vocacional Virtual de Brújula Futura. ¿En qué te puedo ayudar hoy?"},
        {"role": "user", "content": "hola"}
    ]
    
    system_prompt = "Eres un Orientador."
    
    # Lógica del backend
    gemini_history = [
        {"role": "user", "parts": [system_prompt]},
        {"role": "model", "parts": ["¡Entendido! Soy el Orientador Vocacional de Brújula Futura. ¿En qué te ayudo?"]}
    ]
    
    for msg in history_from_frontend:
        role = "user" if msg["role"] == "user" else "model"
        gemini_history.append({"role": role, "parts": [msg["content"]]})
        
    print("History generado:", gemini_history)
    
    # Intentar iniciar chat. Nota: Sin API_KEY, start_chat localmente podría funcionar si no valida hasta hacer send_message.
    # Pero los roles tal vez exploten al validar.
    model = genai.GenerativeModel("gemini-1.5-flash")
    chat = model.start_chat(history=gemini_history)
    print("start_chat OK!")
    
except Exception as e:
    print("ERROR:", str(e))
