"""
WasteBridge Email Service
--------------------------
Handles all outgoing emails: welcome, pickup notifications,
status updates, alerts, and compliance reports.

Uses Python's built-in smtplib — no extra library needed.
Configure via environment variables (see .env.example).
"""

from dotenv import load_dotenv
load_dotenv()

import smtplib
import os
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Config (loaded from environment variables)
# ──────────────────────────────────────────────

SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")        # your Gmail address
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")        # Gmail App Password
FROM_EMAIL    = os.getenv("FROM_EMAIL", SMTP_USERNAME)
FROM_NAME     = os.getenv("FROM_NAME", "WasteBridge")
APP_URL       = os.getenv("APP_URL", "http://localhost:5173")


# ──────────────────────────────────────────────
# Base HTML template (shared layout)
# ──────────────────────────────────────────────

def _base_html(content: str, title: str = "WasteBridge Notification") -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{title}</title>
  <style>
    body {{ font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }}
    .wrapper {{ max-width:600px; margin:30px auto; background:#fff;
                border-radius:8px; overflow:hidden;
                box-shadow:0 2px 8px rgba(0,0,0,0.1); }}
    .header {{ background:#2d6a4f; padding:24px 32px; text-align:center; }}
    .header h1 {{ color:#fff; margin:0; font-size:22px; letter-spacing:1px; }}
    .header p  {{ color:#b7e4c7; margin:6px 0 0; font-size:13px; }}
    .body   {{ padding:32px; color:#333; line-height:1.6; }}
    .body h2 {{ color:#2d6a4f; margin-top:0; }}
    .info-box {{ background:#f0faf4; border-left:4px solid #2d6a4f;
                 padding:14px 18px; border-radius:4px; margin:20px 0; }}
    .info-box p {{ margin:4px 0; font-size:14px; }}
    .info-box strong {{ color:#1b4332; }}
    .btn {{ display:inline-block; background:#2d6a4f; color:#fff !important;
            padding:12px 28px; border-radius:6px; text-decoration:none;
            font-weight:bold; font-size:15px; margin:20px 0; }}
    .alert-box {{ background:#fff3cd; border-left:4px solid #ffc107;
                  padding:14px 18px; border-radius:4px; margin:20px 0; }}
    .success-box {{ background:#d1e7dd; border-left:4px solid #198754;
                    padding:14px 18px; border-radius:4px; margin:20px 0; }}
    .footer {{ background:#f8f9fa; padding:20px 32px; text-align:center;
               font-size:12px; color:#888; border-top:1px solid #eee; }}
    .footer a {{ color:#2d6a4f; text-decoration:none; }}
    table.details {{ width:100%; border-collapse:collapse; margin:16px 0; }}
    table.details td {{ padding:8px 12px; border-bottom:1px solid #eee;
                        font-size:14px; }}
    table.details td:first-child {{ font-weight:bold; color:#555;
                                    width:40%; }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>♻️ WasteBridge</h1>
      <p>Connecting Food Waste Generators with Certified Disposal Operators</p>
    </div>
    <div class="body">
      {content}
    </div>
    <div class="footer">
      <p>© {datetime.now().year} WasteBridge. All rights reserved.</p>
      <p>
        <a href="{APP_URL}">Visit WasteBridge</a> &nbsp;|&nbsp;
        <a href="{APP_URL}/settings">Notification Settings</a>
      </p>
      <p style="color:#bbb; font-size:11px;">
        You received this email because you are registered on WasteBridge.
      </p>
    </div>
  </div>
</body>
</html>
"""


# ──────────────────────────────────────────────
# Core send function
# ──────────────────────────────────────────────

def send_email(to_email: str, subject: str, html_body: str, text_body: str = "") -> bool:
    """
    Send an email. Returns True on success, False on failure.
    Fails silently (logs error) so it never crashes the main API.
    """
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        logger.warning("Email not configured — skipping send to %s | Subject: %s", to_email, subject)
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"{FROM_NAME} <{FROM_EMAIL}>"
        msg["To"]      = to_email

        if text_body:
            msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(FROM_EMAIL, to_email, msg.as_string())

        logger.info("Email sent → %s | %s", to_email, subject)
        return True

    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, str(e))
        return False


# ══════════════════════════════════════════════
# 1. WELCOME EMAIL — sent on registration
# ══════════════════════════════════════════════

def send_welcome_email(to_email: str, full_name: str, role: str):
    role_label = "Waste Generator" if role == "generator" else "Disposal Operator"
    dashboard_url = f"{APP_URL}/{'generator' if role == 'generator' else 'operator'}/dashboard"

    content = f"""
    <h2>Welcome to WasteBridge, {full_name}! 🎉</h2>
    <p>Your account has been created successfully as a <strong>{role_label}</strong>.</p>
    <div class="success-box">
      <p>✅ Your account is active and ready to use.</p>
    </div>
    <p>Here's what you can do next:</p>
    {"<ul><li>Log your food waste</li><li>Request a pickup from certified operators</li><li>Track your environmental impact</li></ul>"
      if role == "generator" else
     "<ul><li>Complete your company profile</li><li>List your services</li><li>Start receiving pickup requests</li></ul>"}
    <a href="{dashboard_url}" class="btn">Go to My Dashboard →</a>
    <p style="color:#888; font-size:13px;">
      If you didn't create this account, please contact us immediately.
    </p>
    """

    html = _base_html(content, "Welcome to WasteBridge")
    text = f"Welcome to WasteBridge, {full_name}!\nYour {role_label} account is ready.\nVisit: {dashboard_url}"
    send_email(to_email, "Welcome to WasteBridge ♻️", html, text)


# ══════════════════════════════════════════════
# 2. PICKUP REQUEST CONFIRMATION — sent to generator
# ══════════════════════════════════════════════

def send_pickup_confirmation(
    to_email: str,
    full_name: str,
    transaction_id: str,
    waste_type: str,
    weight_kg: Optional[float],
    scheduled_time: Optional[str],
    operator_name: Optional[str] = None,
):
    content = f"""
    <h2>Pickup Request Confirmed ✅</h2>
    <p>Hi <strong>{full_name}</strong>, your pickup request has been submitted successfully.</p>
    <table class="details">
      <tr><td>Transaction ID</td><td><strong>{transaction_id}</strong></td></tr>
      <tr><td>Waste Type</td><td>{waste_type.title()}</td></tr>
      <tr><td>Estimated Weight</td><td>{f'{weight_kg} kg' if weight_kg else 'Not specified'}</td></tr>
      <tr><td>Scheduled Time</td><td>{scheduled_time or 'To be confirmed'}</td></tr>
      <tr><td>Operator</td><td>{operator_name or 'Being assigned'}</td></tr>
      <tr><td>Status</td><td>🟡 Pending</td></tr>
    </table>
    <div class="info-box">
      <p>📋 You will receive another email once an operator confirms your request.</p>
      <p>Keep this <strong>Transaction ID ({transaction_id})</strong> for your records.</p>
    </div>
    <a href="{APP_URL}/generator/pickups" class="btn">Track Pickup Status →</a>
    """

    html = _base_html(content, "Pickup Request Confirmed")
    text = f"Pickup Confirmed!\nTransaction: {transaction_id}\nWaste: {waste_type} | Weight: {weight_kg}kg\nScheduled: {scheduled_time}"
    send_email(to_email, f"Pickup Request Confirmed — {transaction_id}", html, text)


# ══════════════════════════════════════════════
# 3. PICKUP STATUS UPDATE — sent when status changes
# ══════════════════════════════════════════════

STATUS_CONFIG = {
    "Confirmed":  ("✅ Confirmed",  "#d1e7dd", "success-box", "Your pickup has been confirmed by the operator."),
    "Completed":  ("✅ Completed",  "#d1e7dd", "success-box", "Your pickup has been successfully completed."),
    "Cancelled":  ("❌ Cancelled",  "#f8d7da", "alert-box",   "Your pickup request has been cancelled."),
    "Disputed":   ("⚠️ Disputed",   "#fff3cd", "alert-box",   "Your pickup has been flagged as disputed."),
}

def send_pickup_status_update(
    to_email: str,
    full_name: str,
    transaction_id: str,
    new_status: str,
    operator_name: Optional[str] = None,
    operator_notes: Optional[str] = None,
):
    label, _, box_class, status_msg = STATUS_CONFIG.get(
        new_status, (new_status, "#fff", "info-box", f"Your pickup status is now {new_status}.")
    )

    notes_html = f"<p><strong>Operator Note:</strong> {operator_notes}</p>" if operator_notes else ""

    content = f"""
    <h2>Pickup Status Update</h2>
    <p>Hi <strong>{full_name}</strong>, here's an update on your pickup request.</p>
    <div class="{box_class}">
      <p><strong>Status: {label}</strong></p>
      <p>{status_msg}</p>
    </div>
    <table class="details">
      <tr><td>Transaction ID</td><td><strong>{transaction_id}</strong></td></tr>
      <tr><td>Operator</td><td>{operator_name or 'N/A'}</td></tr>
      <tr><td>New Status</td><td>{label}</td></tr>
    </table>
    {notes_html}
    <a href="{APP_URL}/generator/pickups" class="btn">View Pickup Details →</a>
    """

    html = _base_html(content, f"Pickup {new_status} — {transaction_id}")
    text = f"Pickup Update: {transaction_id} is now {new_status}. {status_msg}"
    send_email(to_email, f"Pickup {label} — {transaction_id}", html, text)


# ══════════════════════════════════════════════
# 4. NEW PICKUP ALERT — sent to operator
# ══════════════════════════════════════════════

def send_new_pickup_alert_to_operator(
    to_email: str,
    operator_name: str,
    transaction_id: str,
    generator_name: str,
    waste_type: str,
    weight_kg: Optional[float],
    scheduled_time: Optional[str],
    urgency: str,
):
    urgency_badge = "🔴 URGENT" if urgency == "urgent" else "🟢 Flexible"

    content = f"""
    <h2>New Pickup Request 📦</h2>
    <p>Hi <strong>{operator_name}</strong>, you have a new pickup request waiting for your confirmation.</p>
    <div class="info-box">
      <p><strong>⚡ Urgency: {urgency_badge}</strong></p>
    </div>
    <table class="details">
      <tr><td>Transaction ID</td><td><strong>{transaction_id}</strong></td></tr>
      <tr><td>Generator</td><td>{generator_name}</td></tr>
      <tr><td>Waste Type</td><td>{waste_type.title()}</td></tr>
      <tr><td>Weight</td><td>{f'{weight_kg} kg' if weight_kg else 'Not specified'}</td></tr>
      <tr><td>Scheduled Time</td><td>{scheduled_time or 'Flexible'}</td></tr>
    </table>
    <p>Please log in to review and confirm or update this request.</p>
    <a href="{APP_URL}/operator/pickups" class="btn">Review Request →</a>
    """

    html = _base_html(content, "New Pickup Request")
    text = f"New Pickup Request {transaction_id} from {generator_name}. Waste: {waste_type}, Weight: {weight_kg}kg."
    send_email(to_email, f"New Pickup Request — {transaction_id}", html, text)


# ══════════════════════════════════════════════
# 5. PASSWORD RESET EMAIL
# ══════════════════════════════════════════════

def send_password_reset_email(to_email: str, full_name: str, reset_token: str):
    reset_url = f"{APP_URL}/reset-password?token={reset_token}"

    content = f"""
    <h2>Password Reset Request 🔐</h2>
    <p>Hi <strong>{full_name}</strong>, we received a request to reset your WasteBridge password.</p>
    <div class="alert-box">
      <p>⚠️ This link expires in <strong>1 hour</strong>.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
    <a href="{reset_url}" class="btn">Reset My Password →</a>
    <p style="color:#888; font-size:12px; margin-top:20px;">
      Or copy this link: <br/>{reset_url}
    </p>
    """

    html = _base_html(content, "Reset Your WasteBridge Password")
    text = f"Reset your WasteBridge password:\n{reset_url}\n\nThis link expires in 1 hour."
    send_email(to_email, "Reset Your WasteBridge Password", html, text)


# ══════════════════════════════════════════════
# 6. COMPLIANCE REPORT READY — sent to generator
# ══════════════════════════════════════════════

def send_compliance_report_email(
    to_email: str,
    full_name: str,
    report_type: str,
    period: str,
    total_diverted: str,
):
    content = f"""
    <h2>Your Compliance Report is Ready 📊</h2>
    <p>Hi <strong>{full_name}</strong>, your {report_type} compliance report for <strong>{period}</strong> has been generated.</p>
    <div class="success-box">
      <p>♻️ Total waste diverted: <strong>{total_diverted}</strong></p>
    </div>
    <table class="details">
      <tr><td>Report Type</td><td>{report_type.title()}</td></tr>
      <tr><td>Period</td><td>{period}</td></tr>
      <tr><td>Total Diverted</td><td>{total_diverted}</td></tr>
      <tr><td>Generated</td><td>{datetime.now().strftime('%d %b %Y, %H:%M')}</td></tr>
    </table>
    <p>Download your full report from the Document Vault.</p>
    <a href="{APP_URL}/generator/documents" class="btn">View in Document Vault →</a>
    """

    html = _base_html(content, f"Compliance Report — {period}")
    text = f"Your {report_type} compliance report for {period} is ready. Total diverted: {total_diverted}."
    send_email(to_email, f"Compliance Report Ready — {period}", html, text)


# ══════════════════════════════════════════════
# 7. ACCOUNT DEACTIVATION ALERT — sent to admin
# ══════════════════════════════════════════════

def send_account_alert_to_admin(
    admin_email: str,
    alert_type: str,
    user_email: str,
    user_name: str,
    detail: str = "",
):
    content = f"""
    <h2>⚠️ Admin Alert: {alert_type}</h2>
    <div class="alert-box">
      <p><strong>Alert Type:</strong> {alert_type}</p>
      <p><strong>User:</strong> {user_name} ({user_email})</p>
      <p><strong>Detail:</strong> {detail or 'No additional detail'}</p>
      <p><strong>Time:</strong> {datetime.now().strftime('%d %b %Y, %H:%M')}</p>
    </div>
    <a href="{APP_URL}/admin/users" class="btn">Go to Admin Panel →</a>
    """

    html = _base_html(content, f"Admin Alert: {alert_type}")
    text = f"Admin Alert: {alert_type}\nUser: {user_name} ({user_email})\n{detail}"
    send_email(admin_email, f"[WasteBridge Admin] {alert_type}", html, text)
