"""Service functions to orchestrate audit operations."""
from __future__ import annotations

from datetime import datetime
from typing import List

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from .. import models, schemas


def list_audits(db: Session) -> List[models.AuditProject]:
    return db.query(models.AuditProject).order_by(models.AuditProject.created_at.desc()).all()


def get_audit_or_404(db: Session, audit_id: int) -> models.AuditProject:
    audit = (
        db.query(models.AuditProject)
        .filter(models.AuditProject.id == audit_id)
        .options(
            selectinload(models.AuditProject.steps),
            selectinload(models.AuditProject.findings).selectinload(models.AuditFinding.evidences),
            selectinload(models.AuditProject.stakeholders),
            selectinload(models.AuditProject.monitoring_snapshots),
            selectinload(models.AuditProject.module_statuses),
            selectinload(models.AuditProject.requirement_entries),
            selectinload(models.AuditProject.requirement_stakeholders),
            selectinload(models.AuditProject.requirement_needs),
        )
        .first()
    )
    if not audit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit not found")
    return audit


def create_audit(db: Session, payload: schemas.AuditCreate) -> models.AuditProject:
    audit = models.AuditProject(**payload.dict())
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit


def upsert_step(db: Session, audit_id: int, payload: schemas.AuditStepCreate) -> models.AuditStep:
    audit = get_audit_or_404(db, audit_id)
    step = (
        db.query(models.AuditStep)
        .filter(
            models.AuditStep.audit_id == audit.id,
            models.AuditStep.step_number == payload.step_number,
        )
        .first()
    )
    if step:
        for field, value in payload.dict().items():
            setattr(step, field, value)
    else:
        step = models.AuditStep(audit_id=audit.id, **payload.dict())
        db.add(step)

    db.commit()
    db.refresh(step)
    return step


def add_finding(db: Session, audit_id: int, payload: schemas.AuditFindingCreate) -> models.AuditFinding:
    audit = get_audit_or_404(db, audit_id)
    finding = models.AuditFinding(audit_id=audit.id, **payload.dict())
    db.add(finding)
    db.commit()
    db.refresh(finding)
    return finding


def add_evidence(
    db: Session, audit_id: int, finding_id: int, payload: schemas.EvidenceCreate
) -> models.EvidenceItem:
    get_audit_or_404(db, audit_id)
    finding = (
        db.query(models.AuditFinding)
        .filter(
            models.AuditFinding.id == finding_id,
            models.AuditFinding.audit_id == audit_id,
        )
        .first()
    )
    if not finding:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finding not found")

    evidence = models.EvidenceItem(finding_id=finding.id, **payload.dict())
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    return evidence


def upsert_module_status(
    db: Session, audit_id: int, payload: schemas.ModuleStatusCreate
) -> models.AuditModuleStatus:
    audit = get_audit_or_404(db, audit_id)
    record = (
        db.query(models.AuditModuleStatus)
        .filter(
            models.AuditModuleStatus.audit_id == audit.id,
            models.AuditModuleStatus.module_code == payload.module_code,
            models.AuditModuleStatus.submodule_code == payload.submodule_code,
        )
        .first()
    )
    if record:
        for field, value in payload.dict().items():
            setattr(record, field, value)
        record.last_reviewed_at = datetime.utcnow()
    else:
        record = models.AuditModuleStatus(audit_id=audit.id, **payload.dict())
        db.add(record)

    db.commit()
    db.refresh(record)
    return record


def build_dashboard_summary(db: Session) -> schemas.DashboardSummary:
    total_audits = db.query(func.count(models.AuditProject.id)).scalar() or 0
    closed_audits = (
        db.query(func.count(models.AuditProject.id))
        .filter(models.AuditProject.status == models.AuditStatusEnum.closed)
        .scalar()
        or 0
    )
    open_audits = total_audits - closed_audits

    severity_rows = (
        db.query(models.AuditFinding.severity, func.count(models.AuditFinding.id))
        .group_by(models.AuditFinding.severity)
        .all()
    )
    findings_by_severity = {sev.value: count for sev, count in severity_rows}

    compliance_rows = (
        db.query(models.AuditStep.compliance_status, func.count(models.AuditStep.id))
        .group_by(models.AuditStep.compliance_status)
        .all()
    )
    compliance_distribution = {status.value: count for status, count in compliance_rows}

    return schemas.DashboardSummary(
        total_audits=total_audits,
        open_audits=open_audits,
        closed_audits=closed_audits,
        findings_by_severity=findings_by_severity,
        compliance_distribution=compliance_distribution,
    )
*** End of File**