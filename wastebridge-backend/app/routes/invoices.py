from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app import models, crud
from app.auth import get_current_user

router = APIRouter(prefix="/api/invoices", tags=["invoices"])

class MarkPaidRequest(BaseModel):
    invoice_number: str
    payment_intent_id: Optional[str] = None

@router.get("/")
def get_invoices(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    invoices = crud.get_invoices(db, current_user.id)
    return [
        {
            "id": f"#{inv.invoice_number}",
            "invoice_number": inv.invoice_number,
            "date": inv.created_at.strftime("%b %d, %Y"),
            "desc": inv.description,
            "amount": inv.amount,
            "status": inv.status,
        }
        for inv in invoices
    ]

@router.post("/mark-paid")
def mark_paid(
    data: MarkPaidRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    invoice = crud.mark_invoice_paid(db, data.invoice_number, current_user.id, data.payment_intent_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"message": "Invoice marked as paid"}