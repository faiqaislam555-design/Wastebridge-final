from sqlalchemy import (
    Column, Integer, String, Float, Boolean,
    DateTime, ForeignKey, Text, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


# ──────────────────────────────────────────────
# Enums
# ──────────────────────────────────────────────

class UserRole(str, enum.Enum):
    generator = "generator"
    operator  = "operator"
    admin     = "admin"


class InstitutionType(str, enum.Enum):
    school      = "school"
    restaurant  = "restaurant"
    hotel       = "hotel"
    bakery      = "bakery"
    corporate   = "corporate"
    supermarket = "supermarket"
    other       = "other"


class WasteType(str, enum.Enum):
    cooked    = "cooked"
    raw       = "raw"
    expired   = "expired"
    packaging = "packaging"


class UrgencyLevel(str, enum.Enum):
    flexible = "flexible"
    urgent   = "urgent"


class PickupStatus(str, enum.Enum):
    pending   = "Pending"
    confirmed = "Confirmed"
    completed = "Completed"
    disputed  = "Disputed"
    cancelled = "Cancelled"


class PricingModel(str, enum.Enum):
    per_kg = "per_kg"
    flat   = "flat"
    pays   = "pays"


class PaymentMethod(str, enum.Enum):
    card = "card"
    bank = "bank"


# ──────────────────────────────────────────────
# User / Auth
# ──────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    full_name      = Column(String(255), nullable=False)
    email          = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role           = Column(SAEnum(UserRole), default=UserRole.generator, nullable=False)
    is_active      = Column(Boolean, default=True)
    reset_token = Column(String(255), nullable=True)
    created_at     = Column(DateTime, default=datetime.utcnow)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    generator_profile = relationship("GeneratorProfile", back_populates="user", uselist=False)
    operator_profile  = relationship("OperatorProfile",  back_populates="user", uselist=False)
    waste_logs        = relationship("WasteLog",         back_populates="user")
    pickup_requests   = relationship("PickupRequest",    back_populates="user")


# ──────────────────────────────────────────────
# Generator Profile
# ──────────────────────────────────────────────

class GeneratorProfile(Base):
    __tablename__ = "generator_profiles"

    id               = Column(Integer, primary_key=True, index=True)
    user_id          = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    institution_name = Column(String(255))
    institution_type = Column(SAEnum(InstitutionType))
    street_address   = Column(String(500))
    city             = Column(String(100))
    postal_code      = Column(String(20))
    phone_number     = Column(String(30))
    logo_path        = Column(String(500), nullable=True)

    # Billing
    billing_name     = Column(String(255), nullable=True)
    billing_address  = Column(String(500), nullable=True)
    invoice_email    = Column(String(255), nullable=True)
    payment_method   = Column(SAEnum(PaymentMethod), default=PaymentMethod.card)

    updated_at       = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="generator_profile")


# ──────────────────────────────────────────────
# Operator Profile
# ──────────────────────────────────────────────

class OperatorProfile(Base):
    __tablename__ = "operator_profiles"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    company_name   = Column(String(255), nullable=False)
    license_number = Column(String(100), nullable=False)
    service_types  = Column(String(500))          # comma-separated list
    cities_served  = Column(String(500))          # comma-separated list
    pricing_model  = Column(SAEnum(PricingModel), default=PricingModel.per_kg)
    pricing_value  = Column(String(100), nullable=True)   # e.g. "8", "5000", "3"
    logo_letter    = Column(String(1), nullable=True)
    rating         = Column(Float, default=0.0)
    review_count   = Column(Integer, default=0)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user           = relationship("User", back_populates="operator_profile")
    pickup_requests = relationship("PickupRequest", back_populates="operator_profile")


# ──────────────────────────────────────────────
# Waste Log
# ──────────────────────────────────────────────

class WasteLog(Base):
    __tablename__ = "waste_logs"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    waste_type      = Column(SAEnum(WasteType), nullable=False)
    weight_kg       = Column(Float, nullable=False)
    pickup_from     = Column(String(50), nullable=True)   # ISO date string
    pickup_to       = Column(String(50), nullable=True)
    location        = Column(String(500), nullable=True)
    notes           = Column(Text, nullable=True)
    photo_path      = Column(String(500), nullable=True)
    urgency         = Column(SAEnum(UrgencyLevel), default=UrgencyLevel.flexible)
    created_at      = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="waste_logs")


# ──────────────────────────────────────────────
# Pickup Request
# ──────────────────────────────────────────────

class PickupRequest(Base):
    __tablename__ = "pickup_requests"

    id                  = Column(Integer, primary_key=True, index=True)
    transaction_id      = Column(String(20), unique=True, index=True)
    user_id             = Column(Integer, ForeignKey("users.id"), nullable=False)
    operator_profile_id = Column(Integer, ForeignKey("operator_profiles.id"), nullable=True)
    waste_log_id        = Column(Integer, ForeignKey("waste_logs.id"), nullable=True)

    waste_type          = Column(SAEnum(WasteType))
    weight_kg           = Column(Float, nullable=True)
    scheduled_time      = Column(String(100), nullable=True)   # human-readable e.g. "Tomorrow 10am"
    status              = Column(SAEnum(PickupStatus), default=PickupStatus.pending)

    # Documents
    certificate_file    = Column(String(500), nullable=True)
    invoice_file        = Column(String(500), nullable=True)
    cost                = Column(String(100), nullable=True)
    operator_notes      = Column(Text, nullable=True)

    created_at          = Column(DateTime, default=datetime.utcnow)
    updated_at          = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user             = relationship("User",            back_populates="pickup_requests")
    operator_profile = relationship("OperatorProfile", back_populates="pickup_requests")


# ──────────────────────────────────────────────
# Compliance Report (metadata only, not stored PDF)
# ──────────────────────────────────────────────

class ComplianceReport(Base):
    __tablename__ = "compliance_reports"

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type    = Column(String(20))          # monthly / quarterly / annual
    period         = Column(String(50))          # "Oct 2023", "Q3 2023", "Year 2023"
    total_diverted = Column(String(50))          # "460 kg"
    generated_at   = Column(DateTime, default=datetime.utcnow)
    emailed_to     = Column(String(255), nullable=True)

class Invoice(Base):
    __tablename__ = "invoices"

    id                = Column(Integer, primary_key=True, index=True)
    invoice_number    = Column(String(20), unique=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id"), nullable=False)
    pickup_id         = Column(Integer, ForeignKey("pickup_requests.id"), nullable=True)
    description       = Column(String(500))
    amount            = Column(Float, nullable=False)
    status            = Column(String(20), default="Unpaid")
    created_at        = Column(DateTime, default=datetime.utcnow)
    paid_at           = Column(DateTime, nullable=True)
    payment_intent_id = Column(String(255), nullable=True)