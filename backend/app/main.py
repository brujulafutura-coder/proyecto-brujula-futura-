"""
Brújula Futura — Punto de Entrada del Backend
FastAPI Application con CORS habilitado para React.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, universidades, carreras, test_vocacional, versus, chat, analytics, admin

# Crear aplicación FastAPI
app = FastAPI(
    title="Brújula Futura API",
    description="API de orientación vocacional basada en el modelo RIASEC de Holland.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configurar CORS para permitir peticiones desde React (Vite / Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://brujula-futura.vercel.app",  # URL de producción estricta
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Permite cualquier subdominio de Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# [MEJORA DE SEGURIDAD]: Middleware para inyectar Cabeceras de Seguridad (Security Headers).
# Estas cabeceras protegen a la aplicación contra Clickjacking, MIME Sniffing y ataques XSS básicos.
from fastapi import Request

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Registrar routers
app.include_router(auth.router)
app.include_router(universidades.router)
app.include_router(carreras.router)
app.include_router(test_vocacional.router)
app.include_router(versus.router)
app.include_router(chat.router)
app.include_router(analytics.router)
app.include_router(admin.router)

@app.get("/", tags=["Health"])
def health_check():
    """Endpoint de verificación de salud del servidor."""
    return {
        "status": "online",
        "proyecto": "Brújula Futura",
        "version": "1.0.0",
        "mensaje": "API funcionando correctamente 🚀",
    }
