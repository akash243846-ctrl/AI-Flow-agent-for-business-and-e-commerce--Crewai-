"""
AgentFlow AI - Backend Application Entrypoint
FastAPI application with CORS, modern lifespan database lifecycle, and OpenAPI documentation.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.database.session import init_db
from backend.app.api.routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist
    init_db()
    yield
    # Shutdown logic (if any)

def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Production Multi-Agent Business Research and Automation Platform powered by CrewAI & Google Gemini.",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Configure CORS for Vite frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routes
    app.include_router(router)

    @app.get("/", tags=["System"])
    def root():
        return {
            "message": "Welcome to AgentFlow AI Backend",
            "docs": "/docs",
            "health": "/health",
            "model": settings.GEMINI_MODEL
        }

    return app

app = create_application()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
