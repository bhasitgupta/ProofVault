**SMART INDIA HACKATHON 2026**

**SIH26190**

**Secure Digital Document Management System**

**for Legal and Investigation Documents**

*Ministry of Home Affairs \| Theme: Smart Automation*

**Detailed Project Report**

Problem Statement • Idea • Architecture • Innovation • Feasibility • Impact

*Prepared for PPT / Evaluation Submission*

**1. Problem Statement**

  ———————-- ———————————————————————————
  **PS ID**               SIH26190

  **Title**               Secure Digital Document Management System for Legal and Investigation Documents

  **Ministry**            Ministry of Home Affairs

  **Theme**               Smart Automation

  **Category**            Software
  ———————-- ———————————————————————————

**Problem Summary**

Background Law enforcement agencies, courts, legal departments, and investigative organizations handle vast amounts of sensitive documents throughout the lifecycle of a case. These documents may include:
• FIRs and police reports
• Investigation records
• Witness statements
• Charge sheets
• Court filings
• Evidence records
• Forensic reports
• Legal notices and judgments Many organizations still rely on paper-based systems or fragmented digital storage solutions. This often leads to challenges such as:
• Difficulty in locating documents quickly
• Unauthorized access to confidential information
• Document tampering risks
• Lack of version control
• Inefficient collaboration between departments
• Delays in legal and investigative processes
• Poor auditability and compliance tracking As the volume of legal and investigation-related data continues to grow,there is an increasing need for a secure, centralized, and intelligent document management system that ensures data integrity, accessibility,confidentiality, and efficient case management.Modern technologies such as Cloud Computing, Artificial Intelligence (AI), Blockchain, Digital Signatures, and Secure Access Control can significantly improve the management and security of legal and investigative documents.
• Description The objective is to develop a Secure Digital Document Management System (DMS) that enables law enforcement agencies, legal institutions, and investigative departments to securely store, organize, manage,retrieve, and share sensitive legal and investigation documents.

The system should:

• Digitize and centralize document storage.
• Ensure secure access and confidentiality.
• Prevent unauthorized modifications.
• Maintain a complete audit trail of document activities.
• Enable efficient document search and retrieval.
• Support collaboration among authorized stakeholders.
• Ensure compliance with legal and regulatory requirements.

The challenge is to create a secure, scalable, and intelligent platform that streamlines document handling while preserving legal validity and evidentiary integrity.

• Expected Solution Develop a system to monitor and manage police assets throughout their lifecycle.

**2. Proposed Idea**

A Secure Digital Document Management platform that combines cryptographic integrity (hashing + encryption), a permissioned blockchain ledger for tamper-evident chain of custody, and a Retrieval-Augmented Generation (RAG) search layer so authorized users can query case documents in plain language and get grounded, cited, and verifiably untampered answers.

-   **Core promise:** Every document that enters the system is hashed, encrypted, and timestamped on a permissioned blockchain — so any later modification is mathematically detectable, and every access is logged immutably.

-   **Core usability layer:** Instead of manually digging through folders, an investigator or legal officer can ask a natural-language question (e.g. \"show me forensic reports linked to Case-102 filed after March\") and receive a grounded answer with citations, restricted to only what their role and case assignment permit.

-   **Core trust layer:** Every AI-generated answer is re-verified against the blockchain hash of its source document before being shown to the user, so the system will not present evidence it cannot prove is unaltered.

**3. System Flow / Architecture**

**3.1 Ingestion Flow**

-   Legal/Investigation document uploaded → split into Original File + Metadata

-   Original File → Malware Scan → clean files proceed, infected files are quarantined and logged

-   Clean file → Hash Generation (SHA-256 / SHA-3) → Encryption Layer (AES-256 / envelope encryption)

-   Encrypted file + metadata → Secure Document Storage

-   Hash + timestamp written to the Hyperledger Fabric ledger (Doc-Hash Channel) — immutable, tamper-evident record

-   Storage → OCR / Text Extraction → Chunking + Metadata Tagging (case ID, document type, date) → Embedding Model → Vector Database (with a BM25 keyword index for hybrid retrieval)

**3.2 Access Control Flow**

-   User logs in → MFA → RBAC / ABAC Verification (role + case-scope check)

-   Roles: Investigator, Forensic Analyst, Legal Officer, Supervisor, Lawyer

-   Case scope: access is further restricted to the specific case(s) a user is assigned to (e.g. Case-102, Case-205)

-   Access denied → request rejected and the attempt is logged to the Permission/Access Chain

-   Access allowed → user may upload documents or submit queries

**3.3 Query / RAG Flow**

-   User submits a natural-language prompt → Query Abstraction / Policy Filter applies the same RBAC/ABAC engine to the query itself

-   Authorized RAG Retrieval pulls candidate chunks from the Vector Database + BM25 hybrid index, filtered to only documents the user's role and case scope permit

-   Relevant evidence chunks → LLM → Grounded Response with source citations and evidence links

-   Integrity Check: the cited source documents are re-hashed and compared against the Doc-Hash Channel on the blockchain

-   Match → response is shown as Verified Evidence

-   Mismatch → response is blocked, a Tampering Detected alert is raised, and the event is logged to the Permission/Access Chain

**3.4 Audit & Chain of Custody**

A single Hyperledger Fabric network runs two channels: a Doc-Hash Channel (document hash + timestamp, written once at ingestion) and a Permission/Access Chain (every login, query, denial, and tampering event, written continuously). Together these give a complete, court-admissible record of what entered the system, who touched it, and whether it has ever changed.

**4. Key Innovations**

-   **Dual-channel permissioned ledger:** Separates document integrity (hash chain) from access accountability (permission chain) on one Fabric network — avoids the overhead of running two blockchains while keeping the two audit concerns cleanly separated.

-   **Policy-aware RAG:** The same RBAC/ABAC engine that gates login also gates retrieval at the chunk level — a query never surfaces a chunk the user's role/case scope doesn't permit, not just the document as a whole.

-   **Self-verifying answers:** Every RAG response is re-hashed and checked against the blockchain before being shown — the LLM cannot present tampered or stale evidence as fact, closing the trust gap that normally exists between AI-generated summaries and legal evidentiary standards.

-   **Hybrid retrieval (Vector + BM25):** Combines semantic search with exact keyword/citation matching, addressing a real gap in legal search where clause-level and citation-level precision matters as much as conceptual similarity.

-   **Closed-loop tampering response:** A hash mismatch doesn't just fail silently — it actively raises an alert and writes itself into the permission chain, making tampering attempts part of the permanent audit trail.

**5. Advantages / Pros**

  ——————————————————————————————————————-
  **Capability**                             **Benefit**
  —————————————— ————————————————————————
  Cryptographic hashing (SHA-256/SHA-3)      Any modification to a document is mathematically detectable

  AES-256 envelope encryption                Documents unreadable even if storage is breached

  Permissioned blockchain ledger             Tamper-evident, independently verifiable chain of custody

  RBAC/ABAC + case scoping                   Fine-grained, least-privilege access by role and case

  RAG-based natural language search          Minutes instead of hours to locate relevant case material

  Hybrid vector + BM25 retrieval             Both conceptual and exact-match legal search

  Automated integrity check on every query   Evidence shown to a user is always freshly verified, not assumed valid
  ——————————————————————————————————————-

**6. Edge Cases Covered**

  ——————————————————————————————————————————————————————————
  **Scenario**                                                              **System Behaviour**
  ————————————————————————- —————————————————————————————————-
  Malware-infected file uploaded                                            Quarantined before hashing/storage; upload attempt logged

  User without case access queries a document                               Query Abstraction/Policy Filter blocks retrieval at the chunk level; denial logged

  Unauthorized login attempt                                                MFA + RBAC verification rejects; event written to Permission/Access Chain

  Document altered after storage (insider or external tampering)            Re-hash at query time mismatches the Doc-Hash Channel → Tampering Detected alert, response blocked

  Ambiguous or exact-phrase legal query (e.g. citing a specific clause)     BM25 keyword index handles exact match where pure semantic vector search would under-perform

  User role changes mid-investigation (e.g. reassigned off a case)          ABAC re-evaluates case scope per query, not just at login — access updates immediately

  Duplicate document upload                                                 Hash comparison at ingestion detects duplicates before a second ledger entry is created

  System attempts to answer from a document whose hash cannot be verified   Integrity Check fails closed — response withheld rather than shown unverified
  ——————————————————————————————————————————————————————————

**7. Impact**

-   **Evidentiary integrity:** Provides a legally defensible, tamper-evident chain of custody for documents used in court — directly strengthens prosecution and investigation outcomes.

-   **Investigation speed:** Natural-language retrieval across case files cuts document search time from hours to minutes, accelerating case resolution.

-   **Accountability:** Every access, query, and denial is permanently logged — insider misuse or unauthorized access becomes traceable rather than invisible.

-   **Scale:** Applicable across police departments, forensic labs, and courts nationwide as a shared, interoperable standard for legal document handling.

**8. Benefits**

  ——————————————————————————————————--
  **Stakeholder**              **Benefit**
  —————————- —————————————————————————
  Investigators                Faster access to relevant case material; less manual file-hunting

  Forensic analysts            Verifiable, tamper-proof storage for sensitive forensic reports

  Legal officers / lawyers     Citable, grounded answers with evidence links for case preparation

  Courts                       Cryptographically provable chain of custody supports admissibility

  Administration / oversight   Full audit trail of access and modification for accountability and review

  Citizens                     Faster, more reliable justice delivery through reduced procedural delay
  ——————————————————————————————————--

**9. Feasibility**

**9.1 Technical Feasibility**

-   All core components — SHA-256/SHA-3 hashing, AES-256 encryption, Hyperledger Fabric, vector databases, BM25 indexing, OCR, and open-source LLMs — are mature, well-documented, and freely available.

-   Hyperledger Fabric is purpose-built for permissioned, consortium use cases like inter-departmental government systems, avoiding the cost and public exposure of a public blockchain.

-   A working proof-of-concept (ingestion → hashing → encryption → ledger → RAG query → integrity check) is buildable within a hackathon timeframe using existing open-source libraries.

**9.2 Operational Feasibility**

-   Fits within existing document workflows (upload, tag by case, search) — minimal retraining needed for investigators and legal staff.

-   Can be deployed on-premise / air-gapped for sensitive MHA data, satisfying government data-residency and confidentiality requirements.

**9.3 Economic Feasibility**

-   Built entirely on open-source components (Hyperledger Fabric, open embedding models, open-source OCR) — no recurring proprietary licensing cost.

-   Storage and compute needs scale predictably with document volume, keeping infrastructure costs manageable for phased department-wise rollout.

**10. Viability**

-   **Regulatory alignment:** Directly supports the Ministry of Home Affairs mandate for secure, auditable digital handling of legal and investigation records, and aligns with evidentiary standards under Indian law (e.g. Bharatiya Sakshya Adhiniyam provisions on electronic evidence).

-   **Long-term sustainability:** A permissioned ledger and modular RAG pipeline can be extended over time — additional departments, document types, or case-management integrations can be added without re-architecting the core system.

-   **Adoption path:** Can be piloted in a single department or district first, validated against real case data, then scaled horizontally — reducing rollout risk.

-   **Maintainability:** Component-based design (ingestion, ledger, retrieval, LLM) allows each layer to be upgraded independently, e.g. swapping in a newer embedding model, without disrupting the audit trail already recorded.

*End of Report — SIH26190*
