import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const QUESTIONS_MAP: Record<string, string[]> = {
  "ai engineer": [
    "Explain the difference between LangChain standard linear chains and LangGraph cyclic state machines. When would you choose LangGraph?",
    "How do you mitigate LLM hallucination and latency in a production RAG (Retrieval-Augmented Generation) pipeline?",
    "What metrics and frameworks (such as RAGAS) do you use to evaluate LLM responses in production?"
  ],
  "full stack developer": [
    "Explain how React Server Components (RSC) in Next.js App Router differ from Client Components, and how hydration works.",
    "How do you design a scalable RESTful API with FastAPI and optimize database queries to avoid N+1 issues in SQLAlchemy?",
    "How do you secure JWT authentication in production against XSS and CSRF attacks?"
  ],
  "backend developer": [
    "How do you handle database concurrency, race conditions, and transactions in high-throughput applications?",
    "Explain how you would architect an asynchronous background job processing system with FastAPI, Celery, and Redis.",
    "How do you optimize API response times, latency, and web vitals for distributed microservices?"
  ]
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const roleKey = (body.role || "").toLowerCase().trim();
    const questions = QUESTIONS_MAP[roleKey] || QUESTIONS_MAP["full stack developer"];

    return NextResponse.json({
      session_id: `mock-${Date.now()}`,
      role: body.role || "Full Stack Developer",
      difficulty: body.difficulty || "Mid-Level",
      total_questions: questions.length,
      current_index: 0,
      question: questions[0]
    });
  } catch {
    return NextResponse.json({ detail: "Failed to initialize interview" }, { status: 500 });
  }
}
