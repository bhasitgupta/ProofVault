# Zero-Trust Attribute-Based Access Control (ABAC) Policy Model

## 1. Security Architecture Principles

SDMS implements an unbypassable Zero-Trust Attribute-Based Access Control (ABAC) engine adhering to the Principle of Least Privilege (PoLP). Access decisions are evaluated at runtime by Open Policy Agent (OPA) / embedded Rego engines and cryptographically bounded at vector retrieval and database layers.

### Invariant Rules
1. **Rule C8 (Live DB Scoping)**: JWT claims contain only authentication primitives (`sub`, `role`, `mfa_verified`). Case access scopes are **never** baked into static JWT tokens. Active case authorizations are queried live from the database on every transaction to ensure instant revocation takes effect immediately with zero token caching lag.
2. **Pre-Retrieval Vector Filtering**: Vector embeddings in Qdrant are tagged with `case_id` payload metadata. Every nearest-neighbor search injects mandatory hard pre-filters `{"key": "case_id", "match": {"value": user_case}}`. This mathematically prevents any chunk belonging to unassigned cases from entering the retrieval candidate set.
3. **MFA Enforced Operations**: High-privilege actions (document export, evidence deletion/shredding, and tamper alert overrides) require verified TOTP multi-factor authentication.

---

## 2. Policy Matrix

### 2.1 Role Definitions & Hierarchy

| Role | Description | Default Clearance Level | Permitted Operations |
| :--- | :--- | :--- | :--- |
| `super_admin` | System administrator | Level 5 (Top Secret) | User management, case provisioning, health checks, key rotation. No direct case evidence reading unless explicitly assigned. |
| `judge` | Presiding judicial officer | Level 4 (Secret) | Read all case evidence in assigned courtroom cases, verify Merkle proofs, export BSA §63 certificates, view complete audit logs. |
| `prosecutor` | State public prosecutor | Level 3 (Confidential) | Query evidence in assigned prosecution briefs, verify integrity, review witness statements and forensic reports. |
| `investigating_officer` | Lead police investigator | Level 2 (Restricted) | Ingest new physical/digital evidence, generate FIRs, query assigned case files, request forensic review. |
| `forensic_analyst` | Forensic laboratory examiner | Level 3 (Confidential) | Ingest technical artifacts (CFSL ballistics, digital extractions), run integrity audits, attach technical annexures. |

---

## 3. Attribute Taxonomy

### 3.1 Subject Attributes ($S$)
- `s.user_id` ($str$): Unique identifier of the authenticated user.
- `s.role` ($str$): One of `super_admin`, `judge`, `prosecutor`, `investigating_officer`, `forensic_analyst`.
- `s.clearance_level` ($int \in [1..5]$): Numeric security clearance ceiling.
- `s.mfa_verified` ($bool$): Whether current session completed TOTP MFA challenge.
- `s.assigned_cases` ($set[str]$): Set of case identifiers actively assigned to the subject (queried live from SQL `assignments` table).

### 3.2 Resource / Object Attributes ($R$)
- `r.doc_id` ($uuid$): Unique identifier of the document.
- `r.case_id` ($str$): Identifier of the case owning the document.
- `r.classification_level` ($int \in [1..5]$): Required clearance ceiling to view the document.
- `r.is_shredded` ($bool$): Cryptographically destroyed indicator.
- `r.is_tampered` ($bool$): Flagged by Tier 1-4 integrity verifiers.

### 3.3 Action Attributes ($A$)
- `a.action_type` ($enum$): `INGEST`, `READ`, `QUERY`, `VERIFY`, `EXPORT`, `SHRED`, `ADMIN`.

---

## 4. Formal Evaluation Logic

An access request $\mathcal{T} = \langle S, R, A, E \rangle$ is granted ($\mathcal{D} = \text{ALLOW}$) if and only if all of the following predicates hold:

$$\text{Allow} \iff \mathcal{P}_{\text{auth}} \land \mathcal{P}_{\text{shred}} \land \mathcal{P}_{\text{tamper}} \land \mathcal{P}_{\text{case}} \land \mathcal{P}_{\text{clearance}} \land \mathcal{P}_{\text{mfa}}$$

1. **Authentication Guard**:
   $$\mathcal{P}_{\text{auth}} \equiv S.\text{user\_id} \neq \emptyset$$
2. **Cryptographic Shredding Guard**:
   $$\mathcal{P}_{\text{shred}} \equiv \neg (R.\text{is\_shredded} \land A.\text{action\_type} \in \{\text{READ}, \text{QUERY}, \text{EXPORT}\})$$
3. **Tamper Containment Guard**:
   $$\mathcal{P}_{\text{tamper}} \equiv \neg (R.\text{is\_tampered} \land A.\text{action\_type} \in \{\text{READ}, \text{QUERY}, \text{EXPORT}\})$$
4. **Active Case Scoping (Rule C8)**:
   $$\mathcal{P}_{\text{case}} \equiv (R.\text{case\_id} \in S.\text{assigned\_cases}) \lor (S.\text{role} = \text{super\_admin} \land A.\text{action\_type} = \text{ADMIN})$$
5. **Clearance Ceiling Comparison**:
   $$\mathcal{P}_{\text{clearance}} \equiv S.\text{clearance\_level} \ge R.\text{classification\_level}$$
6. **MFA Requirement for Sensitive Operations**:
   $$\mathcal{P}_{\text{mfa}} \equiv (A.\text{action\_type} \in \{\text{EXPORT}, \text{SHRED}\} \implies S.\text{mfa\_verified} = \text{true})$$

---

## 5. Rego Implementation Snippet

```rego
package sdms.abac

default allow = false

# Allow query/read if user assigned to case, clearance matches, doc not shredded/tampered
allow {
    input.subject.user_id
    not input.resource.is_shredded
    not input.resource.is_tampered
    input.subject.clearance_level >= input.resource.classification_level
    input.subject.assigned_cases[_] == input.resource.case_id
    valid_action(input.action.action_type)
}

# MFA validation for export and shredding
allow {
    input.action.action_type == "EXPORT"
    input.subject.mfa_verified == true
    input.subject.assigned_cases[_] == input.resource.case_id
    input.subject.clearance_level >= input.resource.classification_level
}

valid_action("READ")
valid_action("QUERY")
valid_action("VERIFY")
```

