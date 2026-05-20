from app.email_service import send_welcome_email, send_password_reset_email
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import threading
import secrets
from app.database import get_db
from app import crud, schemas, models
from app.auth import verify_password, create_access_token, get_current_user
from app.email_service import send_welcome_email

router = APIRouter(prefix="/api/auth", tags=["auth"])

def _send_async(fn, *args, **kwargs):
    threading.Thread(target=fn, args=args, kwargs=kwargs, daemon=True).start()

@router.post("/register/generator", response_model=schemas.TokenResponse, status_code=201)
def register_generator(data: schemas.RegisterGeneratorRequest, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_generator_user(db, data)
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    _send_async(send_welcome_email, user.email, user.full_name, user.role.value)
    return schemas.TokenResponse(access_token=token, role=user.role, user_id=user.id)

@router.post("/register/operator", response_model=schemas.TokenResponse, status_code=201)
def register_operator(data: schemas.RegisterOperatorRequest, db: Session = Depends(get_db)):
    if crud.get_user_by_email(db, data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_operator_user(db, data)
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    _send_async(send_welcome_email, user.email, user.full_name, user.role.value)
    return schemas.TokenResponse(access_token=token, role=user.role, user_id=user.id)

@router.post("/login", response_model=schemas.TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud.get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return schemas.TokenResponse(access_token=token, role=user.role, user_id=user.id)

@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(data: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, data.email)
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        db.commit()
        try:
            result = send_password_reset_email(user.email, user.full_name, token)
            print("Email result:", result)
        except Exception as e:
            print("Email error:", str(e))
    return {"message": "If this email exists, a reset link has been sent"}

@router.post("/reset-password")
def reset_password(data: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.reset_token == data.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    from app.auth import get_password_hash
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_token = None
    db.commit()
    return {"message": "Password reset successful"}