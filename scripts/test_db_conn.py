import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv('backend/.env')
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_db():
    url = os.getenv('DATABASE_URL')
    print('Testing DB URL target:', url.split('@')[-1] if '@' in url else url)
    try:
        engine = create_async_engine(url, pool_pre_ping=True)
        async with engine.connect() as conn:
            res = await conn.execute(text('SELECT current_database(), version();'))
            row = res.fetchone()
            print('SUCCESS: Connected to DB:', row[0])
            print('PostgreSQL version:', row[1][:40])
            
            tables_res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"))
            tables = [r[0] for r in tables_res.fetchall()]
            print('Tables in public schema:', tables)
            
            if 'cases' in tables:
                cases_count = await conn.execute(text('SELECT count(*) FROM cases;'))
                print('Cases count:', cases_count.scalar())
                
                cases_rows = await conn.execute(text('SELECT case_id, title FROM cases LIMIT 5;'))
                for r in cases_rows.fetchall():
                    print('  Case:', r[0], '-', r[1])
            else:
                print('WARNING: cases table NOT found in public schema!')
        await engine.dispose()
    except Exception as e:
        print('FAILURE: Database connection error:', type(e), e)

if __name__ == '__main__':
    asyncio.run(test_db())
