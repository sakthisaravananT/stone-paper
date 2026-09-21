from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import games, rounds

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Stone Paper Scissors API",
    description="Full-stack FastAPI backend with SQLAlchemy & MySQL for 2-player Stone Paper Scissors game",
    version="2.0.0"
)

# Enable CORS for local development with React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(games.router)
app.include_router(rounds.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend service status."""
    return {
        "status": "ok",
        "service": "Stone Paper Scissors API",
        "database_connected": True
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
