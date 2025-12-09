"""Pydantic schemas for API requests and responses."""
from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from .models import AuditStatusEnum, ComplianceStatusEnum, SeverityEnum


class StakeholderBase(BaseModel):
    stakeholder_group: str
    contact_name: Optional[str] = None
    contact_role: Optional[str] = None
    engagement_summary: Optional[str] = None
    last_interaction: Optional[date] = None


class StakeholderRead(StakeholderBase):
    id: int

    class Config:
        orm_mode = True


class MonitoringSnapshotBase(BaseModel):
    period_label: str
    contract_health_score: Optional[float] = Field(None, ge=0, le=100)
    financial_variance: Optional[float] = None
    schedule_variance: Optional[float] = None
    sustainability_score: Optional[float] = Field(None, ge=0, le=100)
    commentary: Optional[str] = None


class MonitoringSnapshotRead(MonitoringSnapshotBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class AuditBase(BaseModel):
    title: str
    procuring_entity: str
    description: Optional[str] = None
    status: AuditStatusEnum = AuditStatusEnum.planning
    country: Optional[str] = "Nigeria"
    sector: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget_amount: Optional[float] = Field(default=None, ge=0)


class AuditCreate(AuditBase):
    pass


class AuditUpdate(BaseModel):
    title: Optional[str] = None
    procuring_entity: Optional[str] = None
    description: Optional[str] = None
    status: Optional[AuditStatusEnum] = None
    country: Optional[str] = None
    sector: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget_amount: Optional[float] = Field(default=None, ge=0)


class AuditSummary(AuditBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class AuditRead(AuditSummary):
    pass


class AuditStepBase(BaseModel):
    step_number: int = Field(..., ge=1)
    step_name: str
    compliance_status: ComplianceStatusEnum = ComplianceStatusEnum.not_started
    risk_score: Optional[float] = Field(None, ge=0, le=100)
    owner: Optional[str] = None
    notes: Optional[str] = None
    evidence_reference: Optional[str] = None


class AuditStepCreate(AuditStepBase):
    pass


class AuditStepRead(AuditStepBase):
    id: int
    last_reviewed_at: datetime

    class Config:
        orm_mode = True


class EvidenceBase(BaseModel):
    evidence_type: str
    reference: str
    captured_by: Optional[str] = None


class EvidenceCreate(EvidenceBase):
    pass


class EvidenceRead(EvidenceBase):
    id: int
    captured_at: datetime

    class Config:
        orm_mode = True


class AuditFindingBase(BaseModel):
    category: str
    severity: SeverityEnum
    description: str
    recommendation: Optional[str] = None
    root_cause: Optional[str] = None
    corrective_action_owner: Optional[str] = None
    target_date: Optional[date] = None
    resolved: bool = False


class AuditFindingCreate(AuditFindingBase):
    pass


class AuditFindingRead(AuditFindingBase):
    id: int
    created_at: datetime
    evidences: List[EvidenceRead] = Field(default_factory=list)

    class Config:
        orm_mode = True


class AuditDetail(AuditRead):
    steps: List[AuditStepRead] = Field(default_factory=list)
    findings: List[AuditFindingRead] = Field(default_factory=list)
    stakeholders: List[StakeholderRead] = Field(default_factory=list)
    monitoring_snapshots: List[MonitoringSnapshotRead] = Field(default_factory=list)


class DashboardSummary(BaseModel):
    total_audits: int
    open_audits: int
    closed_audits: int
    findings_by_severity: dict
    compliance_distribution: dict


class ComplianceOption(BaseModel):
    value: ComplianceStatusEnum
    label: str


class SeverityOption(BaseModel):
    value: SeverityEnum
    label: str
