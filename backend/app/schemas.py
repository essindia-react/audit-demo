"""Pydantic schemas for API requests and responses."""
from __future__ import annotations

from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field

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
    module_statuses: List["ModuleStatusRead"] = Field(default_factory=list)
    requirements: List["RequirementRead"] = Field(default_factory=list)
    requirement_stakeholders: List["StakeholderAnalysisRead"] = Field(default_factory=list)
    critical_needs: List["CriticalNeedRead"] = Field(default_factory=list)
    specification_analyses: List["SpecificationAnalysisRead"] = Field(default_factory=list)


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


class ModuleStatusBase(BaseModel):
    module_code: str
    submodule_code: str
    compliance_status: ComplianceStatusEnum = ComplianceStatusEnum.not_started
    owner: Optional[str] = None
    notes: Optional[str] = None
    evidence_reference: Optional[str] = None


class ModuleStatusCreate(ModuleStatusBase):
    pass


class ModuleStatusRead(ModuleStatusBase):
    id: int
    last_reviewed_at: datetime
    created_at: datetime

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class TokenData(BaseModel):
    sub: Optional[str] = None


class RequirementBase(BaseModel):
    title: str
    description: Optional[str] = None
    justification: str
    expected_outcomes: Optional[str] = None
    estimated_cost: Optional[float] = Field(default=None, ge=0)


class RequirementCreate(RequirementBase):
    pass


class RequirementRead(RequirementBase):
    id: int
    audit_id: int
    evidence_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class StakeholderAnalysisBase(BaseModel):
    name: str
    stakeholder_type: str
    role: str
    interest_level: str
    influence_level: str


class StakeholderAnalysisCreate(StakeholderAnalysisBase):
    pass


class StakeholderAnalysisRead(StakeholderAnalysisBase):
    id: int
    audit_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class CriticalNeedBase(BaseModel):
    need_item: str
    urgency_score: int = Field(..., ge=1, le=5)
    importance_score: int = Field(..., ge=1, le=5)


class CriticalNeedCreate(CriticalNeedBase):
    pass


class CriticalNeedRead(CriticalNeedBase):
    id: int
    audit_id: int
    is_critical: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class SpecificationAnalysisBase(BaseModel):
    technical_description: str
    openness_checks: List[str] = Field(default_factory=list)
    supplier_bias: bool = False
    market_notes: Optional[str] = None


class SpecificationAnalysisCreate(SpecificationAnalysisBase):
    pass


class SpecificationAnalysisRead(SpecificationAnalysisBase):
    id: int
    audit_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
