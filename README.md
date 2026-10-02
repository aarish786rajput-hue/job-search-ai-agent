# Job Search AI Agent - Track B (Advanced)

This project is part of the Capabl AI Agent Development Project, following the Advanced Track (Track B).

## Architecture
- **Frontend**: React/Next.js + Tailwind CSS
- **Backend**: FastAPI + LangGraph + Celery
- **Databases**: PostgreSQL (User/Job Data), Redis (Caching/Sessions)

## Setup Instructions

### Backend Setup (FastAPI)
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI server:
   ```bash
   python main.py
   ```
   (Server will run at http://localhost:8000)

### Frontend Setup (Next.js)
1. Open a separate terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   (Server will run at http://localhost:3000)
