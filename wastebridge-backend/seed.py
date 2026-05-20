"""
Seed script to populate the database with sample data matching the frontend mock data.

Run:  python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, engine, Base
from app import models
from app.auth import get_password_hash

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        # ── Sample Operators ──────────────────────────────────
        operators = [
            {
                "full_name": "EcoCycle Admin",
                "email": "admin@ecocycle.pk",
                "company_name": "EcoCycle Lahore",
                "license_number": "CPCB/SWM/2024/001",
                "service_types": "Composting",
                "cities_served": "Lahore, Punjab",
                "pricing_model": models.PricingModel.per_kg,
                "pricing_value": "8",
                "logo_letter": "E",
                "rating": 4.8,
                "review_count": 124,
            },
            {
                "full_name": "BioGas Admin",
                "email": "admin@biogaspunjab.pk",
                "company_name": "BioGas Punjab",
                "license_number": "CPCB/SWM/2024/002",
                "service_types": "Biogas",
                "cities_served": "Multan, Punjab",
                "pricing_model": models.PricingModel.pays,
                "pricing_value": "3",
                "logo_letter": "B",
                "rating": 4.9,
                "review_count": 89,
            },
            {
                "full_name": "GreenHaul Admin",
                "email": "admin@greenhaul.pk",
                "company_name": "GreenHaul Co",
                "license_number": "CPCB/SWM/2024/003",
                "service_types": "Recycling",
                "cities_served": "Lahore, Punjab",
                "pricing_model": models.PricingModel.flat,
                "pricing_value": "5000",
                "logo_letter": "G",
                "rating": 4.5,
                "review_count": 56,
            },
            {
                "full_name": "AgriFeed Admin",
                "email": "admin@agrifeed.pk",
                "company_name": "AgriFeed Solutions",
                "license_number": "CPCB/SWM/2024/004",
                "service_types": "Animal Feed",
                "cities_served": "Faisalabad, Punjab",
                "pricing_model": models.PricingModel.pays,
                "pricing_value": "5",
                "logo_letter": "A",
                "rating": 4.7,
                "review_count": 210,
            },
        ]

        for op in operators:
            existing = db.query(models.User).filter(models.User.email == op["email"]).first()
            if existing:
                continue

            user = models.User(
                full_name=op["full_name"],
                email=op["email"],
                hashed_password=get_password_hash("operator123"),
                role=models.UserRole.operator,
            )
            db.add(user)
            db.flush()

            profile = models.OperatorProfile(
                user_id=user.id,
                company_name=op["company_name"],
                license_number=op["license_number"],
                service_types=op["service_types"],
                cities_served=op["cities_served"],
                pricing_model=op["pricing_model"],
                pricing_value=op["pricing_value"],
                logo_letter=op["logo_letter"],
                rating=op["rating"],
                review_count=op["review_count"],
            )
            db.add(profile)

        # ── Sample Generator ──────────────────────────────────
        gen_email = "ali@greenbites.com"
        if not db.query(models.User).filter(models.User.email == gen_email).first():
            gen_user = models.User(
                full_name="Ali Khan",
                email=gen_email,
                hashed_password=get_password_hash("generator123"),
                role=models.UserRole.generator,
            )
            db.add(gen_user)
            db.flush()

            gen_profile = models.GeneratorProfile(
                user_id=gen_user.id,
                institution_name="Green Bites Restaurant",
                institution_type=models.InstitutionType.restaurant,
                street_address="123 Food Street, Gulberg III",
                city="Lahore",
                postal_code="54000",
                phone_number="+92 300 1234567",
                billing_name="Green Bites Pvt. Ltd.",
                invoice_email="finance@greenbites.com",
                payment_method=models.PaymentMethod.card,
            )
            db.add(gen_profile)

        db.commit()
        print("✅ Seed complete.")
        print("   Generator login: ali@greenbites.com / generator123")
        print("   Operator login:  admin@ecocycle.pk  / operator123")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
