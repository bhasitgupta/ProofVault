"""
Script: clean_and_inject_mock.py
Purges all fake/test documents, quarantine files, and residual test cases.
Injects ONLY the official mock case dataset and grants COMPLETE access to:
  - ADMIN (admin_sys / USR-001) -> Full clearance + All Cases
  - INVESTIGATOR (investigator_gupta / USR-101) -> Secret clearance + All Cases
"""
import os
import sys
import shutil
import asyncio

# Ensure backend directory is in python path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)

from app.db.session import init_models, async_session_factory, engine
from app.db.base import Base
from app.db.models.user import User
from app.db.models.case import Case
from app.db.models.assignment import Assignment
from app.db.models.document import Document
from app.db.models.chunk import Chunk
from app.db.models.audit_log import AuditLog
from app.core.security import hash_password
from app.core.constants import UserRole, ClassificationLevel
from app.ledger.dev_ledger import DevLedger
from app.ingest.pipeline import run_ingestion_pipeline
from sqlalchemy import text

# ── 1. Mock Cases (9 Official Cases) ──────────────────────────────────────────
MOCK_CASES = [
    {
        "case_id": "CASE-101",
        "title": "State vs Cyber Syndicate - Hawala Breach & Crypto Theft",
        "description": "Cross-border cryptocurrency laundering and unauthorized virtual payment routing targeting banking gateway.",
        "classification_ceiling": "CONFIDENTIAL",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE"
    },
    {
        "case_id": "CASE-102",
        "title": "FIR 402/2026 - Central Bank Core Gateway Ransomware",
        "description": "Ransomware payload infiltration, encrypted server volumes, and forged administrative authorization letters.",
        "classification_ceiling": "SECRET",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE"
    },
    {
        "case_id": "CASE-103",
        "title": "Special Investigation - Ballistics & Arms Seizure",
        "description": "Clandestine armory raid, automatic weapon serial number recovery, and ballistic striation analysis.",
        "classification_ceiling": "SECRET",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE"
    },
    {
        "case_id": "CASE-104",
        "title": "Judicial Review - Corporate Embezzlement & Balance Sheet Forgery",
        "description": "Falsification of corporate statutory balance sheets and fraudulent high-value RTGS escrow transfers.",
        "classification_ceiling": "RESTRICTED",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE"
    },
    {
        "case_id": "CASE-105",
        "title": "Digital Narcotics Trafficking & Darknet Transit Network",
        "description": "Tor hidden service marketplace operations, seized cold storage hardware wallets, and contraband consignments.",
        "classification_ceiling": "CONFIDENTIAL",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE"
    },
    {
        "case_id": "CASE-205",
        "title": "Special Task Force vs. Advanced Persistent Threat Syndicate",
        "description": "Critical infrastructure SCADA telemetry exfiltration and state-sponsored APT malware forensics.",
        "classification_ceiling": "SECRET",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE"
    },
    {
        "case_id": "CASE-311",
        "title": "Narcotics Control Bureau vs. Coastal Maritime Transit Network",
        "description": "Maritime seizure memos, chemical spectrometry assays, intercepted satellite comms, and witness depositions.",
        "classification_ceiling": "CONFIDENTIAL",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE"
    },
    {
        "case_id": "CASE-418",
        "title": "Anti-Corruption Bureau Inquiry - PWD Infrastructure Tender",
        "description": "Rigged electronic procurement bids, offshore kickback routing slips, and certified telephone wiretaps.",
        "classification_ceiling": "RESTRICTED",
        "owning_msp": "PoliceMSP",
        "status": "ACTIVE"
    },
    {
        "case_id": "CASE-527",
        "title": "State Forensic Science Laboratory - Ballistics & Firearm Registry",
        "description": "Central ballistics registry, firearm striation microscopy benchmarks, and forensic comparison recovery memos.",
        "classification_ceiling": "SECRET",
        "owning_msp": "ForensicsMSP",
        "status": "ACTIVE"
    },
]

# ── 2. Official Users ─────────────────────────────────────────────────────────
MOCK_USERS = [
    {
        "id": "USR-101",
        "username": "investigator_gupta",
        "full_name": "Inspector Bhasit Gupta",
        "role": UserRole.INVESTIGATOR.value,
        "msp_id": "PoliceMSP"
    },
    {
        "id": "USR-102",
        "username": "forensic_ananya",
        "full_name": "Dr. Ananya Iyer",
        "role": UserRole.FORENSIC_ANALYST.value,
        "msp_id": "ForensicsMSP"
    },
    {
        "id": "USR-103",
        "username": "legal_verma",
        "full_name": "Public Prosecutor P. Verma",
        "role": UserRole.LEGAL_OFFICER.value,
        "msp_id": "PoliceMSP"
    },
    {
        "id": "USR-104",
        "username": "supervisor_kapoor",
        "full_name": "Superintendent of Police K. Kapoor",
        "role": UserRole.SUPERVISOR.value,
        "msp_id": "PoliceMSP"
    },
    {
        "id": "USR-105",
        "username": "lawyer_advani",
        "full_name": "Advocate S. Advani",
        "role": UserRole.LAWYER.value,
        "msp_id": "PoliceMSP"
    },
    {
        "id": "USR-001",
        "username": "admin_sys",
        "full_name": "System Administrator",
        "role": UserRole.ADMIN.value,
        "msp_id": "PoliceMSP"
    },
]

# ── 3. Clean Mock Documents ───────────────────────────────────────────────────
CLEAN_DOCUMENTS = [
    # CASE-101: Hawala Breach & Crypto Theft
    {
        "filename": "fir_101_cyber_hawala.txt",
        "case_id": "CASE-101",
        "doc_type": "FIR",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "uploader_msp": "PoliceMSP",
        "content": """FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)
District: New Delhi | Police Station: Special Cell (Cyber Crime Division)
FIR Number: 0101/2026 | Date of Registration: 12-Feb-2026
Offense: Information Technology Act Sec 66C, 66D, 420 IPC, Section 63 BSA

Incident Brief:
A sophisticated offshore laundering syndicate was detected transferring illicit funds via unauthorized virtual payment addresses.
Server telemetry and forensic network captures isolated unauthorized login sessions from IP 198.51.100.22 authenticating against the banking transaction gateway.
Volatile memory dumps and packet captures have been preserved on cryptographically sealed media with digital signatures.
Total estimated diversion exceeds INR 42.8 Crores across 11 fictitious shell entities."""
    },
    {
        "filename": "witness_statement_sharma.txt",
        "case_id": "CASE-101",
        "doc_type": "WITNESS_STATEMENT",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "uploader_msp": "PoliceMSP",
        "content": """STATEMENT OF WITNESS (Under Section 161 Cr.P.C.)
Case FIR: 0101/2026 | Case ID: CASE-101
Witness Name: Alok Kumar, Lead Network Operations Engineer
Date: 15-Feb-2026 | Location: Special Cell Cyber HQ

Statement:
I observed unexpected terminal sessions originating from internal switch port 4 at 02:14 AM.
The credentials utilized belonged to a decommissioned administrative account.
A black sedan vehicle was seen leaving the scene near the server facility gates around 02:30 AM.
I immediately triggered the network isolation protocol, killed all active SSH tunnels, and notified Inspector Sharma."""
    },
    {
        "filename": "seizure_memo_server_nodes.txt",
        "case_id": "CASE-101",
        "doc_type": "SEIZURE_MEMO",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "uploader_msp": "PoliceMSP",
        "content": """EVIDENCE SEIZURE MEMORANDUM (Under Section 102 Cr.P.C.)
Case ID: CASE-101 | Seizure Location: Cyber Gateway Facility, Sector 18
Date of Seizure: 16-Feb-2026

Items Seized into Formal Custody:
1. Rack-Mounted Server Dell PowerEdge R750 (Serial #SN-99201-DEL) containing 4x 1.92TB NVMe SSDs.
2. Hardware Security Module (HSM) YubiHSM2 Auth Token (Serial #HSM-441-SEC).
3. Cisco Catalyst 9300 Switch with uncommitted volatile packet buffers.

All items bagged in anti-static tamper-evident evidence bags with serial barcoded seals.
Custody transferred directly to Cyber Forensics Division."""
    },

    # CASE-102: Central Bank Core Gateway Ransomware
    {
        "filename": "fir_402_2026_central_bank.txt",
        "case_id": "CASE-102",
        "doc_type": "FIR",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "uploader_msp": "PoliceMSP",
        "content": """FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)
Police Station: Financial Crimes Enforcement Branch | Date: 18-Jan-2026
FIR Number: 0402/2026 | Target: Central Bank Clearing Switch

Accused: R. K. Sharma (Former IT Vice President) & Unknown Co-Conspirators
Sections: Sec 409, 420, 467, 471 IPC, Sec 66 Information Technology Act

Details:
Accused engaged in unauthorized exfiltration of encrypted financial transaction ledgers and deployed ransomware lockers across 14 database clusters.
A ransom demand note titled 'RESTORE_DATA.txt' demanding 150 BTC was recovered from the root directory of the active gateway cluster.
Seized physical records include forged sanction letters and counterfeit authorization tokens."""
    },
    {
        "filename": "forensic_intrusion_analysis_report.txt",
        "case_id": "CASE-102",
        "doc_type": "FORENSIC_REPORT",
        "classification": "SECRET",
        "uploader_id": "USR-102",
        "uploader_msp": "ForensicsMSP",
        "content": """CENTRAL FORENSIC SCIENCE LABORATORY (CFSL)
Digital Evidence Examination Division | Laboratory Case: CFSL-DEL-2026-892
Case Reference: CASE-102 (FIR 402/2026)

Forensic Findings & Technical Conclusions:
1. Ransomware binary identified as a customized variant of LockBit 3.0 compiled on 12-Jan-2026.
2. Lateral movement was achieved utilizing compromised domain credentials belonging to 'rk_sharma_admin'.
3. Exfiltration staging archive 'dump_tx_2025.tar.gz.enc' was staged on outbound cloud bucket before encryption triggers executed.
4. Cryptographic integrity of audit trails confirms non-repudiation of the source MAC address."""
    },
    {
        "filename": "witness_deposition_cto.txt",
        "case_id": "CASE-102",
        "doc_type": "WITNESS_STATEMENT",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "uploader_msp": "PoliceMSP",
        "content": """DEPOSITION OF WITNESS (Under Section 161 Cr.P.C.)
Witness: Dr. Arvind Swaminathan, Chief Technology Officer, Central Banking Switch
Case ID: CASE-102 | Investigating Officer: Inspector Sharma

Testimony:
On 17-Jan-2026 at 23:45 hours, our continuous security monitoring dashboard triggered red alerts.
The accused had requested emergency root override keys three days prior citing routine disaster recovery drills.
No authorization was given by the board for off-site data exports.
I certify under Section 63 BSA that these digital system logs were produced by automated cryptographic mechanisms in the regular course of business."""
    },

    # CASE-103: Ballistics & Arms Seizure
    {
        "filename": "fir_103_clandestine_armory.txt",
        "case_id": "CASE-103",
        "doc_type": "FIR",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "uploader_msp": "PoliceMSP",
        "content": """FIRST INFORMATION REPORT (Section 154 Cr.P.C.)
Police Station: Special Weapons & Anti-Extortion Cell
FIR No: 0103/2026 | Date: 03-Feb-2026
Offense: Arms Act Sec 25/27, Unlawful Activities (Prevention) Act

Gist of Offense:
Acting upon high-grade intelligence, team raided industrial godown located at Shahdara.
Recovered cache of unlicensed semi-automatic firearms, customized 9mm suppressors, and stamped ammunition cases.
Seized firearms were test-fired under controlled conditions for comparison with unsolved homicide shell casings."""
    },
    {
        "filename": "forensic_ballistics_report_103.txt",
        "case_id": "CASE-103",
        "doc_type": "FORENSIC_REPORT",
        "classification": "SECRET",
        "uploader_id": "USR-102",
        "uploader_msp": "ForensicsMSP",
        "content": """CENTRAL FORENSIC SCIENCE LABORATORY (CFSL)
Ballistics & Firearms Division Report
Exhibit No: B-4021/2026 | Case ID: CASE-103 | Date: 08-Feb-2026

Ballistic Examination & Microscopic Comparison:
The test-fired 9mm cartridge cases were compared under comparison macroscope with questioned cartridge cases recovered from crime scene.
Striation marks on the firing pin indentation, chamber marks, and breech face match the seized pistol (Serial #8841-A) with 99.8% precision.
Result: Conclusive ballistic identification positive. The seized weapon fired the fatal rounds."""
    },

    # CASE-104: Corporate Embezzlement
    {
        "filename": "fir_104_corporate_forgery.txt",
        "case_id": "CASE-104",
        "doc_type": "FIR",
        "classification": "RESTRICTED",
        "uploader_id": "USR-101",
        "uploader_msp": "PoliceMSP",
        "content": """FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.)
Economic Offences Wing | FIR: 0104/2026 | Date: 10-Jan-2026
Subject: Corporate Fraud, Forged Financial Instruments, Companies Act Sec 447

Details:
Auditors detected falsification of annual balance sheets and unauthorized round-tripping of capital advances.
Digital records reveal duplicate invoices totaling INR 18.5 Crores submitted for fictitious software licensing contracts.
All records maintained on verified accounting software have been seized."""
    },
    {
        "filename": "statutory_audit_investigation_report.txt",
        "case_id": "CASE-104",
        "doc_type": "FORENSIC_REPORT",
        "classification": "RESTRICTED",
        "uploader_id": "USR-103",
        "uploader_msp": "PoliceMSP",
        "content": """SPECIAL STATUTORY AUDIT EXAMINATION REPORT
Investigating Authority: Economic Offences Wing
Case ID: CASE-104 | Auditor: M/s Singhania & Associates Forensic Accounting

Audit Observations:
1. Vendor accounts #V-901 through #V-908 share identical GSTIN and IFSC bank codes.
2. Digital signatures on the disbursement orders were generated outside company authorized HSM hardware tokens.
3. Trail confirms beneficial ownership tracing back to offshore accounts held by promoters."""
    },

    # CASE-105: Darknet Narcotics
    {
        "filename": "fir_105_darknet_narcotics.txt",
        "case_id": "CASE-105",
        "doc_type": "FIR",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "uploader_msp": "PoliceMSP",
        "content": """FIRST INFORMATION REPORT (NDPS Act Sec 21, 29 & IT Act Sec 66D)
Narcotics Control Unit | FIR No: 0105/2026 | Date: 20-Feb-2026

Incident Summary:
Joint operation intercepted courier parcel containing high-purity synthetic narcotics ordered via Tor hidden service marketplace 'Hydra-Transit'.
Cryptocurrency tracking linked buyer wallet to local vendor operating encrypted PGP communication keys."""
    },
    {
        "filename": "chemical_spectrometry_assay_report.txt",
        "case_id": "CASE-105",
        "doc_type": "FORENSIC_REPORT",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-102",
        "uploader_msp": "ForensicsMSP",
        "content": """FORENSIC SCIENCE LABORATORY - CHEMICAL ANALYSIS REPORT
Narcotics & Toxicological Division | Lab Ref: FSL-NDPS-2026-302
Case ID: CASE-105 | Date: 22-Feb-2026

Analysis Summary:
Sample Exhibit Marked 'Q-1' was subjected to Gas Chromatography-Mass Spectrometry (GC-MS) and Fourier-Transform Infrared Spectroscopy (FTIR).
Chemical purity confirmed as 94.2% Methamphetamine hydrochloride.
Sealed packaging chain of custody maintained intact."""
    },

    # CASE-205: Cyber Syndicate
    {
        "filename": "fir_205_stf_apt.txt",
        "case_id": "CASE-205",
        "doc_type": "FIR",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "uploader_msp": "PoliceMSP",
        "content": """FIRST INFORMATION REPORT (Section 154 Cr.P.C.)
Special Task Force Cyber Command | Case ID: CASE-205 | Date: 05-Jan-2026
Offense: Information Technology Act Sec 66F (Cyber Terrorism), 121A IPC

Incident:
State-sponsored threat actor cluster targeted electrical grid substation management infrastructure.
Network telemetry isolated command-and-control beacons utilizing DNS tunneling over port 53.
Hardware drives seized from field RTUs preserved for forensic extraction."""
    },

    # CASE-311: Coastal Maritime Transit
    {
        "filename": "seizure_memo_maritime_vessel.txt",
        "case_id": "CASE-311",
        "doc_type": "SEIZURE_MEMO",
        "classification": "CONFIDENTIAL",
        "uploader_id": "USR-101",
        "uploader_msp": "PoliceMSP",
        "content": """EVIDENCE SEIZURE MEMORANDUM (Maritime Jurisdiction)
Case ID: CASE-311 | Location: 12 Nautical Miles Off Gujarat Coast
Date: 28-Jan-2026 | Vessel: Dhow 'Al-Murtaza' (Registry #MSV-8102)

Seizure Items:
1. Thuraya XT-PRO Satellite Phone with call logs intact.
2. GPS Chartplotter Garmin GPSMAP 78s with recorded route waypoints.
3. 24 sealed waterproof burlap packages containing contraband.
Chain of custody transferred under Section 63 BSA certificate."""
    },

    # CASE-418: Anti-Corruption PWD
    {
        "filename": "fir_418_acb_pwd_tender.txt",
        "case_id": "CASE-418",
        "doc_type": "FIR",
        "classification": "RESTRICTED",
        "uploader_id": "USR-101",
        "uploader_msp": "PoliceMSP",
        "content": """FIRST INFORMATION REPORT (Prevention of Corruption Act Sec 7, 13)
Anti-Corruption Branch | FIR No: 0418/2026 | Date: 14-Feb-2026

Brief Facts:
Trap operation executed following whistleblower complaint regarding flyover construction tender.
Digital audio recording on micro-recorder captures demand for illegal gratification.
Electronic bid submission logs confirm metadata tampering 12 minutes prior to bid close."""
    },

    # CASE-527: State Forensics Ballistics Registry
    {
        "filename": "ballistics_registry_benchmark_data.txt",
        "case_id": "CASE-527",
        "doc_type": "FORENSIC_REPORT",
        "classification": "SECRET",
        "uploader_id": "USR-102",
        "uploader_msp": "ForensicsMSP",
        "content": """STATE FORENSIC DIVISION - BALLISTICS REGISTRY ARCHIVE
Document: Standard Firearm Striation Profiling Benchmark
Case ID: CASE-527 | Authorized Examiner: Dr. Ananya Iyer

Registry Description:
Digital 3D optical profilometry measurements of breech face and firing pin impressions for standardized departmental service weapons.
All optical scans watermarked with SHA-256 Merkle root trees and registered on Hyperledger dochash-channel."""
    },
]

async def clean_and_inject():
    print("=" * 65)
    print("  SDMS: PURGING FAKE DATA & INJECTING CLEAN MOCK DATASET")
    print("=" * 65)

    # 1. Clean object store blobs
    evidence_dir = os.path.join(BACKEND_DIR, "storage_data", "evidence")
    quarantine_dir = os.path.join(BACKEND_DIR, "storage_data", "quarantine")
    if os.path.exists(evidence_dir):
        shutil.rmtree(evidence_dir)
    if os.path.exists(quarantine_dir):
        shutil.rmtree(quarantine_dir)
    os.makedirs(evidence_dir, exist_ok=True)
    os.makedirs(quarantine_dir, exist_ok=True)
    print("[✓] Cleared physical object storage (evidence & quarantine)")

    # 2. Reset database tables
    async with async_session_factory() as session:
        print("[*] Purging all fake documents, chunks, audit logs, and test cases...")
        await session.execute(text("DELETE FROM chunks;"))
        await session.execute(text("DELETE FROM documents;"))
        await session.execute(text("DELETE FROM audit_logs;"))
        await session.execute(text("DELETE FROM assignments;"))
        await session.execute(text("DELETE FROM cases;"))
        await session.commit()
    print("[✓] Database tables purged.")

    # 3. Clean and recreate DevLedger
    ledger_db = os.path.join(BACKEND_DIR, "sdms_dev_ledger.db")
    if os.path.exists(ledger_db):
        os.remove(ledger_db)
    ledger = DevLedger(db_path=ledger_db)
    print("[✓] DevLedger reset to clean genesis state.")

    # 4. Inject 9 Mock Cases
    print("\n[*] Step 1/4: Injecting 9 Clean Mock Cases...")
    async with async_session_factory() as session:
        for c_data in MOCK_CASES:
            case = Case(
                case_id=c_data["case_id"],
                title=c_data["title"],
                description=c_data["description"],
                classification_ceiling=c_data["classification_ceiling"],
                owning_msp=c_data["owning_msp"],
                status=c_data["status"]
            )
            session.add(case)
            print(f"  [+] Case: {c_data['case_id']} [{c_data['classification_ceiling']}] — {c_data['title']}")
        await session.commit()

    # 5. Inject 6 Official Users
    print("\n[*] Step 2/4: Ensuring Official User Accounts...")
    default_pwd = hash_password("SecurePass@2026")
    async with async_session_factory() as session:
        for u_data in MOCK_USERS:
            existing = await session.get(User, u_data["id"])
            if not existing:
                u = User(
                    id=u_data["id"],
                    username=u_data["username"],
                    full_name=u_data["full_name"],
                    role=u_data["role"],
                    password_hash=default_pwd,
                    totp_secret="JBSWY3DPEHPK3PXP",
                    mfa_enrolled=True,
                    is_active=True,
                    msp_id=u_data["msp_id"]
                )
                session.add(u)
            else:
                existing.is_active = True
                existing.mfa_enrolled = True
                existing.password_hash = default_pwd
            print(f"  [✓] User: {u_data['username']} ({u_data['role']})")
        await session.commit()

    # 6. Assign COMPLETE access for ADMIN and INVESTIGATOR across ALL 9 cases!
    print("\n[*] Step 3/4: Granting COMPLETE Access across All Cases for ADMIN & INVESTIGATOR...")
    all_case_ids = [c["case_id"] for c in MOCK_CASES]

    async with async_session_factory() as session:
        # COMPLETE ACCESS for ADMIN (USR-001)
        for cid in all_case_ids:
            session.add(Assignment(id=f"ASG-ADM-{cid}", user_id="USR-001", case_id=cid, is_active=True))
        print("  [★] ADMIN (admin_sys / USR-001): Granted COMPLETE access to all 9 cases.")

        # COMPLETE ACCESS for INVESTIGATOR (USR-101)
        for cid in all_case_ids:
            session.add(Assignment(id=f"ASG-INV-{cid}", user_id="USR-101", case_id=cid, is_active=True))
        print("  [★] INVESTIGATOR (investigator_gupta / USR-101): Granted COMPLETE access to all 9 cases.")

        # Standard assignments for other roles
        # Supervisor Kapoor -> all cases
        for cid in all_case_ids:
            session.add(Assignment(id=f"ASG-SUP-{cid}", user_id="USR-104", case_id=cid, is_active=True))

        # Forensic Analyst Ananya -> technical & forensics cases
        for cid in ["CASE-101", "CASE-102", "CASE-103", "CASE-205", "CASE-527"]:
            session.add(Assignment(id=f"ASG-FOR-{cid}", user_id="USR-102", case_id=cid, is_active=True))

        # Legal Officer Verma -> judicial & prosecution cases
        for cid in ["CASE-101", "CASE-102", "CASE-104", "CASE-311", "CASE-418"]:
            session.add(Assignment(id=f"ASG-LEG-{cid}", user_id="USR-103", case_id=cid, is_active=True))

        # Lawyer Advani -> judicial/civil review cases
        for cid in ["CASE-102", "CASE-104", "CASE-418"]:
            session.add(Assignment(id=f"ASG-LAW-{cid}", user_id="USR-105", case_id=cid, is_active=True))

        await session.commit()
    print("[✓] Case assignment matrix committed.")

    # 7. Ingest only clean mock documents via 14-step pipeline
    print("\n[*] Step 4/4: Ingesting 16 Authentic Mock Evidence Documents...")
    ingested = 0
    async with async_session_factory() as session:
        for doc in CLEAN_DOCUMENTS:
            res = await run_ingestion_pipeline(
                file_bytes=doc["content"].strip().encode("utf-8"),
                filename=doc["filename"],
                case_id=doc["case_id"],
                doc_type=doc["doc_type"],
                classification=doc["classification"],
                uploader_id=doc["uploader_id"],
                uploader_msp=doc["uploader_msp"],
                session=session,
                ledger=ledger
            )
            ingested += 1
            print(f"  [✓] {doc['case_id']} | {doc['filename']} [{doc['classification']}] -> Doc ID: {res['doc_id'][:8]}... | TX: {res['ledger_tx_id'][:16]}...")

    print("\n" + "=" * 65)
    print(f"[✓] SUCCESS: Purged all fake files. Ingested {ingested} authentic documents across 9 cases.")
    print("    COMPLETE ACCESS ACTIVE: ADMIN and INVESTIGATOR can view, query, and manage all cases.")
    print("=" * 65)

if __name__ == "__main__":
    asyncio.run(clean_and_inject())
