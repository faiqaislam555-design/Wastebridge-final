from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app import models, crud
from app.auth import require_role, get_current_user

router = APIRouter(prefix="/api/operator", tags=["operator"])

_operator_dep = require_role(models.UserRole.operator)


# ── Schemas ───────────────────────────────────────────────────────────────────

class OperatorProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    about:        Optional[str] = None
    phone:        Optional[str] = None
    cities_served: Optional[str] = None
    license_number: Optional[str] = None
    pricing_model: Optional[str] = None
    pricing_value: Optional[str] = None


# ── Pickup Routes ─────────────────────────────────────────────────────────────

@router.get("/pickups")
def get_operator_pickups(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_operator_dep),
):
    operator = crud.get_operator_profile_by_user(db, current_user.id)
    if not operator:
        raise HTTPException(status_code=404, detail="Operator profile not found")
    return crud.get_pickups_for_operator(db, operator.id, status)


@router.put("/pickups/{pickup_id}/accept")
def accept_pickup(
    pickup_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_operator_dep),
):
    operator = crud.get_operator_profile_by_user(db, current_user.id)
    if not operator:
        raise HTTPException(status_code=404, detail="Operator profile not found")
    req = crud.operator_accept_pickup(db, pickup_id, operator.id)
    if not req:
        raise HTTPException(status_code=404, detail="Pickup not found")
    return req


@router.put("/pickups/{pickup_id}/decline")
def decline_pickup(
    pickup_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_operator_dep),
):
    operator = crud.get_operator_profile_by_user(db, current_user.id)
    if not operator:
        raise HTTPException(status_code=404, detail="Operator profile not found")
    req = crud.operator_decline_pickup(db, pickup_id, operator.id)
    if not req:
        raise HTTPException(status_code=404, detail="Pickup not found")
    return req


@router.put("/pickups/{pickup_id}/complete")
def complete_pickup(
    pickup_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_operator_dep),
):
    operator = crud.get_operator_profile_by_user(db, current_user.id)
    if not operator:
        raise HTTPException(status_code=404, detail="Operator profile not found")
    req = crud.operator_complete_pickup(db, pickup_id, operator.id)
    if not req:
        raise HTTPException(status_code=404, detail="Pickup not found")
    return req


# ── Stats & Earnings ──────────────────────────────────────────────────────────

@router.get("/stats")
def get_operator_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_operator_dep),
):
    operator = crud.get_operator_profile_by_user(db, current_user.id)
    if not operator:
        raise HTTPException(status_code=404, detail="Operator profile not found")
    return crud.get_operator_stats(db, operator.id)


@router.get("/earnings")
def get_operator_earnings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_operator_dep),
):
    operator = crud.get_operator_profile_by_user(db, current_user.id)
    if not operator:
        raise HTTPException(status_code=404, detail="Operator profile not found")
    return crud.get_operator_earnings(db, operator.id)


# ── Profile ───────────────────────────────────────────────────────────────────

@router.get("/me")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = crud.get_operator_profile_by_user(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/me")
def update_my_profile(
    data: OperatorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    profile = crud.get_operator_profile_by_user(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = data.model_dump(exclude_unset=True)
    print("Saving operator profile:", update_data)  # debug

    for key, value in update_data.items():
        if hasattr(profile, key):
            setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile