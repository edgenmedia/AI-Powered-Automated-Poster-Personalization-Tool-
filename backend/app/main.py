from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import Routers
from app.routes.upload import router as upload_router
from app.routes.template import router as template_router
from app.routes.generate import router as generate_router


app = FastAPI(
    title="PosterForge AI",
    description="AI-Powered Automated Poster Personalization Tool",
    version="1.0.0"
)


# ==========================
# CORS
# ==========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================
# Create Required Directories
# ==========================
REQUIRED_DIRS = [
    "uploads",
    "uploads/posters",
    "uploads/contacts",
    "outputs",
    "outputs/posters",
    "templates",
]

for directory in REQUIRED_DIRS:
    os.makedirs(directory, exist_ok=True)


# ==========================
# Serve Generated Posters
# ==========================
app.mount(
    "/outputs",
    StaticFiles(directory="outputs"),
    name="outputs"
)


# ==========================
# Register Routers
# ==========================
app.include_router(
    upload_router,
    tags=["Upload"]
)

app.include_router(
    template_router,
    tags=["Template"]
)

app.include_router(
    generate_router,
    tags=["Generate"]
)


# ==========================
# Root
# ==========================
@app.get("/")
def root():
    return {
        "message": "Welcome to PosterForge AI 🚀",
        "version": "1.0.0",
        "docs": "/docs",
    }


# ==========================
# Health Check
# ==========================
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "PosterForge AI",
    }