"""Specification analysis endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..routers.auth import get_current_user
from ..services import specification_analysis_service

router = APIRouter(prefix="/audits/{audit_id}/specifications", tags=["specifications"])


@router.get("/", response_model=list[schemas.SpecificationAnalysisRead])
def list_specifications(
    audit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return specification_analysis_service.list_analyses(db, audit_id)


@router.post("/", response_model=schemas.SpecificationAnalysisRead)
def create_specification(
    audit_id: int,
    payload: schemas.SpecificationAnalysisCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return specification_analysis_service.create_analysis(db, audit_id, payload)
