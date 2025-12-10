"""Entrypoint for the FastAPI application."""
from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .database import engine
from .models import Base
from .routers import (
    audits,
    auth,
    critical_needs,
    lookups,
    requirements,
    specification_analyses,
    stakeholder_analysis,
)

settings = get_settings()

Path(settings.evidence_storage_dir).mkdir(parents=True, exist_ok=True)

app = FastAPI(title=settings.app_name)
app.mount("/evidence", StaticFiles(directory=settings.evidence_storage_dir), name="evidence")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    if settings.sync_schema_on_startup:
        Base.metadata.create_all(bind=engine)
    Path(settings.evidence_storage_dir).mkdir(parents=True, exist_ok=True)


@app.get("/")
def root_healthcheck():
    return {"status": "ok", "app": settings.app_name}


app.include_router(lookups.router)
app.include_router(audits.router)
app.include_router(auth.router)
app.include_router(requirements.router)
app.include_router(stakeholder_analysis.router)
app.include_router(critical_needs.router)
app.include_router(specification_analyses.router)
