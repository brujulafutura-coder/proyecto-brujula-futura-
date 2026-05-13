"""
Brújula Futura — Punto de Entrada del Backend
FastAPI Application con CORS habilitado para React.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, universidades, carreras, test_vocacional, versus

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
        "http://localhost:5173",    # Vite dev server
        "http://localhost:3000",    # Alternativa
        "https://*.vercel.app",     # Producción en Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(auth.router)
app.include_router(universidades.router)
app.include_router(carreras.router)
app.include_router(test_vocacional.router)
app.include_router(versus.router)


@app.get("/", tags=["Health"])
def health_check():
    """Endpoint de verificación de salud del servidor."""
    return {
        "status": "online",
        "proyecto": "Brújula Futura",
        "version": "1.0.0",
        "mensaje": "API funcionando correctamente 🚀",
    }
