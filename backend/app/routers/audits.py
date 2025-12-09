"""Audit domain routes."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..services import audit_service

router = APIRouter(prefix="/audits", tags=["audits"])


@router.get("/", response_model=List[schemas.AuditRead])
def list_audits(db: Session = Depends(get_db)):
    return audit_service.list_audits(db)


@router.post("/", response_model=schemas.AuditRead, status_code=status.HTTP_201_CREATED)
def create_audit(payload: schemas.AuditCreate, db: Session = Depends(get_db)):
    return audit_service.create_audit(db, payload)


@router.get("/dashboard/summary", response_model=schemas.DashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)):
    return audit_service.build_dashboard_summary(db)


@router.get("/{audit_id}", response_model=schemas.AuditDetail)
def get_audit(audit_id: int, db: Session = Depends(get_db)):
    return audit_service.get_audit_or_404(db, audit_id)


@router.patch("/{audit_id}", response_model=schemas.AuditRead)
def update_audit(
    audit_id: int, payload: schemas.AuditUpdate, db: Session = Depends(get_db)
):
    audit = audit_service.get_audit_or_404(db, audit_id)
    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(audit, field, value)
    db.commit()
    db.refresh(audit)
    return audit


@router.post(
    "/{audit_id}/steps",
    response_model=schemas.AuditStepRead,
    status_code=status.HTTP_201_CREATED,
)
def upsert_step(audit_id: int, payload: schemas.AuditStepCreate, db: Session = Depends(get_db)):
    return audit_service.upsert_step(db, audit_id, payload)


@router.post(
    "/{audit_id}/findings",
    response_model=schemas.AuditFindingRead,
    status_code=status.HTTP_201_CREATED,
)
def add_finding(
    audit_id: int, payload: schemas.AuditFindingCreate, db: Session = Depends(get_db)
):
    return audit_service.add_finding(db, audit_id, payload)


@router.post(
    "/{audit_id}/findings/{finding_id}/evidence",
    response_model=schemas.EvidenceRead,
    status_code=status.HTTP_201_CREATED,
)
def add_evidence(
    audit_id: int,
    finding_id: int,
    payload: schemas.EvidenceCreate,
    db: Session = Depends(get_db),
):
    return audit_service.add_evidence(db, audit_id, finding_id, payload)
