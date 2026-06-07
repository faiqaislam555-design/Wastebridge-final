from app.database import SessionLocal
from app import models
from app.auth import get_password_hash

db = SessionLocal()

# Check if admin already exists
existing = db.query(models.User).filter(models.User.email == "admin@wastebridge.com").first()
if existing:
    print("Admin already exists!")
else:
    admin = models.User(
        full_name="Admin",
        email="admin@wastebridge.com",
        hashed_password=get_password_hash("admin123"),
        role=models.UserRole.admin,
    )
    db.add(admin)
    db.commit()
    print("Admin created successfully!")
    print("Email: admin@wastebridge.com")
    print("Password: admin123")

db.close()