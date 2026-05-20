"""
WasteBridge Payment Routes (Stripe)
-------------------------------------
Handles payment intent creation and confirmation.
"""

import stripe
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

from app.database import get_db
from app import models
from app.auth import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class CreatePaymentIntentRequest(BaseModel):
    amount: int          # Amount in PKR (e.g. 4800)
    currency: str = "usd"  # was "pkr"
    description: Optional[str] = "WasteBridge Payment"
    invoice_id: Optional[str] = None


class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str
    invoice_id: Optional[str] = None


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/create-payment-intent")
def create_payment_intent(
    data: CreatePaymentIntentRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Create a Stripe PaymentIntent and return client_secret to frontend."""
    try:
        # Stripe requires amount in smallest currency unit (paisa for PKR)
        amount_in_paisa = data.amount * 100

        intent = stripe.PaymentIntent.create(
            amount=amount_in_paisa,
            currency=data.currency,
            description=data.description,
            metadata={
                "user_id": str(current_user.id),
                "user_email": current_user.email,
                "invoice_id": data.invoice_id or "",
            },
            automatic_payment_methods={"enabled": True},
        )

        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "amount": data.amount,
            "currency": data.currency,
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e.user_message))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/confirm-payment")
def confirm_payment(
    data: ConfirmPaymentRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Verify payment status with Stripe after frontend confirms."""
    try:
        intent = stripe.PaymentIntent.retrieve(data.payment_intent_id)

        if intent.status == "succeeded":
            return {
                "status": "success",
                "message": "Payment confirmed successfully!",
                "payment_intent_id": intent.id,
                "amount": intent.amount // 100,
            }
        else:
            return {
                "status": intent.status,
                "message": f"Payment status: {intent.status}",
            }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e.user_message))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/publishable-key")
def get_publishable_key():
    """Return Stripe publishable key to frontend safely."""
    key = os.getenv("STRIPE_PUBLISHABLE_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    return {"publishable_key": key}
