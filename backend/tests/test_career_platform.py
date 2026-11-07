import unittest
import sys
import os

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.career_apis import (
    fetch_live_jobs_with_fallback,
    fetch_company_intelligence_with_fallback,
    analyze_github_developer_profile,
    calculate_realtime_salary_benchmark,
    generate_tailored_resume_and_linkedin
)
from app.agent.career_agent import run_career_agent
from app.services.resume_parser import extract_skills, calculate_ats_score, detect_sections
from app.api.interview import INTERVIEW_QUESTIONS


class TestCareerAPIs(unittest.TestCase):
    """Test 5+ career APIs with fallback strategies"""

    def test_live_jobs_fallback(self):
        result = fetch_live_jobs_with_fallback(role="AI Engineer", location="Bengaluru")
        self.assertEqual(result["status"], "success")
        self.assertIn("jobs", result)
        self.assertGreater(len(result["jobs"]), 0)
        first_job = result["jobs"][0]
        self.assertIn("title", first_job)
        self.assertIn("salary", first_job)
        self.assertIn("location", first_job)

    def test_company_intelligence_known_company(self):
        result = fetch_company_intelligence_with_fallback("Google")
        self.assertEqual(result["status"], "success")
        company = result["company"]
        self.assertIn("Google", company["name"])
        self.assertGreaterEqual(company["rating"], 4.0)
        self.assertIn("notice_period", company)
        self.assertIn("tech_stack", company)

    def test_company_intelligence_fallback_for_unknown(self):
        result = fetch_company_intelligence_with_fallback("UnknownFutureStartup123")
        self.assertEqual(result["status"], "success")
        company = result["company"]
        self.assertIn("Unknownfuturestartup123", company["name"])
        self.assertIn("salary_range", company)

    def test_github_developer_profile(self):
        result = analyze_github_developer_profile("torvalds")
        self.assertEqual(result["status"], "success")
        self.assertIn("portfolio_score", result)
        self.assertGreaterEqual(result["portfolio_score"], 50)
        self.assertIn("detected_languages", result)
        self.assertIn("featured_repos", result)

    def test_salary_benchmark_metro_vs_tier2(self):
        metro = calculate_realtime_salary_benchmark(role="AI Engineer", location="Bengaluru")
        tier2 = calculate_realtime_salary_benchmark(role="AI Engineer", location="Indore")
        self.assertEqual(metro["status"], "success")
        self.assertEqual(tier2["status"], "success")
        self.assertIn("Tier-1", metro["location_tier"])
        self.assertIn("Tier-2", tier2["location_tier"])
        self.assertIn("LPA", metro["bands"]["mid_level"])
        self.assertIn("estimated_in_hand_monthly_mid", metro)

    def test_tailored_resume_and_linkedin(self):
        text = "Experienced in Python, FastAPI, Docker, and React. Built scalable microservices."
        result = generate_tailored_resume_and_linkedin(text, target_job_title="Senior AI Engineer", target_company="Razorpay")
        self.assertEqual(result["status"], "success")
        self.assertIn("Senior AI Engineer", result["tailored_headline"])
        self.assertIn("Razorpay", result["tailored_bullet_points"][1])
        self.assertGreater(len(result["tailored_bullet_points"]), 1)


class TestLangGraphCareerAgent(unittest.TestCase):
    """Test LangGraph StateGraph agent and multi-tool orchestration"""

    def test_agent_intent_jobs(self):
        res = run_career_agent(query="Find me Python jobs in Bengaluru")
        self.assertEqual(res["intent"], "jobs")
        self.assertIsNotNone(res["reply"])

    def test_agent_intent_company(self):
        res = run_career_agent(query="Tell me about Flipkart culture and work life balance")
        self.assertEqual(res["intent"], "company")
        self.assertIn("Flipkart", res["reply"])

    def test_agent_intent_salary(self):
        res = run_career_agent(query="What is the average salary package for AI Engineer in LPA?")
        self.assertEqual(res["intent"], "salary")
        self.assertIn("Salary Insights", res["reply"])


class TestResumeParserAndATS(unittest.TestCase):
    """Test ATS parsing, Indian tech skill taxonomy, and scoring algorithm"""

    def test_skill_extraction(self):
        sample = "Proficient in Python, FastAPI, React, Next.js, Docker, Kubernetes, PostgreSQL, Git"
        skills = extract_skills(sample)
        self.assertIn("Python", skills)
        self.assertIn("Fastapi", [s.title() for s in skills])
        self.assertIn("React", skills)
        self.assertGreaterEqual(len(skills), 5)

    def test_ats_score_calculation(self):
        sample = "Skills: Python, React, FastAPI, Docker. Experience: 3 years building web apps. Education: B.Tech Computer Science."
        skills = extract_skills(sample)
        sections = detect_sections(sample)
        res = calculate_ats_score(sample, skills, sections, has_email=True, has_phone=True)
        self.assertGreater(res["ats_score"], 40)
        self.assertIn("rating", res)


class TestInterviewAndNegotiation(unittest.TestCase):
    """Test mock interview question banks and salary negotiation logic"""

    def test_interview_question_banks(self):
        self.assertIn("ai engineer", INTERVIEW_QUESTIONS)
        self.assertIn("full stack developer", INTERVIEW_QUESTIONS)
        self.assertIn("backend developer", INTERVIEW_QUESTIONS)
        self.assertGreaterEqual(len(INTERVIEW_QUESTIONS["ai engineer"]), 3)

    def test_salary_negotiation_in_hand_calculation(self):
        from app.api.interview import salary_negotiation_assistant, NegotiationRequest
        req = NegotiationRequest(company="Swiggy", role="AI Engineer", offered_lpa=18.0, target_lpa=24.0, notice_period_days=30)
        res = salary_negotiation_assistant(req)
        self.assertEqual(res["offered_lpa"], 18.0)
        self.assertEqual(res["target_lpa"], 24.0)
        self.assertEqual(res["difference_lpa"], 6.0)
        self.assertIn("month", res["estimated_in_hand_monthly_target"])
        self.assertIn("Swiggy", res["email_draft"])


if __name__ == "__main__":
    unittest.main()
