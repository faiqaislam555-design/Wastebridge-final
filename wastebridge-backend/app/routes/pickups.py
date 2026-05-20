from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas, models
from app.auth import require_role

router = APIRouter(prefix="/api/pickups", tags=["pickups"])

_generator_dep = require_role(models.UserRole.generator, models.UserRole.admin)


@router.post("", response_model=schemas.PickupRequestOut, status_code=201)
def request_pickup(
    data: schemas.PickupRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    return crud.create_pickup_request(db, current_user.id, data)


@router.get("", response_model=List[schemas.PickupRequestOut])
def list_pickups(
    status:      Optional[str] = Query(None),
    operator_id: Optional[int] = Query(None),
    date_range:  Optional[str] = Query(None, description="30days|90days"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    return crud.get_pickup_requests(db, current_user.id, status, operator_id, date_range)


@router.get("/stats", response_model=schemas.DashboardStatsOut)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    return crud.get_dashboard_stats(db, current_user.id)


@router.get("/{request_id}", response_model=schemas.PickupRequestOut)
def get_pickup(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    req = crud.get_pickup_request_by_id(db, request_id, current_user.id)
    if not req:
        raise HTTPException(status_code=404, detail="Pickup request not found")
    return req


@router.put("/{request_id}", response_model=schemas.PickupRequestOut)
def update_pickup(
    request_id: int,
    data: schemas.PickupRequestUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    req = crud.update_pickup_request(db, request_id, current_user.id, data)
    if not req:
        raise HTTPException(status_code=404, detail="Pickup request not found")
    return req


@router.delete("/{request_id}", response_model=schemas.PickupRequestOut)
def cancel_pickup(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    req = crud.cancel_pickup_request(db, request_id, current_user.id)
    if not req:
        raise HTTPException(status_code=404, detail="Pickup request not found")
    return req
