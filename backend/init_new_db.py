import os
from sqlalchemy import create_engine
from app.models.models import Base
from dotenv import load_dotenv

load_dotenv('.env')

DATABASE_URL = os.getenv("DATABASE_URL")

print(f"Connecting to new DB: {DATABASE_URL.split('@')[-1]}")

engine = create_engine(DATABASE_URL)

try:
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
except Exception as e:
    print("Error:", e)
