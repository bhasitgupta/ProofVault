import asyncio
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check():
    url = os.getenv('DATABASE_URL')
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        res = await conn.execute(text("""
            SELECT table_name, column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND character_maximum_length <= 64
            ORDER BY table_name, ordinal_position;
        """))
        print('=== Columns with character_maximum_length <= 64 in public schema ===')
        for t, col, dtype, maxlen in res.fetchall():
            print(f'  {t}.{col}: {dtype}({maxlen})')
    await engine.dispose()

if __name__ == '__main__':
    asyncio.run(check())
