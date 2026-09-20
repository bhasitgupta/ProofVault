import asyncio
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DEFAULTS = [
    "ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now();",
    "ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT now();",
    "ALTER TABLE documents ALTER COLUMN created_at SET DEFAULT now();",
    "ALTER TABLE documents ALTER COLUMN updated_at SET DEFAULT now();",
    "ALTER TABLE cases ALTER COLUMN created_at SET DEFAULT now();",
    "ALTER TABLE cases ALTER COLUMN updated_at SET DEFAULT now();",
    "ALTER TABLE assignments ALTER COLUMN created_at SET DEFAULT now();",
    "ALTER TABLE assignments ALTER COLUMN updated_at SET DEFAULT now();",
    "ALTER TABLE audit_logs ALTER COLUMN created_at SET DEFAULT now();",
    "ALTER TABLE audit_logs ALTER COLUMN updated_at SET DEFAULT now();",
    "ALTER TABLE chunks ALTER COLUMN created_at SET DEFAULT now();",
    "ALTER TABLE chunks ALTER COLUMN updated_at SET DEFAULT now();",
]

async def set_defaults():
    url = os.getenv('DATABASE_URL')
    engine = create_async_engine(url)
    async with engine.begin() as conn:
        for stmt in DEFAULTS:
            try:
                await conn.execute(text(stmt))
                print("OK:", stmt)
            except Exception as e:
                print("WARN:", stmt, "->", e)
    await engine.dispose()
    print("Defaults set!")

if __name__ == '__main__':
    asyncio.run(set_defaults())
