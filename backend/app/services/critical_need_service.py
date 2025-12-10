"""Critical needs assessment service."""
from __future__ import annotations

from typing import List

from sqlalchemy.orm import Session

from .. import models, schemas
from . import audit_service


THRESHOLD = 7  # urgency + importance >= threshold => critical


def _is_critical(urgency: int, importance: int) -> bool:
    return (urgency + importance) >= THRESHOLD or (urgency >= 4 and importance >= 4)


def list_needs(db: Session, audit_id: int) -> List[models.RequirementNeed]:
    audit_service.get_audit_or_404(db, audit_id)
    return (
        db.query(models.RequirementNeed)
        .filter(models.RequirementNeed.audit_id == audit_id)
        .order_by(models.RequirementNeed.created_at.desc())
        .all()
    )


def create_need(
    db: Session,
    audit_id: int,
    payload: schemas.CriticalNeedCreate,
) -> models.RequirementNeed:
    audit_service.get_audit_or_404(db, audit_id)
    is_critical = _is_critical(payload.urgency_score, payload.importance_score)
    need = models.RequirementNeed(
        audit_id=audit_id,
        is_critical=is_critical,
        **payload.dict(),
    )
    db.add(need)
    db.commit()
    db.refresh(need)
    return need
