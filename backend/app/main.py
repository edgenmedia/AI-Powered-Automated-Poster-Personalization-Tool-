import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from app.routes.posters import router as posters_router

# Load env variables
load_dotenv()

# Ensure static/generated folder exists
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
GENERATED_DIR = os.path.join(STATIC_DIR, "generated")
os.makedirs(GENERATED_DIR, exist_ok=True)

# Ensure uploads/generated folder exists
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
UPLOADS_GENERATED_DIR = os.path.join(UPLOADS_DIR, "generated")
os.makedirs(UPLOADS_GENERATED_DIR, exist_ok=True)

app = FastAPI(title="Posterly API", description="AI-powered poster personalization backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files folder to serve generated images
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Include modular routers
app.include_router(posters_router)

@app.get("/")
def index():
    return "Posterly API is running"

@app.get("/api/health")     
def health_check():
    return {"status": "healthy"}
