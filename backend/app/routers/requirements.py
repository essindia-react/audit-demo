"""Requirement identification endpoints."""
from __future__ import annotations

from fastapi import Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from .. import schemas
from ..database import get_db
from ..routers.auth import get_current_user
from ..services import requirements_service

router = None

from fastapi import APIRouter

router = APIRouter(prefix="/audits/{audit_id}/requirements", tags=["requirements"])


@router.get("/", response_model=list[schemas.RequirementRead])
def list_requirements(
    audit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return requirements_service.list_requirements(db, audit_id)


@router.post("/", response_model=schemas.RequirementRead)
async def create_requirement(
    audit_id: int,
    title: str = Form(...),
    justification: str = Form(...),
    description: str | None = Form(None),
    expected_outcomes: str | None = Form(None),
    estimated_cost: float | None = Form(None),
    evidence: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    payload = schemas.RequirementCreate(
        title=title,
        justification=justification,
        description=description,
        expected_outcomes=expected_outcomes,
        estimated_cost=estimated_cost,
    )
    requirement = requirements_service.create_requirement(
        db=db,
        audit_id=audit_id,
        payload=payload,
        evidence_file=evidence,
    )
    return requirement
