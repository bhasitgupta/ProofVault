import asyncio
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

ALTER_STATEMENTS = [
    # documents
    "ALTER TABLE documents ALTER COLUMN id TYPE varchar(256);",
    "ALTER TABLE documents ALTER COLUMN case_id TYPE varchar(256);",
    "ALTER TABLE documents ALTER COLUMN content_hash TYPE varchar(256);",
    "ALTER TABLE documents ALTER COLUMN blob_hash TYPE varchar(256);",
    "ALTER TABLE documents ALTER COLUMN chunk_merkle_root TYPE varchar(256);",
    "ALTER TABLE documents ALTER COLUMN mime_type TYPE varchar(256);",
    "ALTER TABLE documents ALTER COLUMN doc_type TYPE varchar(128);",
    "ALTER TABLE documents ALTER COLUMN classification TYPE varchar(128);",
    "ALTER TABLE documents ALTER COLUMN uploader_id TYPE varchar(256);",
    "ALTER TABLE documents ALTER COLUMN storage_path TYPE text;",
    "ALTER TABLE documents ALTER COLUMN wrapped_dek TYPE text;",
    "ALTER TABLE documents ALTER COLUMN nonce_hex TYPE text;",
    "ALTER TABLE documents ALTER COLUMN ledger_tx_id TYPE text;",
    "ALTER TABLE documents ALTER COLUMN tsa_token_hash TYPE text;",
    "ALTER TABLE documents ALTER COLUMN status TYPE varchar(128);",

    # users
    "ALTER TABLE users ALTER COLUMN id TYPE varchar(256);",
    "ALTER TABLE users ALTER COLUMN username TYPE varchar(256);",
    "ALTER TABLE users ALTER COLUMN full_name TYPE varchar(256);",
    "ALTER TABLE users ALTER COLUMN role TYPE varchar(128);",
    "ALTER TABLE users ALTER COLUMN password_hash TYPE text;",
    "ALTER TABLE users ALTER COLUMN totp_secret TYPE text;",
    "ALTER TABLE users ALTER COLUMN msp_id TYPE varchar(256);",

    # audit_logs
    "ALTER TABLE audit_logs ALTER COLUMN id TYPE varchar(256);",
    "ALTER TABLE audit_logs ALTER COLUMN event_id TYPE varchar(256);",
    "ALTER TABLE audit_logs ALTER COLUMN actor_id TYPE varchar(256);",
    "ALTER TABLE audit_logs ALTER COLUMN actor_role TYPE varchar(128);",
    "ALTER TABLE audit_logs ALTER COLUMN action TYPE varchar(128);",
    "ALTER TABLE audit_logs ALTER COLUMN case_id TYPE varchar(256);",
    "ALTER TABLE audit_logs ALTER COLUMN outcome TYPE varchar(64);",

    # chunks
    "ALTER TABLE chunks ALTER COLUMN id TYPE varchar(256);",
    "ALTER TABLE chunks ALTER COLUMN doc_id TYPE varchar(256);",
    "ALTER TABLE chunks ALTER COLUMN chunk_hash TYPE varchar(256);",
    "ALTER TABLE chunks ALTER COLUMN qdrant_point_id TYPE varchar(256);",

    # cases
    "ALTER TABLE cases ALTER COLUMN case_id TYPE varchar(256);",
    "ALTER TABLE cases ALTER COLUMN classification_ceiling TYPE varchar(128);",
    "ALTER TABLE cases ALTER COLUMN status TYPE varchar(128);",
    "ALTER TABLE cases ALTER COLUMN owning_msp TYPE varchar(256);",

    # assignments
    "ALTER TABLE assignments ALTER COLUMN id TYPE varchar(256);",
    "ALTER TABLE assignments ALTER COLUMN user_id TYPE varchar(256);",
    "ALTER TABLE assignments ALTER COLUMN case_id TYPE varchar(256);",
]

async def migrate():
    url = os.getenv('DATABASE_URL')
    print("Executing ALTER TABLE migrations on:", url.split('@')[-1] if '@' in url else url)
    engine = create_async_engine(url)
    async with engine.begin() as conn:
        for stmt in ALTER_STATEMENTS:
            try:
                await conn.execute(text(stmt))
                print("OK:", stmt)
            except Exception as e:
                print("SKIP/WARN:", stmt, "->", e)
    await engine.dispose()
    print("Migration complete!")

if __name__ == '__main__':
    asyncio.run(migrate())
