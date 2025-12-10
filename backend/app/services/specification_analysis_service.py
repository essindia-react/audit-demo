"""Specification analysis service layer."""
from __future__ import annotations

from typing import List

from sqlalchemy.orm import Session

from .. import models, schemas
from . import audit_service


def list_analyses(db: Session, audit_id: int) -> List[models.SpecificationAnalysis]:
    audit_service.get_audit_or_404(db, audit_id)
    return (
        db.query(models.SpecificationAnalysis)
        .filter(models.SpecificationAnalysis.audit_id == audit_id)
        .order_by(models.SpecificationAnalysis.created_at.desc())
        .all()
    )


def create_analysis(
    db: Session,
    audit_id: int,
    payload: schemas.SpecificationAnalysisCreate,
) -> models.SpecificationAnalysis:
    audit_service.get_audit_or_404(db, audit_id)
    analysis = models.SpecificationAnalysis(
        audit_id=audit_id,
        technical_description=payload.technical_description,
        openness_checks=payload.openness_checks,
        supplier_bias=payload.supplier_bias,
        market_notes=payload.market_notes,
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis
