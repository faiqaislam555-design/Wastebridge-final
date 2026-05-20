from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas, models
from app.auth import require_role

router = APIRouter(prefix="/api/reports", tags=["compliance-reports"])

_generator_dep = require_role(models.UserRole.generator, models.UserRole.admin)


@router.post("", response_model=schemas.ComplianceReportOut, status_code=201)
def generate_report(
    data: schemas.ComplianceReportRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    if data.report_type not in ("monthly", "quarterly", "annual"):
        raise HTTPException(status_code=400, detail="report_type must be monthly, quarterly, or annual")
    return crud.create_compliance_report(db, current_user.id, data)


@router.post("/email", response_model=schemas.ComplianceReportOut, status_code=201)
def email_report(
    data: schemas.EmailReportRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    """Generate report and record the regulator email it was sent to."""
    if data.report_type not in ("monthly", "quarterly", "annual"):
        raise HTTPException(status_code=400, detail="report_type must be monthly, quarterly, or annual")
    return crud.email_compliance_report(db, current_user.id, data)


@router.get("", response_model=List[schemas.ComplianceReportOut])
def list_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    return crud.get_compliance_reports(db, current_user.id)
