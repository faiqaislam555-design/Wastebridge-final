from sqlalchemy.orm import joinedload
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import Optional, List
import uuid


from app import models, schemas
from app.auth import get_password_hash


# ──────────────────────────────────────────────
# User
# ──────────────────────────────────────────────

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_generator_user(db: Session, data: schemas.RegisterGeneratorRequest) -> models.User:
    user = models.User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        role=models.UserRole.generator,
    )
    db.add(user)
    db.flush()

    profile = models.GeneratorProfile(
        user_id=user.id,
        institution_type=data.institution_type,
        city=data.city,
        phone_number=data.phone_number,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    return user


def create_operator_user(db: Session, data: schemas.RegisterOperatorRequest) -> models.User:
    user = models.User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        role=models.UserRole.operator,
    )
    db.add(user)
    db.flush()

    profile = models.OperatorProfile(
        user_id=user.id,
        company_name=data.company_name,
        license_number=data.license_number,
        service_types=",".join(data.service_types),
        cities_served=data.cities_served,
        logo_letter=data.company_name[0].upper() if data.company_name else "O",
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    return user


# ──────────────────────────────────────────────
# Generator Profile
# ──────────────────────────────────────────────

def get_generator_profile(db: Session, user_id: int) -> Optional[models.GeneratorProfile]:
    return db.query(models.GeneratorProfile).filter(
        models.GeneratorProfile.user_id == user_id
    ).first()


def update_generator_profile(
    db: Session, user_id: int, data: schemas.GeneratorProfileUpdate
) -> Optional[models.GeneratorProfile]:
    profile = get_generator_profile(db, user_id)
    if not profile:
        return None

    update_data = data.model_dump(exclude_unset=True)

    # Fields that belong to User model
    user_fields = {"full_name", "email"}
    user_updates = {k: v for k, v in update_data.items() if k in user_fields}
    profile_updates = {k: v for k, v in update_data.items() if k not in user_fields}

    if user_updates:
        db.query(models.User).filter(models.User.id == user_id).update(user_updates)

    for key, value in profile_updates.items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile


def update_generator_logo(db: Session, user_id: int, logo_path: str) -> Optional[models.GeneratorProfile]:
    profile = get_generator_profile(db, user_id)
    if not profile:
        return None
    profile.logo_path = logo_path
    db.commit()
    db.refresh(profile)
    return profile


# ──────────────────────────────────────────────
# Operator
# ──────────────────────────────────────────────

def get_operators(
    db: Session,
    waste_type: Optional[str] = None,
    city: Optional[str] = None,
    min_rating: Optional[float] = None,
    pricing_model: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> List[models.OperatorProfile]:
    query = db.query(models.OperatorProfile)

    if waste_type:
        # Map frontend id to label
        type_mapping = {
            "cooked": "Cooked Food",
            "raw": "Raw Scraps",
            "expired": "Expired Stock",
            "packaging": "Packaging-Contaminated",
        }
        label = type_mapping.get(waste_type, waste_type)
        query = query.filter(models.OperatorProfile.service_types.contains(label))

    if city and city != "All":
        query = query.filter(models.OperatorProfile.cities_served.contains(city))

    if min_rating:
        query = query.filter(models.OperatorProfile.rating >= min_rating)

    if pricing_model:
        query = query.filter(models.OperatorProfile.pricing_model == pricing_model)

    return query.offset(skip).limit(limit).all()


def get_operator_profile_by_id(db: Session, operator_id: int) -> Optional[models.OperatorProfile]:
    return db.query(models.OperatorProfile).filter(
        models.OperatorProfile.id == operator_id
    ).first()


def get_operator_profile_by_user(db: Session, user_id: int) -> Optional[models.OperatorProfile]:
    return db.query(models.OperatorProfile).filter(
        models.OperatorProfile.user_id == user_id
    ).first()


# ──────────────────────────────────────────────
# Waste Log
# ──────────────────────────────────────────────

def create_waste_log(
    db: Session, user_id: int, data: schemas.WasteLogCreate
) -> models.WasteLog:
    log = models.WasteLog(user_id=user_id, **data.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_waste_logs(db: Session, user_id: int) -> List[models.WasteLog]:
    return (
        db.query(models.WasteLog)
        .filter(models.WasteLog.user_id == user_id)
        .order_by(models.WasteLog.created_at.desc())
        .all()
    )


def get_waste_log_by_id(db: Session, log_id: int, user_id: int) -> Optional[models.WasteLog]:
    return db.query(models.WasteLog).filter(
        models.WasteLog.id == log_id,
        models.WasteLog.user_id == user_id,
    ).first()


def update_waste_log_photo(db: Session, log_id: int, user_id: int, photo_path: str):
    log = get_waste_log_by_id(db, log_id, user_id)
    if log:
        log.photo_path = photo_path
        db.commit()
        db.refresh(log)
    return log


# ──────────────────────────────────────────────
# Pickup Requests
# ──────────────────────────────────────────────

def _generate_transaction_id() -> str:
    return f"TRX-{uuid.uuid4().hex[:6].upper()}"


def create_pickup_request(
    db: Session, user_id: int, data: schemas.PickupRequestCreate
) -> models.PickupRequest:
    req = models.PickupRequest(
        transaction_id=_generate_transaction_id(),
        user_id=user_id,
        **data.model_dump(),
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


def get_pickup_requests(
    db: Session,
    user_id: int,
    status: Optional[str] = None,
    operator_id: Optional[int] = None,
    date_range: Optional[str] = None,   # "30days" | "90days" | None
) -> List[models.PickupRequest]:
    query = db.query(models.PickupRequest).filter(
        models.PickupRequest.user_id == user_id
    )

    if status and status != "All":
        query = query.filter(models.PickupRequest.status == status)

    if operator_id:
        query = query.filter(models.PickupRequest.operator_profile_id == operator_id)

    if date_range == "30days":
        cutoff = datetime.utcnow() - timedelta(days=30)
        query = query.filter(models.PickupRequest.created_at >= cutoff)
    elif date_range == "90days":
        cutoff = datetime.utcnow() - timedelta(days=90)
        query = query.filter(models.PickupRequest.created_at >= cutoff)

    return query.order_by(models.PickupRequest.created_at.desc()).all()


def get_pickup_request_by_id(db: Session, request_id: int, user_id: int) -> Optional[models.PickupRequest]:
    return db.query(models.PickupRequest).filter(
        models.PickupRequest.id == request_id,
        models.PickupRequest.user_id == user_id,
    ).first()


def update_pickup_request(
    db: Session, request_id: int, user_id: int, data: schemas.PickupRequestUpdate
) -> Optional[models.PickupRequest]:
    req = get_pickup_request_by_id(db, request_id, user_id)
    if not req:
        return None

    old_status = req.status
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(req, key, value)
    db.commit()
    db.refresh(req)

    # Auto-create invoice when pickup is marked Completed
    if data.status == models.PickupStatus.completed and old_status != models.PickupStatus.completed:
        operator = db.query(models.OperatorProfile).filter(
            models.OperatorProfile.id == req.operator_profile_id
        ).first()
        operator_name = operator.company_name if operator else "Operator"
        create_invoice_for_pickup(db, req, operator_name)

    return req


def cancel_pickup_request(db: Session, request_id: int, user_id: int) -> Optional[models.PickupRequest]:
    req = get_pickup_request_by_id(db, request_id, user_id)
    if not req:
        return None
    req.status = models.PickupStatus.cancelled
    db.commit()
    db.refresh(req)
    return req


# ──────────────────────────────────────────────
# Dashboard Stats
# ──────────────────────────────────────────────

def get_dashboard_stats(db: Session, user_id: int) -> schemas.DashboardStatsOut:
    pending = db.query(func.count(models.PickupRequest.id)).filter(
        models.PickupRequest.user_id == user_id,
        models.PickupRequest.status == models.PickupStatus.pending,
    ).scalar() or 0

    week_cutoff = datetime.utcnow() + timedelta(days=7)
    upcoming = db.query(func.count(models.PickupRequest.id)).filter(
        models.PickupRequest.user_id == user_id,
        models.PickupRequest.status == models.PickupStatus.confirmed,
    ).scalar() or 0

    month_cutoff = datetime.utcnow() - timedelta(days=30)
    diverted = db.query(func.sum(models.PickupRequest.weight_kg)).filter(
        models.PickupRequest.user_id == user_id,
        models.PickupRequest.status == models.PickupStatus.completed,
        models.PickupRequest.created_at >= month_cutoff,
    ).scalar() or 0.0

    # CO2 factor: ~0.37 kg CO2 saved per kg food waste diverted from landfill
    co2_saved = round(float(diverted) * 0.37, 2)

    return schemas.DashboardStatsOut(
        pending_requests=pending,
        upcoming_pickups_week=upcoming,
        waste_diverted_month_kg=float(diverted),
        co2_saved_month_kg=co2_saved,
    )


# ──────────────────────────────────────────────
# Compliance Reports
# ──────────────────────────────────────────────

def create_compliance_report(
    db: Session, user_id: int, data: schemas.ComplianceReportRequest
) -> models.ComplianceReport:
    # Calculate totals from actual pickup data
    if data.report_type == "monthly":
        cutoff = datetime.utcnow() - timedelta(days=30)
    elif data.report_type == "quarterly":
        cutoff = datetime.utcnow() - timedelta(days=90)
    else:
        cutoff = datetime.utcnow() - timedelta(days=365)

    total = db.query(func.sum(models.PickupRequest.weight_kg)).filter(
        models.PickupRequest.user_id == user_id,
        models.PickupRequest.status == models.PickupStatus.completed,
        models.PickupRequest.created_at >= cutoff,
    ).scalar() or 0.0

    period = data.selected_period or data.report_type.capitalize()

    report = models.ComplianceReport(
        user_id=user_id,
        report_type=data.report_type,
        period=period,
        total_diverted=f"{int(total)} kg",
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def email_compliance_report(
    db: Session, user_id: int, data: schemas.EmailReportRequest
) -> models.ComplianceReport:
    report_req = schemas.ComplianceReportRequest(
        report_type=data.report_type,
        selected_period=data.selected_period,
    )
    report = create_compliance_report(db, user_id, report_req)
    report.emailed_to = data.regulator_email
    db.commit()
    db.refresh(report)
    return report


def get_compliance_reports(db: Session, user_id: int) -> List[models.ComplianceReport]:
    return (
        db.query(models.ComplianceReport)
        .filter(models.ComplianceReport.user_id == user_id)
        .order_by(models.ComplianceReport.generated_at.desc())
        .all()
    )

# ──────────────────────────────────────────────
# Invoices
# ──────────────────────────────────────────────

def get_invoices(db: Session, user_id: int) -> List[models.Invoice]:
    return (
        db.query(models.Invoice)
        .filter(models.Invoice.user_id == user_id)
        .order_by(models.Invoice.created_at.desc())
        .all()
    )

def create_invoice_for_pickup(db: Session, pickup: models.PickupRequest, operator_name: str) -> models.Invoice:
    import random
    # Generate unique invoice number
    while True:
        number = str(random.randint(1000, 9999))
        existing = db.query(models.Invoice).filter(models.Invoice.invoice_number == number).first()
        if not existing:
            break

    # Auto-calculate amount from operator pricing
    amount = 0.0
    pricing_desc = "See invoice"

    operator = db.query(models.OperatorProfile).filter(
        models.OperatorProfile.id == pickup.operator_profile_id
    ).first()

    if operator and operator.pricing_value:
        try:
            rate = float(operator.pricing_value)
            weight = float(pickup.weight_kg or 0)

            if operator.pricing_model == models.PricingModel.per_kg:
                amount = rate * weight
                pricing_desc = f"₨ {rate}/kg × {weight}kg"
            elif operator.pricing_model == models.PricingModel.flat:
                amount = rate
                pricing_desc = f"Flat fee ₨ {rate}"
            elif operator.pricing_model == models.PricingModel.pays:
                amount = rate * weight
                pricing_desc = f"Operator pays ₨ {rate}/kg × {weight}kg"
        except:
            pricing_desc = "Rate not set"

    invoice = models.Invoice(
        invoice_number=number,
        user_id=pickup.user_id,
        pickup_id=pickup.id,
        description=f"{operator_name} — {pickup.weight_kg}kg {pickup.waste_type} pickup — {pricing_desc}",
        amount=amount,
        status="Unpaid",
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice

def mark_invoice_paid(db: Session, invoice_number: str, user_id: int, payment_intent_id: str = None) -> Optional[models.Invoice]:
    invoice = db.query(models.Invoice).filter(
        models.Invoice.invoice_number == invoice_number,
        models.Invoice.user_id == user_id,
    ).first()
    if not invoice:
        return None
    invoice.status = "Paid"
    invoice.paid_at = datetime.utcnow()
    invoice.payment_intent_id = payment_intent_id
    db.commit()
    db.refresh(invoice)
    return invoice

# ──────────────────────────────────────────────
# Operator Pickup Management
# ──────────────────────────────────────────────

def get_pickups_for_operator(
    db: Session,
    operator_id: int,
    status: Optional[str] = None,
) -> List[models.PickupRequest]:
    
    # Incoming = pending with no operator assigned yet
    if status == "Pending":
        query = db.query(models.PickupRequest).filter(
            models.PickupRequest.status == models.PickupStatus.pending,
            models.PickupRequest.operator_profile_id == None,
        )
    # All other statuses = assigned to this operator
    elif status and status != "All":
        query = db.query(models.PickupRequest).filter(
            models.PickupRequest.operator_profile_id == operator_id,
            models.PickupRequest.status == status,
        )
    # No filter = incoming + all assigned to this operator
    else:
        from sqlalchemy import or_
        query = db.query(models.PickupRequest).filter(
            or_(
                # Pending unassigned = incoming
                models.PickupRequest.status == models.PickupStatus.pending,
                # All assigned to this operator
                models.PickupRequest.operator_profile_id == operator_id,
            )
        )

    return query.options(
        joinedload(models.PickupRequest.user).joinedload(models.User.generator_profile),
        joinedload(models.PickupRequest.operator_profile),
    ).order_by(models.PickupRequest.created_at.desc()).all()


def get_pending_pickups_for_operator(
    db: Session,
    operator_id: int,
) -> List[models.PickupRequest]:
    # Pending pickups = ones with no operator yet OR assigned to this operator
    return query.options(
    joinedload(models.PickupRequest.user).joinedload(models.User.generator_profile),
    joinedload(models.PickupRequest.operator_profile),
).order_by(models.PickupRequest.created_at.desc()).all()


def operator_accept_pickup(
    db: Session, pickup_id: int, operator_id: int
) -> Optional[models.PickupRequest]:
    req = db.query(models.PickupRequest).filter(
        models.PickupRequest.id == pickup_id,
    ).first()
    if not req:
        return None
    req.operator_profile_id = operator_id
    req.status = models.PickupStatus.confirmed
    req.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(req)
    return req


def operator_decline_pickup(
    db: Session, pickup_id: int, operator_id: int
) -> Optional[models.PickupRequest]:
    req = db.query(models.PickupRequest).filter(
        models.PickupRequest.id == pickup_id,
    ).first()
    if not req:
        return None
    req.status = models.PickupStatus.cancelled
    req.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(req)
    return req


def operator_complete_pickup(
    db: Session, pickup_id: int, operator_id: int
) -> Optional[models.PickupRequest]:
    req = db.query(models.PickupRequest).filter(
        models.PickupRequest.id == pickup_id,
        models.PickupRequest.operator_profile_id == operator_id,
    ).first()
    if not req:
        return None
    
    old_status = req.status
    req.status = models.PickupStatus.completed
    req.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(req)

    # Auto-create invoice when marked completed
    if old_status != models.PickupStatus.completed:
        operator = db.query(models.OperatorProfile).filter(
            models.OperatorProfile.id == operator_id
        ).first()
        operator_name = operator.company_name if operator else "Operator"
        create_invoice_for_pickup(db, req, operator_name)

    return req


def get_operator_stats(db: Session, operator_id: int) -> dict:
    incoming = db.query(func.count(models.PickupRequest.id)).filter(
    models.PickupRequest.status == models.PickupStatus.pending,
).scalar() or 0

    scheduled = db.query(func.count(models.PickupRequest.id)).filter(
        models.PickupRequest.operator_profile_id == operator_id,
        models.PickupRequest.status == models.PickupStatus.confirmed,
    ).scalar() or 0

    completed = db.query(func.count(models.PickupRequest.id)).filter(
        models.PickupRequest.operator_profile_id == operator_id,
        models.PickupRequest.status == models.PickupStatus.completed,
    ).scalar() or 0

    tonnes = db.query(func.sum(models.PickupRequest.weight_kg)).filter(
        models.PickupRequest.operator_profile_id == operator_id,
        models.PickupRequest.status == models.PickupStatus.completed,
    ).scalar() or 0.0

    month_cutoff = datetime.utcnow() - timedelta(days=30)
    revenue = db.query(func.sum(models.Invoice.amount)).filter(
        models.Invoice.status == "Paid",
        models.Invoice.created_at >= month_cutoff,
        models.Invoice.user_id == db.query(models.OperatorProfile.user_id).filter(
            models.OperatorProfile.id == operator_id
        ).scalar_subquery(),
    ).scalar() or 0.0

    return {
        "incomingCount": incoming,
        "scheduledCount": scheduled,
        "completedCount": completed,
        "tonnesProcessed": round(float(tonnes) / 1000, 2),
        "revenue": float(revenue),
    }


def get_operator_earnings(db: Session, operator_id: int) -> List[dict]:
    operator_user_id = db.query(models.OperatorProfile.user_id).filter(
        models.OperatorProfile.id == operator_id
    ).scalar()

    pickups = db.query(models.PickupRequest).filter(
        models.PickupRequest.operator_profile_id == operator_id,
        models.PickupRequest.status == models.PickupStatus.completed,
    ).order_by(models.PickupRequest.updated_at.desc()).all()

    result = []
    for p in pickups:
        result.append({
            "id": p.transaction_id or f"TRX-{p.id}",
            "date": p.updated_at.strftime("%b %d, %Y"),
            "description": f"Pickup completed — {p.waste_type} {p.weight_kg}kg",
            "amount": float(p.cost) if p.cost and str(p.cost).replace('.','').isdigit() else 0,
            "status": "Paid" if p.status == models.PickupStatus.completed else "Pending",
        })
    return result