from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from app.models import (
    UserRole, InstitutionType, WasteType, UrgencyLevel,
    PickupStatus, PricingModel, PaymentMethod
)


# ──────────────────────────────────────────────
# Auth / User
# ──────────────────────────────────────────────

class RegisterGeneratorRequest(BaseModel):
    full_name:        str
    email:            EmailStr
    password:         str
    confirm_password: str
    institution_type: InstitutionType
    city:             str
    phone_number:     str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class RegisterOperatorRequest(BaseModel):
    full_name:        str
    email:            EmailStr
    password:         str
    confirm_password: str
    company_name:     str
    license_number:   str
    service_types:    List[str]         # ["Composting", "Biogas", ...]
    cities_served:    str               # "Mumbai, Pune"

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    role:         UserRole
    user_id:      int


class UserOut(BaseModel):
    id:         int
    full_name:  str
    email:      str
    role:       UserRole
    is_active:  bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Generator Profile
# ──────────────────────────────────────────────

class GeneratorProfileUpdate(BaseModel):
    institution_name: Optional[str]  = None
    institution_type: Optional[InstitutionType] = None
    street_address:   Optional[str]  = None
    city:             Optional[str]  = None
    postal_code:      Optional[str]  = None
    phone_number:     Optional[str]  = None
    full_name:        Optional[str]  = None
    email:            Optional[EmailStr] = None
    billing_name:     Optional[str]  = None
    billing_address:  Optional[str]  = None
    invoice_email:    Optional[EmailStr] = None
    payment_method:   Optional[PaymentMethod] = None


class GeneratorProfileOut(BaseModel):
    id:               int
    user_id:          int
    institution_name: Optional[str]
    institution_type: Optional[InstitutionType]
    street_address:   Optional[str]
    city:             Optional[str]
    postal_code:      Optional[str]
    phone_number:     Optional[str]
    logo_path:        Optional[str]
    billing_name:     Optional[str]
    billing_address:  Optional[str]
    invoice_email:    Optional[str]
    payment_method:   Optional[PaymentMethod]
    updated_at:       Optional[datetime]

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Operator Profile
# ──────────────────────────────────────────────

class OperatorProfileOut(BaseModel):
    id:             int
    user_id:        int
    company_name:   str
    license_number: str
    service_types:  Optional[str]
    cities_served:  Optional[str]
    pricing_model:  Optional[PricingModel]
    pricing_value:  Optional[str]
    logo_letter:    Optional[str]
    rating:         float
    review_count:   int

    model_config = {"from_attributes": True}


class OperatorListItem(BaseModel):
    id:             int
    company_name:   str
    logo_letter:    Optional[str]
    rating:         float
    review_count:   int
    city:           Optional[str]    # first city in cities_served
    pricing_model:  Optional[PricingModel]
    pricing_value:  Optional[str]
    service_types:  Optional[str]    # comma-separated

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Waste Log
# ──────────────────────────────────────────────

class WasteLogCreate(BaseModel):
    waste_type:  WasteType
    weight_kg:   float
    pickup_from: Optional[str] = None
    pickup_to:   Optional[str] = None
    location:    Optional[str] = None
    notes:       Optional[str] = None
    urgency:     UrgencyLevel  = UrgencyLevel.flexible


class WasteLogOut(BaseModel):
    id:          int
    user_id:     int
    waste_type:  WasteType
    weight_kg:   float
    pickup_from: Optional[str]
    pickup_to:   Optional[str]
    location:    Optional[str]
    notes:       Optional[str]
    photo_path:  Optional[str]
    urgency:     UrgencyLevel
    created_at:  datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Pickup Request
# ──────────────────────────────────────────────

class PickupRequestCreate(BaseModel):
    operator_profile_id: Optional[int]  = None
    waste_log_id:        Optional[int]  = None
    waste_type:          WasteType
    weight_kg:           Optional[float] = None
    scheduled_time:      Optional[str]  = None


class PickupRequestUpdate(BaseModel):
    status:         Optional[PickupStatus] = None
    operator_notes: Optional[str]          = None
    cost:           Optional[str]          = None
    weight_kg:      Optional[float]        = None


class PickupRequestOut(BaseModel):
    id:                  int
    transaction_id:      str
    user_id:             int
    operator_profile_id: Optional[int]
    waste_log_id:        Optional[int]
    waste_type:          WasteType
    weight_kg:           Optional[float]
    scheduled_time:      Optional[str]
    status:              PickupStatus
    certificate_file:    Optional[str]
    invoice_file:        Optional[str]
    cost:                Optional[str]
    operator_notes:      Optional[str]
    created_at:          datetime
    updated_at:          datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────────
# Dashboard Stats
# ──────────────────────────────────────────────

class DashboardStatsOut(BaseModel):
    pending_requests:        int
    upcoming_pickups_week:   int
    waste_diverted_month_kg: float
    co2_saved_month_kg:      float


# ──────────────────────────────────────────────
# Compliance Report
# ──────────────────────────────────────────────

class ComplianceReportRequest(BaseModel):
    report_type:     str          # monthly / quarterly / annual
    selected_period: Optional[str] = None


class EmailReportRequest(BaseModel):
    report_type:     str
    selected_period: Optional[str] = None
    regulator_email: EmailStr


class ComplianceReportOut(BaseModel):
    id:             int
    user_id:        int
    report_type:    str
    period:         str
    total_diverted: str
    generated_at:   datetime
    emailed_to:     Optional[str]

    model_config = {"from_attributes": True}

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str