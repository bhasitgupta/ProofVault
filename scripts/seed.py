import asyncio
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.db.session import init_models, async_session_factory
from app.db.models.user import User
from app.db.models.case import Case
from app.db.models.assignment import Assignment
from app.core.security import hash_password
from app.core.constants import UserRole, ClassificationLevel

async def seed_data():
    print("[*] Initializing Database Schema...")
    await init_models()

    async with async_session_factory() as session:
        # 1. Seed Cases
        cases = [
            Case(
                case_id="CASE-102",
                title="State vs. R. K. Sharma (Financial Fraud & Forgery)",
                description="Seized financial ledgers, audit statements, forged sanction letters.",
                classification_ceiling=ClassificationLevel.CONFIDENTIAL.value,
                owning_msp="PoliceMSP"
            ),
            Case(
                case_id="CASE-205",
                title="Special Task Force vs. Cyber Syndicate",
                description="Network intrusion logs, digital forensics, seized hardware drives.",
                classification_ceiling=ClassificationLevel.SECRET.value,
                owning_msp="PoliceMSP"
            ),
            Case(
                case_id="CASE-311",
                title="Narcotics Bureau vs. Coastal Transit Network",
                description="Seizure memos, chemical analysis reports, witness depositions.",
                classification_ceiling=ClassificationLevel.CONFIDENTIAL.value,
                owning_msp="PoliceMSP"
            ),
            Case(
                case_id="CASE-418",
                title="Anti-Corruption Bureau Inquiry - Public Works",
                description="Tender bids, bank transfer slips, certified telephone transcripts.",
                classification_ceiling=ClassificationLevel.RESTRICTED.value,
                owning_msp="PoliceMSP"
            ),
            Case(
                case_id="CASE-527",
                title="State Forensics Division - Ballistics & Firearm Registry",
                description="Ballistics test results, striation microscopy reports, recovery memos.",
                classification_ceiling=ClassificationLevel.SECRET.value,
                owning_msp="ForensicsMSP"
            ),
        ]

        for c in cases:
            existing = await session.get(Case, c.case_id)
            if not existing:
                session.add(c)
        await session.commit()
        print(f"[✓] Seeded {len(cases)} Cases")

        # 2. Seed Users across all 5 roles + admin
        default_pwd = hash_password("SecurePass@2026")
        users = [
            User(
                id="USR-101",
                username="investigator_sharma",
                full_name="Inspector R. Sharma",
                role=UserRole.INVESTIGATOR.value,
                password_hash=default_pwd,
                totp_secret="JBSWY3DPEHPK3PXP",
                mfa_enrolled=True,
                msp_id="PoliceMSP"
            ),
            User(
                id="USR-102",
                username="forensic_ananya",
                full_name="Dr. Ananya Iyer",
                role=UserRole.FORENSIC_ANALYST.value,
                password_hash=default_pwd,
                totp_secret="JBSWY3DPEHPK3PXP",
                mfa_enrolled=True,
                msp_id="ForensicsMSP"
            ),
            User(
                id="USR-103",
                username="legal_verma",
                full_name="Public Prosecutor P. Verma",
                role=UserRole.LEGAL_OFFICER.value,
                password_hash=default_pwd,
                totp_secret="JBSWY3DPEHPK3PXP",
                mfa_enrolled=True,
                msp_id="PoliceMSP"
            ),
            User(
                id="USR-104",
                username="supervisor_kapoor",
                full_name="Superintendent of Police K. Kapoor",
                role=UserRole.SUPERVISOR.value,
                password_hash=default_pwd,
                totp_secret="JBSWY3DPEHPK3PXP",
                mfa_enrolled=True,
                msp_id="PoliceMSP"
            ),
            User(
                id="USR-105",
                username="lawyer_advani",
                full_name="Advocate S. Advani",
                role=UserRole.LAWYER.value,
                password_hash=default_pwd,
                totp_secret="JBSWY3DPEHPK3PXP",
                mfa_enrolled=True,
                msp_id="PoliceMSP"
            ),
            User(
                id="USR-001",
                username="admin_sys",
                full_name="System Administrator",
                role=UserRole.ADMIN.value,
                password_hash=default_pwd,
                totp_secret="JBSWY3DPEHPK3PXP",
                mfa_enrolled=True,
                msp_id="PoliceMSP"
            ),
        ]

        for u in users:
            existing = await session.get(User, u.id)
            if not existing:
                session.add(u)
        await session.commit()
        print(f"[✓] Seeded {len(users)} Users across 5 official roles")

        # 3. Seed Case Assignments
        assignments = [
            # Inspector Sharma is assigned ONLY to CASE-102 (Demo anchor for case-scoping)
            Assignment(id="ASG-001", user_id="USR-101", case_id="CASE-102", is_active=True),
            # Dr. Ananya (Forensic) has access to CASE-102 and CASE-527
            Assignment(id="ASG-002", user_id="USR-102", case_id="CASE-102", is_active=True),
            Assignment(id="ASG-003", user_id="USR-102", case_id="CASE-527", is_active=True),
            # Prosecutor Verma has access to CASE-102 and CASE-311
            Assignment(id="ASG-004", user_id="USR-103", case_id="CASE-102", is_active=True),
            Assignment(id="ASG-005", user_id="USR-103", case_id="CASE-311", is_active=True),
            # SP Kapoor has oversight across CASE-102, CASE-205, CASE-311, CASE-418
            Assignment(id="ASG-006", user_id="USR-104", case_id="CASE-102", is_active=True),
            Assignment(id="ASG-007", user_id="USR-104", case_id="CASE-205", is_active=True),
            Assignment(id="ASG-008", user_id="USR-104", case_id="CASE-311", is_active=True),
            Assignment(id="ASG-009", user_id="USR-104", case_id="CASE-418", is_active=True),
            # Defense Lawyer Advani assigned to CASE-102 only
            Assignment(id="ASG-010", user_id="USR-105", case_id="CASE-102", is_active=True),
        ]

        for a in assignments:
            existing = await session.get(Assignment, a.id)
            if not existing:
                session.add(a)
        await session.commit()
        print(f"[✓] Seeded {len(assignments)} Live Case Assignments")

if __name__ == "__main__":
    asyncio.run(seed_data())
