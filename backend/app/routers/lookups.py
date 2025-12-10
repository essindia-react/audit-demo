"""Reference data endpoints for the audit app."""
from __future__ import annotations

from typing import List

from fastapi import APIRouter

from .. import constants, schemas
from ..models import ComplianceStatusEnum, SeverityEnum

router = APIRouter(prefix="/lookups", tags=["lookups"])


@router.get("/bpp-steps")
def list_bpp_steps():
    return constants.BPP_NINE_STEPS


@router.get("/world-bank-steps")
def list_world_bank_steps():
    return constants.WORLD_BANK_PUBLISHED_STEPS


@router.get("/compliance-options", response_model=List[schemas.ComplianceOption])
def compliance_options():
    return [
        schemas.ComplianceOption(value=status, label=status.value.replace("_", " ").title())
        for status in ComplianceStatusEnum
    ]


@router.get("/severity-options", response_model=List[schemas.SeverityOption])
def severity_options():
    return [
        schemas.SeverityOption(value=severity, label=severity.value.title())
        for severity in SeverityEnum
    ]


@router.get("/monitoring-focus")
def monitoring_focus():
    return constants.MONITORING_AND_EVALUATION_FOCUS


@router.get("/modules")
def module_catalog():
    return constants.MODULE_CATALOG
