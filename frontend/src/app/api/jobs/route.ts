import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MOCK_JOBS = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Tech Solutions",
    location: "Bengaluru",
    salary: "10-15 LPA",
    experience: "2-4 Years",
    description: "React, Next.js, Tailwind CSS, TypeScript"
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "InnovateX",
    location: "Mumbai",
    salary: "12-18 LPA",
    experience: "3-5 Years",
    description: "Python, FastAPI, PostgreSQL, REST APIs"
  },
  {
    id: 3,
    title: "AI Engineer",
    company: "AI Labs",
    location: "Bengaluru",
    salary: "20-30 LPA",
    experience: "4-6 Years",
    description: "LangChain, LangGraph, LLMs, RAG pipelines"
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "DataCorp",
    location: "Pune",
    salary: "15-22 LPA",
    experience: "3-5 Years",
    description: "Machine Learning, Python, SQL, Pandas, Scikit-learn"
  },
  {
    id: 5,
    title: "Junior Developer",
    company: "StartUp Inc",
    location: "Delhi",
    salary: "6-9 LPA",
    experience: "Fresher",
    description: "JavaScript, HTML, CSS, Git basics"
  },
  {
    id: 6,
    title: "DevOps Engineer",
    company: "CloudBase",
    location: "Hyderabad",
    salary: "18-25 LPA",
    experience: "3-5 Years",
    description: "Docker, Kubernetes, CI/CD, AWS/GCP"
  },
  {
    id: 7,
    title: "Full Stack Developer",
    company: "WebCraft",
    location: "Bengaluru",
    salary: "14-20 LPA",
    experience: "2-4 Years",
    description: "React, Node.js, MongoDB, Express"
  },
  {
    id: 8,
    title: "ML Engineer",
    company: "NeuralNet Inc",
    location: "Mumbai",
    salary: "22-32 LPA",
    experience: "4-6 Years",
    description: "PyTorch, TensorFlow, MLOps, Model Deployment"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.toLowerCase();
  const location = searchParams.get("location")?.toLowerCase();
  const experience = searchParams.get("experience")?.toLowerCase();

  let results = MOCK_JOBS;

  if (title) {
    results = results.filter(
      (j) =>
        j.title.toLowerCase().includes(title) ||
        j.description.toLowerCase().includes(title)
    );
  }
  if (location) {
    results = results.filter((j) => j.location.toLowerCase().includes(location));
  }
  if (experience) {
    results = results.filter((j) =>
      j.experience.toLowerCase().includes(experience)
    );
  }

  return NextResponse.json(results);
}
