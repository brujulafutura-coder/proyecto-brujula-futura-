from fastapi import FastAPI, HTTPException, Header
import os

app = FastAPI(title="App Insegura - Laboratorio de Seguridad")

# ==========================================
# VULNERABILIDAD 1: Contraseñas visibles en código
# ==========================================
# Mala práctica: Hardcodear la cadena de conexión con usuario y clave real en el código.
DB_USER = "admin_brujula"
DB_PASS = "SuperSecretPassword123!"
DB_HOST = "localhost"
DB_NAME = "brujula_db"
DATABASE_URI = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"


# ==========================================
# VULNERABILIDAD 2: Tokens y Secretos expuestos
# ==========================================
# Mala práctica: Guardar el secreto de JWT directamente en el código fuente.
# Esto se subiría a Git y cualquier persona podría generar sus propios tokens.
JWT_SECRET_KEY = "mi_clave_secreta_muy_insegura_jwt_2026_xYz"
JWT_ALGORITHM = "HS256"


# ==========================================
# VULNERABILIDAD 3: Variables sensibles sin protección
# ==========================================
# Mala práctica: Guardar claves de APIs externas en variables globales en lugar de variables de entorno (.env).
AWS_S3_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE"
AWS_S3_SECRET_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"


# ==========================================
# VULNERABILIDAD 4: Privilegios administrativos innecesarios (Broken Access Control)
# ==========================================
# Simulamos una base de datos de usuarios
fake_users_db = {
    1: {"id": 1, "nombre": "Usuario Normal", "rol": "user"},
    2: {"id": 2, "nombre": "Administrador", "rol": "admin"}
}

@app.get("/api/users")
def get_users():
    """Ruta pública que devuelve datos básicos de usuarios."""
    return fake_users_db

@app.delete("/api/admin/delete_user/{user_id}")
def delete_user(user_id: int, user_role: str = Header("user")):
    """
    Ruta administrativa insegura.
    Mala práctica: No verifica si el usuario que hace la petición está autenticado
    correctamente ni valida su rol en el backend de forma segura. Confía en el input del cliente (Header).
    Un usuario normal puede simplemente enviar un header 'user-role: admin' o acceder directo.
    """
    if user_id not in fake_users_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Eliminamos al usuario sin validar privilegios reales
    deleted_user = fake_users_db.pop(user_id)
    return {
        "mensaje": "Usuario eliminado exitosamente", 
        "usuario_eliminado": deleted_user,
        "advertencia_seguridad": "Esta acción debió ser bloqueada para usuarios no administradores."
    }

if __name__ == "__main__":
    import uvicorn
    # Para ejecutar: python app_insegura.py
    print(f"Iniciando conexión a base de datos con URI: {DATABASE_URI}")
    uvicorn.run(app, host="0.0.0.0", port=8001)
