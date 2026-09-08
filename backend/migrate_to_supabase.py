"""
Migrate and Seed Nirdesha Schema to Supabase PostgreSQL.
Reads DATABASE_URL from .env and verifies table creation and seed data.
"""
import os
import sys
from dotenv import load_dotenv

# Load .env
load_dotenv()

database_url = os.getenv("DATABASE_URL", "")
if not database_url or "[YOUR-PASSWORD]" in database_url:
    print("ERROR: Please replace [YOUR-PASSWORD] with your actual Supabase database password in .env")
    sys.exit(1)

print(f"Connecting to Supabase PostgreSQL...")
try:
    from backend.database import Base, engine, SessionLocal
    import backend.models
    import backend.phase2_models
    from backend.seed import seed_database

    print("1. Creating database tables in Supabase...")
    Base.metadata.create_all(bind=engine)
    print("[OK] All tables created successfully!")

    print("2. Seeding initial MoSPI competency data...")
    with SessionLocal() as db:
        seed_database(db)
    print("[OK] Database seeded successfully!")

    # Verify tables
    from sqlalchemy import text
    with engine.connect() as conn:
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"))
        tables = [row[0] for row in result.fetchall()]
        print(f"\n[OK] Tables active in Supabase ({len(tables)} tables):")
        for t in tables:
            cnt = conn.execute(text(f'SELECT count(*) FROM "{t}"')).scalar()
            print(f"  - {t}: {cnt} rows")

    print("\n[SUCCESS] Supabase is fully connected and initialized for Nirdesha!")

except Exception as err:
    print(f"\nConnection Error: {err}")
    sys.exit(1)

