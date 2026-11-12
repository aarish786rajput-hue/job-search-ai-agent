# CareerOrbit — REST API Documentation

*Base URL:* `http://localhost:8000` (Local Development) / `https://careerorbit-api.vercel.app` (Production)  
*Authentication:* Bearer Token (`Authorization: Bearer <JWT_TOKEN>`)

---

## 1. Authentication & Privacy Microservice (`/api/auth`)

### `POST /api/auth/register`
Creates a new candidate account.
- **Request Body:**
  ```json
  {
    "email": "developer@example.com",
    "password": "SecurePassword123!",
    "full_name": "Arjun Sharma"
  }
  ```
- **Response:** `201 Created` with user ID, email, and authentication token.

### `POST /api/auth/login`
Authenticates credentials and issues a signed JWT token.
- **Request Body:** `username`, `password` (form-data or JSON).
- **Response:**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer",
    "user": { "id": 1, "email": "developer@example.com", "name": "Arjun Sharma" }
  }
  ```

### `GET /api/auth/export-data` *(GDPR Article 20 Compliance)*
Exports the complete candidate personal data dossier in machine-readable JSON format.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `200 OK` with JSON export containing profile, applications, alerts, and interview records.

### `DELETE /api/auth/delete-account` *(GDPR Article 17 Right to Erasure)*
Irrevocably deletes candidate account and cascades deletion across all related records.
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{"message": "Account and all associated candidate records permanently deleted."}`

---

## 2. Job Search & Aggregation Microservice (`/api/jobs`)

### `GET /api/jobs`
Searches curated and live aggregated job postings across Indian tech hubs.
- **Query Parameters:**
  - `query` (str): Search term (e.g., `"Python Developer"`)
  - `location` (str): Metro/tier-2 city (e.g., `"Bengaluru"`, `"Remote"`)
  - `experience` (str): Experience level (e.g., `"0-2 years"`, `"3-5 years"`)
  - `min_salary` (float): Minimum LPA threshold
- **Response:** Array of job objects with title, company, location, salary LPA, and tags.

### `GET /api/jobs/alerts`
Fetches all configured job alert notification rules for the authenticated candidate.

### `POST /api/jobs/alerts`
Creates an active job alert notification monitor.
- **Request Body:**
  ```json
  {
    "keyword": "AI Engineer",
    "location": "Bengaluru",
    "min_salary": "18 LPA",
    "work_mode": "Hybrid",
    "channel": "Email & SMS"
  }
  ```

---

## 3. Resume Optimization & ATS Engine (`/api/resume`)

### `POST /api/resume/parse`
Parses PDF or raw resume text and calculates an ATS compatibility score against a job description.
- **Payload:** Multipart form with file or JSON text.
- **Response:**
  ```json
  {
    "ats_score": 85,
    "matched_skills": ["Python", "FastAPI", "Docker", "SQLAlchemy"],
    "missing_skills": ["Kubernetes", "Redis"],
    "strengths": ["Quantified bullet points", "Clear technical stack"],
    "improvements": ["Incorporate more action-oriented impact metrics"]
  }
  ```

### `POST /api/resume/tailor`
Generates a role-tailored resume summary and customized LinkedIn outreach pitch.
- **Request Body:** `{"resume_text": "...", "target_role": "Full Stack Engineer", "job_description": "..."}`
- **Response:** `{"tailored_summary": "...", "linkedin_pitch": "...", "suggested_bullets": [...]}`

---

## 4. AI Mock Interview & Audio Simulation (`/api/interview`)

### `POST /api/interview/start`
Initializes a multi-track technical or behavioral screening session.
- **Request Body:** `{"domain": "Full Stack", "difficulty": "Intermediate"}`
- **Response:** First interview question and evaluation rubric parameters.

### `POST /api/interview/evaluate`
Evaluates a candidate's transcribed spoken answer against industry benchmarks.
- **Request Body:**
  ```json
  {
    "question": "Explain how you handle database connection pooling in high-concurrency systems.",
    "user_answer": "In FastAPI with SQLAlchemy, I use async engine with QueuePool...",
    "domain": "Full Stack"
  }
  ```
- **Response:**
  ```json
  {
    "score": 92,
    "technical_depth": 90,
    "clarity": 95,
    "confidence": 90,
    "feedback": "Excellent technical accuracy explaining QueuePool parameters.",
    "ideal_answer": "...",
    "star_analysis": { "situation": true, "task": true, "action": true, "result": true }
  }
  ```

### `GET /api/interview/history`
Retrieves past interview evaluation scores, radar breakdown, and historical progress.

---

## 5. Agentic Orchestration & Specialized Tools (`/api/agent`)

### `POST /api/agent/query`
Dispatches candidate queries to the cyclic LangGraph autonomous agent.
- **Request Body:** `{"message": "Find AI Engineer roles in Bengaluru above 20 LPA and check my resume match."}`
- **Response:** Synthesized agent response with dynamic tool execution artifacts.

### `POST /api/agent/github-portfolio`
Aggregates live repositories, languages, and commit cadence for developer portfolio analysis.
- **Request Body:** `{"username": "torvalds"}`
- **Response:**
  ```json
  {
    "username": "torvalds",
    "name": "Linus Torvalds",
    "public_repos": 7,
    "languages": ["C", "Shell", "Assembly"],
    "ats_recommendation": "Strong systems programming evidence; highlight specific kernel contributions."
  }
  ```

---

## 6. Observability & Telemetry (`/api/metrics`)

### `GET /api/metrics`
Reports production telemetry and health status.
- **Response:**
  ```json
  {
    "status": "healthy",
    "service": "CareerOrbit Core API",
    "uptime_seconds": 12840,
    "total_requests": 4820,
    "average_latency_ms": 18.4
  }
  ```
