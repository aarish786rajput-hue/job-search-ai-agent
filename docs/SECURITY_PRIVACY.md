# CareerOrbit — Security & Data Privacy Compliance

*Compliance Framework: European General Data Protection Regulation (GDPR) & Indian Digital Personal Data Protection (DPDP) Act 2023*

---

## 1. Compliance Architecture Overview

CareerOrbit processes personal candidate data including contact information, employment histories, skills, and audio interview transcripts. Data privacy and user autonomy are core architectural pillars rather than retrospective additions.

This document details the technical controls implemented to ensure rigorous alignment with **GDPR** and the **Indian DPDP Act 2023**.

---

## 2. GDPR & DPDP Act Core Principles Alignment

### A. Right to Data Portability (GDPR Article 20)
* **Requirement:** Data subjects must have the right to receive personal data concerning them in a structured, commonly used, and machine-readable format.
* **Implementation:** 
  - Authenticated endpoint: `GET /api/auth/export-data`
  - Returns a unified JSON bundle containing:
    - Candidate account profile and email
    - Registered career preferences and salary targets
    - Tracked job application history and stage statuses
    - Custom job alert rules
    - Complete mock interview evaluation logs and scores

### B. Right to Erasure / Right to be Forgotten (GDPR Article 17 & DPDP Act 2023)
* **Requirement:** Individuals may demand permanent deletion of their personal data without undue delay.
* **Implementation:**
  - Authenticated endpoint: `DELETE /api/auth/delete-account`
  - Executes a cascade purge across relational database tables:
    - Removes `User` record
    - Cascades deletion to `JobApplication` entries
    - Purges all active `JobAlert` notifications
    - Deletes all `MockInterview` scores and audio feedback records
    - Invalidates all active JWT session tokens

### C. Purpose Limitation & Data Minimization
* Only career-relevant data is gathered.
* Audio recorded during mock interviews is processed strictly in-memory for evaluation feedback and discarded; raw biometric audio files are never persisted on disk or transmitted to third parties without consent.

---

## 3. Cryptographic & Application Security Controls

| Security Domain | Technical Implementation |
| :--- | :--- |
| **Password Storage** | PBKDF2 with SHA-256 HMAC, salted per-user, 100,000 hashing iterations |
| **Session Management** | Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 and automated 24-hour expiration |
| **API Authorization** | Bearer Token dependency injection (`get_current_user`) on all sensitive routes |
| **Transport Layer** | TLS 1.3 encryption in transit for production deployments |
| **SQL Injection Defense** | Parameterized queries enforced across all database interactions via SQLAlchemy ORM |
| **CORS Policy** | Strict origin validation restricting cross-site unauthorized credential leakage |

---

## 4. Candidate Privacy Controls in UI

CareerOrbit provides immediate privacy self-service controls in the user profile interface (`/profile?tab=analytics`):
1. **One-Click Data Export:** Direct file download triggering structured JSON generation.
2. **Account & Record Purge:** Red-flagged confirmation modal preventing accidental data erasure while providing full autonomous account deletion.
