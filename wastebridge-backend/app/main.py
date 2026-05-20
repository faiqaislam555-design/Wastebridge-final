from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base
from app.routes import auth, generator_profile, operators, waste_logs, pickups, reports, payments
# ──────────────────────────────────────────────
# Create all tables
# ──────────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# Ensure upload dirs exist
os.makedirs("uploads/logos", exist_ok=True)
os.makedirs("uploads/waste-photos", exist_ok=True)
os.makedirs("uploads/documents", exist_ok=True)

# ──────────────────────────────────────────────
# App
# ──────────────────────────────────────────────
app = FastAPI(
    title="WasteBridge API",
    description="Backend API for WasteBridge — connecting food waste generators with certified disposal operators.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ──────────────────────────────────────────────
# CORS (allow frontend dev server)
# ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# Static file serving for uploaded images
# ──────────────────────────────────────────────
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ──────────────────────────────────────────────
# Routers
# ──────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(generator_profile.router)
app.include_router(operators.router)
app.include_router(waste_logs.router)
app.include_router(pickups.router)
app.include_router(reports.router)
app.include_router(payments.router)
from app.routes import invoices
app.include_router(invoices.router)
from app.routes import operator as operator_routes
app.include_router(operator_routes.router)


# ──────────────────────────────────────────────
# Health check
# ──────────────────────────────────────────────
@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "service": "WasteBridge API", "version": "1.0.0"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "healthy"}
