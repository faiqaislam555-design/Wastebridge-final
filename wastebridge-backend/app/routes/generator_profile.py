import os
import shutil
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas, models
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/api/generator/profile", tags=["generator-profile"])

UPLOAD_DIR = "uploads/logos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

_generator_dep = require_role(models.UserRole.generator, models.UserRole.admin)


@router.get("", response_model=schemas.GeneratorProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    profile = crud.get_generator_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("", response_model=schemas.GeneratorProfileOut)
def update_profile(
    data: schemas.GeneratorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    profile = crud.update_generator_profile(db, current_user.id, data)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/logo", response_model=schemas.GeneratorProfileOut)
def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    if file.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(status_code=400, detail="Only JPG and PNG files are allowed")

    ext = "jpg" if file.content_type == "image/jpeg" else "png"
    filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    profile = crud.update_generator_logo(db, current_user.id, file_path)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
