from dotenv import load_dotenv
load_dotenv()

import resend
import os
import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

resend.api_key = os.getenv("RESEND_API_KEY", "")
FROM_NAME = os.getenv("FROM_NAME", "WasteBridge")
FROM_EMAIL = "noreply@wastebridge.online" 
APP_URL = os.getenv("APP_URL", "http://localhost:5173")


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    if not resend.api_key:
        logger.warning("RESEND_API_KEY not set — skipping email to %s", to_email)
        return False
    try:
        resend.Emails.send({
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": to_email,
            "subject": subject,
            "html": html_body,
        })
        logger.info("Email sent → %s | %s", to_email, subject)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, str(e))
        return False


def send_welcome_email(to_email: str, full_name: str, role: str):
    role_label = "Waste Generator" if role == "generator" else "Disposal Operator"
    html = f"""
    <h2>Welcome to WasteBridge, {full_name}! 🎉</h2>
    <p>Your account has been created as a <strong>{role_label}</strong>.</p>
    <p>Visit: <a href="{APP_URL}">{APP_URL}</a></p>
    """
    send_email(to_email, "Welcome to WasteBridge ♻️", html)


def send_password_reset_email(to_email: str, full_name: str, reset_token: str):
    reset_url = f"{APP_URL}/reset-password?token={reset_token}"
    html = f"""
    <h2>Password Reset Request</h2>
    <p>Hi {full_name}, click below to reset your password:</p>
    <a href="{reset_url}">Reset Password</a>
    <p>This link expires in 1 hour.</p>
    """
    send_email(to_email, "Reset Your WasteBridge Password", html)


def send_pickup_confirmation(to_email, full_name, transaction_id, waste_type, weight_kg, scheduled_time, operator_name=None):
    html = f"<h2>Pickup Confirmed ✅</h2><p>Transaction: {transaction_id}</p><p>Waste: {waste_type}, {weight_kg}kg</p>"
    send_email(to_email, f"Pickup Confirmed — {transaction_id}", html)


def send_pickup_status_update(to_email, full_name, transaction_id, new_status, operator_name=None, operator_notes=None):
    html = f"<h2>Pickup Update</h2><p>Transaction {transaction_id} is now <strong>{new_status}</strong>.</p>"
    send_email(to_email, f"Pickup {new_status} — {transaction_id}", html)


def send_new_pickup_alert_to_operator(to_email, operator_name, transaction_id, generator_name, waste_type, weight_kg, scheduled_time, urgency):
    html = f"<h2>New Pickup Request</h2><p>From: {generator_name}</p><p>Waste: {waste_type}, {weight_kg}kg</p>"
    send_email(to_email, f"New Pickup Request — {transaction_id}", html)


def send_compliance_report_email(to_email, full_name, report_type, period, total_diverted):
    html = f"<h2>Compliance Report Ready</h2><p>{report_type} report for {period}. Total diverted: {total_diverted}</p>"
    send_email(to_email, f"Compliance Report — {period}", html)


def send_account_alert_to_admin(admin_email, alert_type, user_email, user_name, detail=""):
    html = f"<h2>Admin Alert: {alert_type}</h2><p>User: {user_name} ({user_email})</p><p>{detail}</p>"
    send_email(admin_email, f"[WasteBridge Admin] {alert_type}", html)