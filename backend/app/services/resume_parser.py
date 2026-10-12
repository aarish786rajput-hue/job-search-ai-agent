import re
import io
from typing import List, Dict, Any, Optional
from pypdf import PdfReader

# Comprehensive Indian Tech Market Skills Taxonomy
KNOWN_SKILLS = [
    # Frontend
    "react", "next.js", "nextjs", "vue", "angular", "typescript", "javascript",
    "html", "html5", "css", "css3", "tailwind", "tailwind css", "redux", "sass",
    # Backend
    "python", "fastapi", "django", "flask", "node.js", "nodejs", "express",
    "java", "spring boot", "c++", "c#", ".net", "golang", "php", "ruby",
    # AI / Data / ML
    "langchain", "langgraph", "llm", "rag", "pytorch", "tensorflow", "keras",
    "machine learning", "deep learning", "nlp", "scikit-learn", "pandas",
    "numpy", "opencv", "data science", "prompt engineering",
    # Database
    "sql", "postgresql", "mysql", "mongodb", "sqlite", "redis", "cassandra",
    # Cloud & DevOps
    "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "git", "github",
    "linux", "terraform", "jenkins",
    # Testing & Tools
    "jest", "cypress", "postman", "rest api", "graphql", "jira", "agile"
]

SECTION_KEYWORDS = {
    "experience": ["experience", "work history", "employment", "internship", "professional experience"],
    "education": ["education", "academic", "b.tech", "btech", "degree", "university", "college", "school"],
    "skills": ["skills", "technical skills", "technologies", "proficiencies", "competencies"],
    "projects": ["projects", "personal projects", "academic projects", "key projects"],
    "summary": ["summary", "objective", "about me", "professional summary", "profile"]
}

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text from a PDF file."""
    reader = PdfReader(io.BytesIO(pdf_bytes))
    text_content = []
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text_content.append(extracted)
    return "\n".join(text_content)

def extract_email(text: str) -> Optional[str]:
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match.group(0) if match else None

def extract_phone(text: str) -> Optional[str]:
    # Match Indian phone numbers (+91, 10 digits, with optional spaces/hyphens)
    match = re.search(r'(?:\+?91[-.\s]?)?[6-9]\d{9}', text)
    return match.group(0) if match else None

def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    found_skills = set()
    for skill in KNOWN_SKILLS:
        # Match whole word or exact skill phrase
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Normalize casing for nice display
            found_skills.add(skill.title() if len(skill) > 4 else skill.upper())
    return sorted(list(found_skills))

def detect_sections(text: str) -> Dict[str, bool]:
    text_lower = text.lower()
    sections = {}
    for section_name, keywords in SECTION_KEYWORDS.items():
        sections[section_name] = any(kw in text_lower for kw in keywords)
    return sections

def calculate_ats_score(
    text: str,
    skills: List[str],
    sections: Dict[str, bool],
    has_email: bool,
    has_phone: bool
) -> Dict[str, Any]:
    score = 0
    feedback = []
    missing_recommendations = []

    # 1. Skills Assessment (Max 35 points)
    skill_count = len(skills)
    if skill_count >= 8:
        score += 35
        feedback.append("Strong technical skill presence detected.")
    elif skill_count >= 5:
        score += 25
        feedback.append("Good technical skills, consider adding 3-4 more relevant tools.")
    else:
        score += 15
        missing_recommendations.append("Add more specific technical keywords & frameworks to improve ATS ranking.")

    # 2. Key Sections Present (Max 30 points)
    present_sections = [sec for sec, found in sections.items() if found]
    section_score = int((len(present_sections) / len(SECTION_KEYWORDS)) * 30)
    score += section_score
    if len(present_sections) == len(SECTION_KEYWORDS):
        feedback.append("All essential resume sections are clearly structured.")
    else:
        missing = [sec.title() for sec, found in sections.items() if not found]
        missing_recommendations.append(f"Missing or unclear sections: {', '.join(missing)}.")

    # 3. Contact Information (Max 15 points)
    if has_email:
        score += 8
    else:
        missing_recommendations.append("Email address not found in header.")

    if has_phone:
        score += 7
    else:
        missing_recommendations.append("Phone number not clearly formatted.")

    # 4. Length & Formatting (Max 20 points)
    word_count = len(text.split())
    if 250 <= word_count <= 900:
        score += 20
        feedback.append(f"Optimal resume length ({word_count} words).")
    elif word_count < 250:
        score += 10
        missing_recommendations.append("Resume seems too brief. Elaborate on project achievements and impacts.")
    else:
        score += 12
        missing_recommendations.append("Resume exceeds 900 words. Try to keep it concise within 1-2 pages.")

    # Cap score between 0 and 100
    ats_score = min(max(score, 10), 98)

    rating = "Needs Improvement"
    if ats_score >= 80:
        rating = "Excellent / High ATS Match"
    elif ats_score >= 60:
        rating = "Good / Competitive"

    return {
        "ats_score": ats_score,
        "rating": rating,
        "strengths": feedback,
        "improvements": missing_recommendations,
        "word_count": word_count
    }

def analyze_resume_text(text: str) -> Dict[str, Any]:
    """Complete analysis of resume plain text."""
    email = extract_email(text)
    phone = extract_phone(text)
    skills = extract_skills(text)
    sections = detect_sections(text)
    ats_data = calculate_ats_score(text, skills, sections, bool(email), bool(phone))

    return {
        "email": email,
        "phone": phone,
        "skills": skills,
        "total_skills_found": len(skills),
        "sections_detected": sections,
        **ats_data
    }
