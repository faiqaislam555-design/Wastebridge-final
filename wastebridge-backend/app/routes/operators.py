from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas, models
from app.auth import get_current_user

router = APIRouter(prefix="/api/operators", tags=["operators"])


def _profile_to_list_item(p: models.OperatorProfile) -> schemas.OperatorListItem:
    first_city = (p.cities_served or "").split(",")[0].strip() if p.cities_served else None
    return schemas.OperatorListItem(
        id=p.id,
        company_name=p.company_name,
        logo_letter=p.logo_letter,
        rating=p.rating,
        review_count=p.review_count,
        city=first_city,
        pricing_model=p.pricing_model,
        pricing_value=p.pricing_value,
        service_types=p.service_types,
    )


@router.get("", response_model=List[schemas.OperatorListItem])
def list_operators(
    waste_type:   Optional[str]   = Query(None, description="cooked|raw|expired|packaging"),
    city:         Optional[str]   = Query(None),
    min_rating:   Optional[float] = Query(None),
    pricing_model: Optional[str] = Query(None, description="per_kg|flat|pays"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    profiles = crud.get_operators(db, waste_type, city, min_rating, pricing_model, skip, limit)
    return [_profile_to_list_item(p) for p in profiles]


@router.get("/{operator_id}", response_model=schemas.OperatorProfileOut)
def get_operator(
    operator_id: int,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    from fastapi import HTTPException
    profile = crud.get_operator_profile_by_id(db, operator_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Operator not found")
    return profile
