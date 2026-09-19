import uuid
from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User
from app.db.models.case import Case
from app.db.models.assignment import Assignment
from app.db.models.document import Document
from app.db.models.chunk import Chunk
from app.core.security import hash_password
from app.core.constants import UserRole, ClassificationLevel


DEFAULT_CASES = [
    {
        "case_id": "CASE-101",
        "title": "State vs Cyber Syndicate - Hawala Breach & Crypto Theft",
        "description": "Cross-border cryptocurrency laundering, illegal hawala routing, and unauthorized virtual payment routing targeting sovereign banking gateway.",
        "classification_ceiling": "CONFIDENTIAL",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE",
    },
    {
        "case_id": "CASE-102",
        "title": "FIR 402/2026 - Central Bank Core Gateway Ransomware",
        "description": "Ransomware payload infiltration, encrypted server volumes, critical bank infrastructure lock, and forged administrative authorization letters.",
        "classification_ceiling": "SECRET",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE",
    },
    {
        "case_id": "CASE-103",
        "title": "Special Investigation - Ballistics & Arms Seizure",
        "description": "Clandestine armory raid, automatic firearm recovery, illegal arms transit, and ballistic striation microscopy benchmarks.",
        "classification_ceiling": "SECRET",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE",
    },
    {
        "case_id": "CASE-104",
        "title": "Judicial Review - Corporate Embezzlement & Balance Sheet Forgery",
        "description": "Falsification of corporate statutory balance sheets, fraudulent tender allocation, and corruption kickbacks.",
        "classification_ceiling": "RESTRICTED",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE",
    },
    {
        "case_id": "CASE-105",
        "title": "Digital Narcotics Trafficking & Darknet Transit Network",
        "description": "Tor hidden service marketplace operations, seized cold storage hardware wallets, contraband narcotics consignments, and darknet courier logs.",
        "classification_ceiling": "CONFIDENTIAL",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE",
    },
    {
        "case_id": "CASE-205",
        "title": "Special Task Force vs. Advanced Persistent Threat Syndicate",
        "description": "Critical infrastructure SCADA telemetry exfiltration and state-sponsored APT malware forensics.",
        "classification_ceiling": "SECRET",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE",
    },
    {
        "case_id": "CASE-311",
        "title": "Narcotics Control Bureau vs. Coastal Maritime Transit Network",
        "description": "Maritime seizure memos, chemical spectrometry assays, intercepted satellite comms, and witness depositions.",
        "classification_ceiling": "CONFIDENTIAL",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE",
    },
    {
        "case_id": "CASE-418",
        "title": "Anti-Corruption Bureau Inquiry - PWD Infrastructure Tender",
        "description": "Rigged electronic procurement bids, offshore kickback routing slips, and certified telephone wiretaps.",
        "classification_ceiling": "RESTRICTED",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE",
    },
    {
        "case_id": "CASE-527",
        "title": "State Forensic Science Laboratory - Ballistics & Firearm Registry",
        "description": "Central ballistics registry, firearm striation microscopy benchmarks, and forensic comparison recovery memos.",
        "classification_ceiling": "SECRET",
        "owning_msp": "ForensicsMSP",
        "status": "ACTIVE",
    },
]

DEFAULT_USERS = [
    {
        "id": "USR-101",
        "username": "investigator_gupta",
        "full_name": "Inspector Bhasit Gupta",
        "role": UserRole.INVESTIGATOR.value,
        "msp_id": "PoliceMSP",
    },
    {
        "id": "USR-102",
        "username": "forensic_ananya",
        "full_name": "Dr. Ananya Iyer",
        "role": UserRole.FORENSIC_ANALYST.value,
        "msp_id": "ForensicsMSP",
    },
    {
        "id": "USR-103",
        "username": "legal_verma",
        "full_name": "Public Prosecutor P. Verma",
        "role": UserRole.LEGAL_OFFICER.value,
        "msp_id": "PoliceMSP",
    },
    {
        "id": "USR-104",
        "username": "supervisor_kapoor",
        "full_name": "Superintendent of Police K. Kapoor",
        "role": UserRole.SUPERVISOR.value,
        "msp_id": "PoliceMSP",
    },
    {
        "id": "USR-105",
        "username": "lawyer_advani",
        "full_name": "Advocate S. Advani",
        "role": UserRole.LAWYER.value,
        "msp_id": "PoliceMSP",
    },
    {
        "id": "USR-001",
        "username": "admin_sys",
        "full_name": "System Administrator",
        "role": UserRole.ADMIN.value,
        "msp_id": "PoliceMSP",
    },
]

DEFAULT_DOCUMENTS = [
    {
        "id": "DOC-101-01",
        "case_id": "CASE-101",
        "filename": "Hawala_Ledger_Extract_Encrypted.pdf",
        "content_hash": "a4f107382d6288b8f2a969b82142e0a2948bb526cf5434cb72797682855146c2",
        "blob_hash": "9c1b3f9bb86ad58b1a8047910196726bb1d9774618e778408010839ba8b8495a",
        "chunk_merkle_root": "80267ebcfa4dc2ea22a9667f339cf3d5a1b32960f781df3e005be9154a499a0e",
        "chunk_count": 4,
        "size_bytes": 1048576,
        "mime_type": "application/pdf",
        "doc_type": "FORENSIC_EXTRACTION",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "storage_path": "evidence/DOC-101-01.enc",
        "wrapped_dek": "mock_dek_key_101",
        "nonce_hex": "00112233445566778899aabb",
        "ledger_tx_id": "0x4a8b13c2f10d9821ef37bc9024a1e9c836928e102f9c314083a2456bcdef1001",
        "status": "ACTIVE",
    },
    {
        "id": "DOC-102-01",
        "case_id": "CASE-102",
        "filename": "Core_Banking_Ransomware_Binary_Memory_Dump.raw",
        "content_hash": "f62b109b8d234a9b6c1285098e90890123cb234908912ef3891089234b9012cd",
        "blob_hash": "39048a01823901bcf39812903810293812093810293812093812093810293812",
        "chunk_merkle_root": "6c39129038190238129038102938120938120938120938120938120938120938",
        "chunk_count": 8,
        "size_bytes": 4194304,
        "mime_type": "application/octet-stream",
        "doc_type": "TECHNICAL_LOG",
        "classification": "SECRET",
        "uploader_id": "USR-101",
        "storage_path": "evidence/DOC-102-01.enc",
        "wrapped_dek": "mock_dek_key_102",
        "nonce_hex": "112233445566778899aabbcc",
        "ledger_tx_id": "0x89ab12cd34ef567890123456789abcdef0123456789abcdef0123456789abcde",
        "status": "ACTIVE",
    },
    {
        "id": "DOC-105-01",
        "case_id": "CASE-105",
        "filename": "Darknet_Marketplace_Cold_Wallet_Chain_Analysis.pdf",
        "content_hash": "e891238910293812093812093812093812093810293810293812093812093812",
        "blob_hash": "7718923019283019283019283019283019283019283019283019283019283019",
        "chunk_merkle_root": "5518293019283019283019283019283019283019283019283019283019283019",
        "chunk_count": 6,
        "size_bytes": 2097152,
        "mime_type": "application/pdf",
        "doc_type": "INVESTIGATION_REPORT",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "storage_path": "evidence/DOC-105-01.enc",
        "wrapped_dek": "mock_dek_key_105",
        "nonce_hex": "2233445566778899aabbccdd",
        "ledger_tx_id": "0xbcde1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",
        "status": "ACTIVE",
    },
    {
        "id": "DOC-103-01",
        "case_id": "CASE-103",
        "filename": "Ballistics_Striation_Comparison_Report_7.62mm.pdf",
        "content_hash": "3391823019283019283019283019283019283019283019283019283019283019",
        "blob_hash": "2218923019283019283019283019283019283019283019283019283019283019",
        "chunk_merkle_root": "1118293019283019283019283019283019283019283019283019283019283019",
        "chunk_count": 3,
        "size_bytes": 1572864,
        "mime_type": "application/pdf",
        "doc_type": "FORENSIC_EXTRACTION",
        "classification": "SECRET",
        "uploader_id": "USR-102",
        "storage_path": "evidence/DOC-103-01.enc",
        "wrapped_dek": "mock_dek_key_103",
        "nonce_hex": "33445566778899aabbccddee",
        "ledger_tx_id": "0xcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890cd",
        "status": "ACTIVE",
    },
]


async def auto_seed_database(session: AsyncSession) -> None:
    """
    Checks and auto-populates default sovereign cases, users, and assignments.
    Idempotent and non-destructive.
    """
    # 1. Seed Cases
    case_count = (await session.execute(select(func.count(Case.case_id)))).scalar() or 0
    if case_count < len(DEFAULT_CASES):
        for c in DEFAULT_CASES:
            existing = await session.get(Case, c["case_id"])
            if not existing:
                session.add(Case(**c))
        await session.commit()

    # 2. Seed Users
    default_pwd = hash_password("SecurePass@2026")
    for u in DEFAULT_USERS:
        existing = await session.get(User, u["id"])
        if not existing:
            user_obj = User(
                id=u["id"],
                username=u["username"],
                full_name=u["full_name"],
                role=u["role"],
                password_hash=default_pwd,
                totp_secret="JBSWY3DPEHPK3PXP",
                mfa_enrolled=True,
                is_active=True,
                msp_id=u["msp_id"],
            )
            session.add(user_obj)
    await session.commit()

    # 3. Seed Assignments (Grant broad investigative scope to USR-101 and all roles)
    all_case_ids = [c["case_id"] for c in DEFAULT_CASES]
    for c_id in all_case_ids:
        # Give investigator (USR-101), supervisor (USR-104), and admin (USR-001) full case access
        for u_id in ["USR-101", "USR-104", "USR-001"]:
            asg_id = f"ASG-{u_id}-{c_id}"
            existing = await session.get(Assignment, asg_id)
            if not existing:
                session.add(Assignment(id=asg_id, user_id=u_id, case_id=c_id, is_active=True))

        # Assign relevant cases to specialist roles
        if c_id in ["CASE-101", "CASE-102", "CASE-103", "CASE-205", "CASE-527"]:
            asg_id = f"ASG-USR-102-{c_id}"
            if not await session.get(Assignment, asg_id):
                session.add(Assignment(id=asg_id, user_id="USR-102", case_id=c_id, is_active=True))

        if c_id in ["CASE-101", "CASE-102", "CASE-104", "CASE-311", "CASE-418"]:
            asg_id = f"ASG-USR-103-{c_id}"
            if not await session.get(Assignment, asg_id):
                session.add(Assignment(id=asg_id, user_id="USR-103", case_id=c_id, is_active=True))

        if c_id in ["CASE-102", "CASE-104", "CASE-418"]:
            asg_id = f"ASG-USR-105-{c_id}"
            if not await session.get(Assignment, asg_id):
                session.add(Assignment(id=asg_id, user_id="USR-105", case_id=c_id, is_active=True))

    await session.commit()

    # 4. Seed Initial Documents
    for d in DEFAULT_DOCUMENTS:
        existing = await session.get(Document, d["id"])
        if not existing:
            session.add(Document(**d))
    await session.commit()

    # 5. Seed Initial Chunks for RAG queries and Merkle verification
    default_chunks = [
        {
            "id": "CHK-101-01",
            "doc_id": "DOC-101-01",
            "chunk_index": 0,
            "chunk_hash": "a1b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef",
            "chunk_text": "SEIZED HAWALA TRANSACTION LEDGERS: Offshore cryptocurrency account 0x71C8366420A88301570BC86d3b36523293e8 identified transferring 450,000 USDT via peer-to-peer OTC liquidity desks across national jurisdictions.",
            "page_number": 1,
        },
        {
            "id": "CHK-102-01",
            "doc_id": "DOC-102-01",
            "chunk_index": 0,
            "chunk_hash": "b2c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef01",
            "chunk_text": "CENTRAL BANK RANSOMWARE FORENSIC EXTRACTION: Memory buffer dump shows Cobalt Strike beacon executing from process PID 4092 attempting lateral movement towards core RTGS settlement gateway router.",
            "page_number": 1,
        },
        {
            "id": "CHK-105-01",
            "doc_id": "DOC-105-01",
            "chunk_index": 0,
            "chunk_hash": "c3d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef0123",
            "chunk_text": "DARKNET LOGISTICS TELEMETRY: Intercepted encrypted courier routing manifests reveal coastal narcotics trafficking consignments tagged with PGP public key fingerprint 9F8A 2B3C 4D5E.",
            "page_number": 1,
        },
        {
            "id": "CHK-103-01",
            "doc_id": "DOC-103-01",
            "chunk_index": 0,
            "chunk_hash": "d4e5f60718293a4b5c6d7e8f901234567890abcdef1234567890abcdef012345",
            "chunk_text": "BALLISTICS MICROSCOPY SEIZURE MEMO: 7.62mm automatic assault rifle serial number defaced. Micro-striation comparison matches spent cartridges recovered from crime scene Alpha.",
            "page_number": 1,
        },
    ]

    for ch in default_chunks:
        existing = await session.get(Chunk, ch["id"])
        if not existing:
            session.add(Chunk(**ch))
    await session.commit()

