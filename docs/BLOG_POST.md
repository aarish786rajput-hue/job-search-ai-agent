# Building CareerOrbit: Orchestrating Autonomous Career Agents with LangGraph & Next.js

*By the CareerOrbit Engineering Team*  
*Track B: Advanced Dual-Track Engineering Capstone*

---

## 1. Introduction

The modern hiring ecosystem is fundamentally asymmetric. Job seekers apply blindly to hundreds of portals, navigating opaque Applicant Tracking Systems (ATS), differing regional salary standards, and grueling multi-stage technical interviews. On the hiring side, recruiters are overwhelmed by generic resumes that fail to articulate true candidate capabilities.

**CareerOrbit** was engineered to solve this asymmetry. It is an agentic, production-grade career platform that unites cyclic multi-agent workflows, real-time developer portfolio intelligence, voice-driven mock technical screening, and strict candidate data privacy into a cohesive HR-Tech ecosystem.

---

## 2. Architectural Philosophy: Why Cyclic Graphs Over Linear Chains?

Traditional LLM workflows rely on linear Directed Acyclic Graphs (DAGs) or simple sequential chains (e.g., standard LangChain chains). While sufficient for basic prompt-and-response interactions, career advisory is inherently non-linear and iterative:

- A resume analysis might reveal a skill deficiency that triggers a targeted job search query.
- A job search might identify salary discrepancies requiring dynamic benchmarking against Indian metro and tier-2 compensation indices.
- An interview answer requires conversational turn-taking, progressive difficulty adjustment, and multi-dimensional scoring against the STAR (Situation, Task, Action, Result) rubric.

```
       +---------------------------------------------+
       |             User Career Query               |
       +---------------------------------------------+
                              |
                              v
                   [ LangGraph Agent Node ] <--------+
                              |                      |
            +-----------------+-----------------+    |
            |                 |                 |    |
            v                 v                 v    |
    (Career APIs)      (Resume Parser)   (Mock Interv)
            |                 |                 |    |
            +-----------------+-----------------+    |
                              |                      |
                     [ State Evaluator ]             |
                              |                      |
                 Is Goal Satisfied? -- (No) ---------+
                              |
                            (Yes)
                              v
                  [ Final Output / UI State ]
```

By leveraging **LangGraph**, CareerOrbit models agent behavior as a cyclic state machine. The agent evaluates intermediate state snapshots, makes autonomous routing decisions via conditional edges, and re-prompts tools until all prerequisite career data has been gathered.

---

## 3. Core Microservices & Functional Capabilities

### A. Real-Time Developer Portfolio Intelligence
Static PDF resumes rarely capture a candidate's actual engineering cadence. CareerOrbit integrates directly with the **GitHub REST API**, analyzing:
- Language distribution and polyglot versatility.
- Top-starred repositories and technical documentation quality.
- Code commit frequency and architectural structure.

### B. Indian HR-Tech Contextualization
Global hiring platforms frequently miscalculate Indian compensation structures. CareerOrbit natively incorporates:
- **Lakhs Per Annum (LPA)** CTC parsing and real-time in-hand monthly take-home estimations.
- **Location Multipliers:** Bengaluru, Mumbai, and Delhi-NCR vs. Tier-2 emerging hubs (Pune, Hyderabad, Jaipur).
- **Notice Period Handling:** 15, 30, 60, and 90-day availability filters reflecting Indian IT industry standards.

### C. Voice-Enabled Technical Interview Simulation
Candidate preparation transitions from passive reading to active practice through a full-duplex voice interface powered by the Web Speech API and backend evaluation heuristics:
- Real-time speech-to-text input with confidence tracking.
- Dynamic follow-up generation tailored to prior answers.
- Automated evaluation scoring across technical depth, communication clarity, confidence, and STAR relevance.

---

## 4. Privacy Engineering: GDPR & Indian DPDP Act 2023

In HR-Tech, candidate resumes and interview evaluations represent sensitive personal data. CareerOrbit was architected from inception to adhere strictly to global data protection standards:

1. **Right to Data Portability (GDPR Art. 20):** Candidates can trigger an on-demand, structured JSON export of their profile, applications, alerts, and interview transcripts.
2. **Right to Erasure (GDPR Art. 17 & DPDP Act 2023):** With a single confirmation, candidates can permanently purge all stored credentials, resume records, and historical scores through database cascade deletion.
3. **Defense-in-Depth Security:** Passwords hashed using PBKDF2 with SHA-256 and unique salts; Bearer JWT tokens with automated expiration; and zero hardcoded secret credentials.

---

## 5. Performance Telemetry & Benchmarks

Operating at the intersection of streaming audio and agentic tool dispatch demands rigorous latency management:
- **ATS Resume Parsing:** $\approx 42\text{ ms}$ processing time.
- **Multi-API Fallback Routing:** Sub-120 ms query resolution under simulated external API rate limiting.
- **Microservices Telemetry:** Custom `X-Process-Time-Ms` middleware providing live performance observability.

---

## 6. Conclusion & Future Outlook

CareerOrbit demonstrates that agentic AI can transcend conversational novelty to deliver deterministic, high-utility, and privacy-respecting career infrastructure. By synthesizing LangGraph state machines, localized compensation models, and voice simulation, it bridges the gap between candidates and their ideal engineering careers.
