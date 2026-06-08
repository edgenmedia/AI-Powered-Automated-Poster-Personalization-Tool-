from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.posters import router as posters_router

app = FastAPI(title="Posterly API", description="AI-powered poster personalization backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modular routers
app.include_router(posters_router)

@app.get("/")
def index():
    return "Posterly API is running"

@app.get("/api/health")     
def health_check():
    return {"status": "healthy"}
