"""Stakeholder analysis service."""
from __future__ import annotations

from typing import List

from sqlalchemy.orm import Session

from .. import models, schemas
from . import audit_service


def list_stakeholders(db: Session, audit_id: int) -> List[models.RequirementStakeholder]:
    audit_service.get_audit_or_404(db, audit_id)
    return (
        db.query(models.RequirementStakeholder)
        .filter(models.RequirementStakeholder.audit_id == audit_id)
        .order_by(models.RequirementStakeholder.created_at.desc())
        .all()
    )


def create_stakeholder(
    db: Session,
    audit_id: int,
    payload: schemas.StakeholderAnalysisCreate,
) -> models.RequirementStakeholder:
    audit_service.get_audit_or_404(db, audit_id)
    stakeholder = models.RequirementStakeholder(audit_id=audit_id, **payload.dict())
    db.add(stakeholder)
    db.commit()
    db.refresh(stakeholder)
    return stakeholder
