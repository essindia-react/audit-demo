"""Critical needs assessment endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..routers.auth import get_current_user
from ..services import critical_need_service

router = APIRouter(prefix="/audits/{audit_id}/critical-needs", tags=["critical_needs"])


@router.get("/", response_model=list[schemas.CriticalNeedRead])
def list_needs(
    audit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return critical_need_service.list_needs(db, audit_id)


@router.post("/", response_model=schemas.CriticalNeedRead)
def create_need(
    audit_id: int,
    payload: schemas.CriticalNeedCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return critical_need_service.create_need(db, audit_id, payload)
