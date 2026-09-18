"""
Corpus Generator Script.
Generates realistic Indian police evidence documents (FIRs, Witness Statements,
Forensic Reports, Seizure Memos) for test cases and commits them to SDMS.
"""
import os
import sys
import asyncio

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.db.session import init_models, AsyncSessionLocal
from app.ledger.dev_ledger import DevLedger
from app.ingest.pipeline import run_ingestion_pipeline

CORPUS_DOCS = [
    {
        "filename": "fir_101_cyber_hawala.txt",
        "case_id": "CASE-101",
        "doc_type": "FIR",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "content": """
FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)
District: New Delhi | Police Station: Special Cell (Cyber Division)
FIR Number: 0101/2026 | Date: 12-Feb-2026
Offense: Information Technology Act Sec 66C, 66D, 420 IPC

Details of Incident:
A sophisticated offshore routing syndicate was detected transferring illicit funds via unauthorized virtual payment addresses.
Server logs captured connection from IP 198.51.100.22 authenticating against banking terminal gateway.
Digital audit trails and volatile RAM images have been preserved on read-only media.
"""
    },
    {
        "filename": "witness_statement_sharma.txt",
        "case_id": "CASE-101",
        "doc_type": "WITNESS_STATEMENT",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "content": """
STATEMENT OF WITNESS (Section 161 Cr.P.C.)
Witness Name: Alok Kumar, Network Systems Operator
Date: 15-Feb-2026

Statement:
I observed unexpected terminal sessions originating from internal switch port 4 at 02:14 AM.
The credentials utilized belonged to a decommissioned administrative account.
I immediately triggered the network isolation protocol and notified the investigating officer.
"""
    },
    {
        "filename": "forensic_ballistics_report_103.txt",
        "case_id": "CASE-103",
        "doc_type": "FORENSIC_REPORT",
        "classification": "SECRET",
        "uploader_id": "USR-102",
        "content": """
CENTRAL FORENSIC SCIENCE LABORATORY (CFSL)
Ballistics & Firearms Division Report
Exhibit No: B-4021/2026 | Case ID: CASE-103

Findings:
The test-fired 9mm cartridge cases were compared under comparison macroscope with questioned cartridge cases recovered from crime scene.
Striation marks on the firing pin indentation and breech face match the seized pistol (Serial #8841-A) with 99.8% precision.
Result: Conclusive identification positive.
"""
    }
]

async def main():
    await init_models()
    ledger = DevLedger()

    async with AsyncSessionLocal() as session:
        print("[*] Generating synthetic evidence corpus...")
        for doc in CORPUS_DOCS:
            res = await run_ingestion_pipeline(
                file_bytes=doc["content"].strip().encode("utf-8"),
                filename=doc["filename"],
                case_id=doc["case_id"],
                doc_type=doc["doc_type"],
                classification=doc["classification"],
                uploader_id=doc["uploader_id"],
                uploader_msp="PoliceMSP",
                session=session,
                ledger=ledger
            )
            print(f" [✓] Ingested {doc['filename']} -> Doc ID: {res['doc_id'][:8]}... TX: {res['ledger_tx_id']}")

    print("\n[✓] Synthetic corpus generation complete.")

if __name__ == "__main__":
    asyncio.run(main())
