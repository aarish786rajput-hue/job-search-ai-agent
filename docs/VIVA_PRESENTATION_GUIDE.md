# CareerOrbit — Viva Defense Guide & Final Demo Presentation

*Project Title:* CareerOrbit: Autonomous AI Career Assistant & Interview Preparation Platform  
*Track:* Track B (Advanced HR-Tech Engineering)  
*Dual-Track Duration:* 8 Weeks

---

## 1. 8–10 Minute Live Demonstration Script

### Act 1: The Problem & Live Job Search (0:00 – 2:00)
- **Speaker:** *"Good morning, respected examiners. Today we present **CareerOrbit**, an autonomous AI platform engineered to solve the information asymmetry in tech recruitment."*
- **Action:** Open Homepage. Demonstrate instant search filtering for **AI Engineer** roles in **Bengaluru** and **Remote**.
- **Key Talking Point:** Point out Indian HR-Tech specific customizations: **Lakhs Per Annum (LPA)** compensation formatting, **Notice Period** filters (Immediate, 30, 60, 90 days), and Metro vs. Tier-2 city sorting.

### Act 2: ATS Resume Optimization & Role Tailoring (2:00 – 4:00)
- **Action:** Navigate to Resume Analyzer. Upload a technical resume or paste text against an active job description.
- **Result:** Show the instant ATS compatibility score (e.g., 85/100), matched keywords, and detected skill deficiencies.
- **Action:** Click **"Generate Tailored Pitch"** to showcase the 1-click tailored resume summary and customized LinkedIn recruiter outreach note.

### Act 3: Voice-Enabled AI Mock Technical Screening (4:00 – 6:30)
- **Action:** Navigate to the `/interview` portal. Select the **Full Stack / AI Engineering** track.
- **Action:** Turn on the microphone and answer a technical question via Web Speech audio synthesis.
- **Result:** Demonstrate the automated evaluation report:
  - Technical Depth, Clarity, and Confidence metrics.
  - STAR methodology rubric compliance.
  - Model answer comparison.
  - Calendar integration (.ics download and Google Calendar scheduling).

### Act 4: GitHub Developer Portfolio & Visual Analytics (6:30 – 8:00)
- **Action:** Go to the Profile page (`/profile?tab=analytics`).
- **Showcase:**
  - **Live GitHub Portfolio Analysis:** Show how entering a GitHub handle extracts featured repositories, language breakdown, and ATS portfolio recommendations.
  - **Visual Analytics Dashboard:** Show the 4-stage Application Pipeline Funnel and conversion velocity.

### Act 5: Candidate Data Privacy & Compliance (8:00 – 9:00)
- **Action:** Scroll to the GDPR / DPDP Compliance section on the Profile page.
- **Showcase:**
  - Demonstrate **Data Portability (GDPR Art. 20)**: Download structured JSON export.
  - Demonstrate **Right to Erasure (GDPR Art. 17 & DPDP Act 2023)**: Explain the database cascade deletion safeguards.

---

## 2. Examiners Viva Defense Q&A

### Q1: Why did you choose LangGraph instead of standard sequential chains?
* **Answer:** *"Standard linear chains force rigid execution paths. Career advisory is inherently cyclic—a resume analysis reveals missing skills, prompting a specialized job search, which in turn leads to localized salary benchmarking and interview prep. LangGraph provides a cyclic state machine where nodes execute specialized tools, and conditional edges autonomously route between research, parsing, and coaching until all user goals are satisfied."*

### Q2: How does CareerOrbit address the specific needs of the Indian job market?
* **Answer:** *"Most global platforms misrepresent Indian tech hiring. CareerOrbit natively incorporates: (1) LPA currency standards with estimated monthly in-hand take-home breakdowns; (2) City cost-of-living tiers comparing Bengaluru/Mumbai with Pune/Hyderabad; and (3) The standard Indian notice period constraints (30/60/90 days), which are primary screening filters for Indian IT recruiters."*

### Q3: How do you handle third-party career API rate limits or failures?
* **Answer:** *"We engineered a resilient multi-tier fallback strategy inside `career_apis.py`. When an upstream API (such as external job aggregators or GitHub API) encounters rate limiting or network timeout, the platform gracefully switches to secondary cached repositories and synthetic fallback engines with zero user disruption."*

### Q4: How is candidate privacy protected under global and Indian regulations?
* **Answer:** *"We strictly implemented GDPR Article 20 for data portability via `/api/auth/export-data` and GDPR Article 17 / Indian DPDP Act 2023 for the Right to Erasure via `/api/auth/delete-account`. Passwords use PBKDF2 with SHA-256 salts, API communications use stateless Bearer JWT tokens, and transient audio during mock interviews is analyzed in-memory without persistent recording."*

### Q5: What is your test coverage and performance benchmark?
* **Answer:** *"Our automated test suite (`test_career_platform.py`) passes 13/13 unit tests in under 0.1 seconds. Response latencies across endpoints average sub-50ms, with telemetry observability logged through custom `X-Process-Time-Ms` middleware and `/api/metrics`."*
