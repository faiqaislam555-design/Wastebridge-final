import os
import shutil
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud, schemas, models
from app.auth import require_role

router = APIRouter(prefix="/api/waste-logs", tags=["waste-logs"])

UPLOAD_DIR = "uploads/waste-photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

_generator_dep = require_role(models.UserRole.generator, models.UserRole.admin)


@router.post("", response_model=schemas.WasteLogOut, status_code=201)
def create_waste_log(
    data: schemas.WasteLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    return crud.create_waste_log(db, current_user.id, data)


@router.get("", response_model=List[schemas.WasteLogOut])
def list_waste_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    return crud.get_waste_logs(db, current_user.id)


@router.get("/{log_id}", response_model=schemas.WasteLogOut)
def get_waste_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    log = crud.get_waste_log_by_id(db, log_id, current_user.id)
    if not log:
        raise HTTPException(status_code=404, detail="Waste log not found")
    return log


@router.post("/{log_id}/photo", response_model=schemas.WasteLogOut)
def upload_waste_photo(
    log_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(_generator_dep),
):
    if file.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(status_code=400, detail="Only JPG and PNG files allowed")

    ext = "jpg" if file.content_type == "image/jpeg" else "png"
    filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    log = crud.update_waste_log_photo(db, log_id, current_user.id, file_path)
    if not log:
        raise HTTPException(status_code=404, detail="Waste log not found")
    return log
