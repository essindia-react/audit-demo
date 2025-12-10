"""Stakeholder analysis endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..routers.auth import get_current_user
from ..services import stakeholder_analysis_service

router = APIRouter(prefix="/audits/{audit_id}/stakeholders", tags=["stakeholders"])


@router.get("/", response_model=list[schemas.StakeholderAnalysisRead])
def list_stakeholders(
    audit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return stakeholder_analysis_service.list_stakeholders(db, audit_id)


@router.post("/", response_model=schemas.StakeholderAnalysisRead)
def create_stakeholder(
    audit_id: int,
    payload: schemas.StakeholderAnalysisCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return stakeholder_analysis_service.create_stakeholder(db, audit_id, payload)
