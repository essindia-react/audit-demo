"""SQLAlchemy models for the procurement audit domain."""
from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Enum as SAEnum,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class AuditStatusEnum(str, Enum):
    planning = "planning"
    in_progress = "in_progress"
    fieldwork = "fieldwork"
    reporting = "reporting"
    closed = "closed"


class ComplianceStatusEnum(str, Enum):
    not_started = "not_started"
    compliant = "compliant"
    partially_compliant = "partially_compliant"
    non_compliant = "non_compliant"


class SeverityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AuditProject(Base):
    __tablename__ = "audit_projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    procuring_entity: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[AuditStatusEnum] = mapped_column(
        SAEnum(AuditStatusEnum), default=AuditStatusEnum.planning, nullable=False
    )
    country: Mapped[Optional[str]] = mapped_column(String(120), default="Nigeria")
    sector: Mapped[Optional[str]] = mapped_column(String(120))
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)
    budget_amount: Mapped[Optional[float]] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    steps: Mapped[List["AuditStep"]] = relationship(
        back_populates="audit", cascade="all, delete-orphan"
    )
    findings: Mapped[List["AuditFinding"]] = relationship(
        back_populates="audit", cascade="all, delete-orphan"
    )
    stakeholders: Mapped[List["StakeholderEngagement"]] = relationship(
        back_populates="audit", cascade="all, delete-orphan"
    )
    monitoring_snapshots: Mapped[List["MonitoringSnapshot"]] = relationship(
        back_populates="audit", cascade="all, delete-orphan"
    )
    module_statuses: Mapped[List["AuditModuleStatus"]] = relationship(
        back_populates="audit", cascade="all, delete-orphan"
    )
    requirement_entries: Mapped[List["RequirementEntry"]] = relationship(
        back_populates="audit", cascade="all, delete-orphan"
    )
    requirement_stakeholders: Mapped[List["RequirementStakeholder"]] = relationship(
        back_populates="audit", cascade="all, delete-orphan"
    )
    requirement_needs: Mapped[List["RequirementNeed"]] = relationship(
        back_populates="audit", cascade="all, delete-orphan"
    )
    specification_analyses: Mapped[List["SpecificationAnalysis"]] = relationship(
        back_populates="audit", cascade="all, delete-orphan"
    )


class AuditStep(Base):
    __tablename__ = "audit_steps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    audit_id: Mapped[int] = mapped_column(ForeignKey("audit_projects.id", ondelete="CASCADE"))
    step_number: Mapped[int] = mapped_column(Integer, nullable=False)
    step_name: Mapped[str] = mapped_column(String(255), nullable=False)
    compliance_status: Mapped[ComplianceStatusEnum] = mapped_column(
        SAEnum(ComplianceStatusEnum), default=ComplianceStatusEnum.not_started, nullable=False
    )
    risk_score: Mapped[Optional[float]] = mapped_column(Float)
    owner: Mapped[Optional[str]] = mapped_column(String(120))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    evidence_reference: Mapped[Optional[str]] = mapped_column(String(255))
    last_reviewed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    audit: Mapped[AuditProject] = relationship(back_populates="steps")


class AuditFinding(Base):
    __tablename__ = "audit_findings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    audit_id: Mapped[int] = mapped_column(ForeignKey("audit_projects.id", ondelete="CASCADE"))
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    severity: Mapped[SeverityEnum] = mapped_column(SAEnum(SeverityEnum), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[Optional[str]] = mapped_column(Text)
    root_cause: Mapped[Optional[str]] = mapped_column(Text)
    corrective_action_owner: Mapped[Optional[str]] = mapped_column(String(120))
    target_date: Mapped[Optional[date]] = mapped_column(Date)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    audit: Mapped[AuditProject] = relationship(back_populates="findings")
    evidences: Mapped[List["EvidenceItem"]] = relationship(
        back_populates="finding", cascade="all, delete-orphan"
    )


class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    finding_id: Mapped[int] = mapped_column(
        ForeignKey("audit_findings.id", ondelete="CASCADE"), nullable=False
    )
    evidence_type: Mapped[str] = mapped_column(String(120), nullable=False)
    reference: Mapped[str] = mapped_column(String(255), nullable=False)
    captured_by: Mapped[Optional[str]] = mapped_column(String(120))
    captured_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    finding: Mapped[AuditFinding] = relationship(back_populates="evidences")


class StakeholderEngagement(Base):
    __tablename__ = "stakeholder_engagements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    audit_id: Mapped[int] = mapped_column(ForeignKey("audit_projects.id", ondelete="CASCADE"))
    stakeholder_group: Mapped[str] = mapped_column(String(120), nullable=False)
    contact_name: Mapped[Optional[str]] = mapped_column(String(120))
    contact_role: Mapped[Optional[str]] = mapped_column(String(120))
    engagement_summary: Mapped[Optional[str]] = mapped_column(Text)
    last_interaction: Mapped[Optional[date]] = mapped_column(Date)

    audit: Mapped[AuditProject] = relationship(back_populates="stakeholders")


class MonitoringSnapshot(Base):
    __tablename__ = "monitoring_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    audit_id: Mapped[int] = mapped_column(ForeignKey("audit_projects.id", ondelete="CASCADE"))
    period_label: Mapped[str] = mapped_column(String(50), nullable=False)
    contract_health_score: Mapped[Optional[float]] = mapped_column(Float)
    financial_variance: Mapped[Optional[float]] = mapped_column(Float)
    schedule_variance: Mapped[Optional[float]] = mapped_column(Float)
    sustainability_score: Mapped[Optional[float]] = mapped_column(Float)
    commentary: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    audit: Mapped[AuditProject] = relationship(back_populates="monitoring_snapshots")


class AuditModuleStatus(Base):
    __tablename__ = "audit_module_statuses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    audit_id: Mapped[int] = mapped_column(ForeignKey("audit_projects.id", ondelete="CASCADE"))
    module_code: Mapped[str] = mapped_column(String(10), nullable=False)
    submodule_code: Mapped[str] = mapped_column(String(50), nullable=False)
    compliance_status: Mapped[ComplianceStatusEnum] = mapped_column(
        SAEnum(ComplianceStatusEnum), default=ComplianceStatusEnum.not_started, nullable=False
    )
    owner: Mapped[Optional[str]] = mapped_column(String(120))
    notes: Mapped[Optional[str]] = mapped_column(Text)
    evidence_reference: Mapped[Optional[str]] = mapped_column(String(255))
    last_reviewed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    audit: Mapped[AuditProject] = relationship(back_populates="module_statuses")


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RequirementEntry(Base):
    __tablename__ = "requirement_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    audit_id: Mapped[int] = mapped_column(ForeignKey("audit_projects.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    justification: Mapped[str] = mapped_column(Text, nullable=False)
    expected_outcomes: Mapped[Optional[str]] = mapped_column(Text)
    estimated_cost: Mapped[Optional[float]] = mapped_column(Float)
    evidence_path: Mapped[Optional[str]] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    audit: Mapped[AuditProject] = relationship(back_populates="requirement_entries")


class RequirementStakeholder(Base):
    __tablename__ = "requirement_stakeholders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    audit_id: Mapped[int] = mapped_column(ForeignKey("audit_projects.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    stakeholder_type: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False)
    interest_level: Mapped[str] = mapped_column(String(20), nullable=False)
    influence_level: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    audit: Mapped[AuditProject] = relationship(back_populates="requirement_stakeholders")


class RequirementNeed(Base):
    __tablename__ = "requirement_needs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    audit_id: Mapped[int] = mapped_column(ForeignKey("audit_projects.id", ondelete="CASCADE"))
    need_item: Mapped[str] = mapped_column(String(255), nullable=False)
    urgency_score: Mapped[int] = mapped_column(Integer, nullable=False)
    importance_score: Mapped[int] = mapped_column(Integer, nullable=False)
    is_critical: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    audit: Mapped[AuditProject] = relationship(back_populates="requirement_needs")


class SpecificationAnalysis(Base):
    __tablename__ = "specification_analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    audit_id: Mapped[int] = mapped_column(ForeignKey("audit_projects.id", ondelete="CASCADE"))
    technical_description: Mapped[str] = mapped_column(Text, nullable=False)
    openness_checks: Mapped[List[str]] = mapped_column(JSON, default=list)
    supplier_bias: Mapped[bool] = mapped_column(Boolean, default=False)
    market_notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    audit: Mapped[AuditProject] = relationship(back_populates="specification_analyses")
