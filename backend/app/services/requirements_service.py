"""Requirement identification service layer."""
from __future__ import annotations

from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from .. import models, schemas
from ..config import get_settings
from . import audit_service

settings = get_settings()


def list_requirements(db: Session, audit_id: int) -> List[models.RequirementEntry]:
    audit_service.get_audit_or_404(db, audit_id)
    return (
        db.query(models.RequirementEntry)
        .filter(models.RequirementEntry.audit_id == audit_id)
        .order_by(models.RequirementEntry.created_at.desc())
        .all()
    )


def _store_evidence_file(file: UploadFile) -> str:
    suffix = Path(file.filename or "evidence").suffix
    filename = f"req_{uuid4().hex}{suffix}"
    destination = Path(settings.evidence_storage_dir) / filename
    with destination.open("wb") as buffer:
        buffer.write(file.file.read())
    return f"/evidence/{filename}"


def create_requirement(
    db: Session,
    audit_id: int,
    payload: schemas.RequirementCreate,
    evidence_file: Optional[UploadFile] = None,
) -> models.RequirementEntry:
    audit_service.get_audit_or_404(db, audit_id)
    evidence_path = None
    if evidence_file:
        evidence_path = _store_evidence_file(evidence_file)

    requirement = models.RequirementEntry(
        audit_id=audit_id,
        title=payload.title,
        description=payload.description,
        justification=payload.justification,
        expected_outcomes=payload.expected_outcomes,
        estimated_cost=payload.estimated_cost,
        evidence_path=evidence_path,
    )
    db.add(requirement)
    db.commit()
    db.refresh(requirement)
    return requirement
