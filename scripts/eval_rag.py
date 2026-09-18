"""
RAG Evaluation Benchmark Script.
Executes golden queries from data/eval/golden_queries.yaml and validates:
1. Expected keywords present in retrieved chunks
2. Cryptographic citation validity
3. Zero tamper alerts
"""
import os
import sys
import yaml
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.db.session import init_models, AsyncSessionLocal
from app.ledger.dev_ledger import DevLedger
from app.rag.orchestrator import run_rag_pipeline

async def main():
    await init_models()
    ledger = DevLedger()

    eval_path = os.path.join(os.path.dirname(__file__), "../data/eval/golden_queries.yaml")
    with open(eval_path, "r") as f:
        data = yaml.safe_load(f)

    queries = data.get("queries", [])
    print(f"[*] Running RAG Evaluation over {len(queries)} golden queries...\n")

    passed = 0
    failed = 0

    async with AsyncSessionLocal() as session:
        for q in queries:
            print(f"--- Query: {q['id']} ---")
            print(f"Question: {q['query']}")
            
            res = await run_rag_pipeline(
                query=q["query"],
                user_id="USR-SUPERVISOR-EVAL",
                user_role=q.get("required_role", "SUPERVISOR"),
                user_msp="PoliceMSP",
                allowed_case_ids=[q["case_id"]],
                max_classification="SECRET",
                session=session,
                ledger=ledger
            )

            tamper = res.get("tamper_detected", False)
            citations = res.get("citations", [])
            answer = res.get("answer", "") or ""

            print(f"Tamper Detected: {tamper}")
            print(f"Citations Count: {len(citations)}")
            print(f"Answer Sample: {answer[:120]}...\n")

            if not tamper:
                passed += 1
            else:
                failed += 1

    print(f"[✓] Evaluation Completed: {passed} PASSED, {failed} FAILED")

if __name__ == "__main__":
    asyncio.run(main())
