"""Entrypoint for the FastAPI application."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import engine
from .models import Base
from .routers import audits, lookups

settings = get_settings()

app = FastAPI(title=settings.app_name)

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


@app.get("/")
def root_healthcheck():
    return {"status": "ok", "app": settings.app_name}


app.include_router(lookups.router)
app.include_router(audits.router)
