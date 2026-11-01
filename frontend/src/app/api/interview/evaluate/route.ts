import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const QUESTIONS_MAP: Record<string, Array<{ question: string; keywords: string[]; modelAnswer: string }>> = {
  "ai engineer": [
    {
      question: "Explain the difference between LangChain standard linear chains and LangGraph cyclic state machines. When would you choose LangGraph?",
      keywords: ["cycle", "state", "agent", "memory", "graph", "loop", "dag"],
      modelAnswer: "Standard LangChain uses linear DAGs running from start to finish. LangGraph supports cyclical state machines with loops, branching, and conditional edges, enabling agents to self-correct, maintain state across steps, and execute complex multi-agent workflows."
    },
    {
      question: "How do you mitigate LLM hallucination and latency in a production RAG (Retrieval-Augmented Generation) pipeline?",
      keywords: ["reranking", "chunking", "embeddings", "vector", "cache", "context", "grounding"],
      modelAnswer: "To minimize hallucination: implement hybrid search (BM25 + vector embeddings), cross-encoder re-ranking (Cohere/BGE), and strict prompt grounding with citations. For latency: semantic caching with Redis, asynchronous tool execution, and lightweight routing models."
    },
    {
      question: "What metrics and frameworks (such as RAGAS) do you use to evaluate LLM responses in production?",
      keywords: ["ragas", "precision", "recall", "faithfulness", "latency", "cost", "eval"],
      modelAnswer: "I use evaluation frameworks like RAGAS focusing on Faithfulness, Answer Relevance, and Context Precision/Recall, alongside operational metrics like TTFT (Time to First Token), end-to-end latency, and token cost."
    }
  ],
  "full stack developer": [
    {
      question: "Explain how React Server Components (RSC) in Next.js App Router differ from Client Components, and how hydration works.",
      keywords: ["server", "client", "hydration", "bundle", "async", "render"],
      modelAnswer: "React Server Components (RSC) execute strictly on the server and stream zero JavaScript to the client, keeping bundles small. Client Components ('use client') run on the server for initial HTML, then hydrate in the browser to enable interactivity and React state."
    },
    {
      question: "How do you design a scalable RESTful API with FastAPI and optimize database queries to avoid N+1 issues in SQLAlchemy?",
      keywords: ["index", "async", "n+1", "eager", "join", "pagination", "session"],
      modelAnswer: "Design idempotent endpoints with standard status codes, Pydantic validation, and cursor pagination. In SQLAlchemy, optimize queries using indexed foreign keys, eager loading (selectinload/joinedload) to eliminate N+1 queries, and connection pooling."
    },
    {
      question: "How do you secure JWT authentication in production against XSS and CSRF attacks?",
      keywords: ["cookie", "httponly", "samesite", "csrf", "xss", "refresh", "expiry"],
      modelAnswer: "Store short-lived JWT access tokens in memory or secure HttpOnly, SameSite=Strict cookies to prevent JavaScript access (neutralizing XSS). Use rotating refresh tokens stored in secure database sessions and validate CSRF tokens for state-changing requests."
    }
  ],
  "backend developer": [
    {
      question: "How do you handle database concurrency, race conditions, and transactions in high-throughput applications?",
      keywords: ["transaction", "acid", "lock", "optimistic", "pessimistic", "isolation", "atomic"],
      modelAnswer: "Ensure ACID compliance using database transactions. For low contention, use Optimistic Locking with version columns; for critical balance updates, use Pessimistic Locking (SELECT FOR UPDATE) or distributed locks via Redis (Redlock)."
    },
    {
      question: "Explain how you would architect an asynchronous background job processing system with FastAPI, Celery, and Redis.",
      keywords: ["celery", "worker", "queue", "redis", "async", "broker", "retry"],
      modelAnswer: "Offload long-running tasks by publishing tasks to Redis as the message broker. Independent Celery workers consume tasks from the queue with exponential backoff retries, dead-letter queues, and idempotency keys to prevent duplicate runs."
    },
    {
      question: "How do you optimize API response times, latency, and web vitals for distributed microservices?",
      keywords: ["cache", "redis", "cdn", "gzip", "pooling", "async", "latency"],
      modelAnswer: "Implement tiered caching (Redis for hot data, CDN for static content), asynchronous I/O with connection pooling, gzip/brotli compression, database indexing, and distributed tracing with OpenTelemetry."
    }
  ]
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const roleKey = (body.role || "").toLowerCase().trim();
    const questions = QUESTIONS_MAP[roleKey] || QUESTIONS_MAP["full stack developer"];
    const idx = Math.min(body.question_index || 0, questions.length - 1);
    const qData = questions[idx];

    const answer = (body.user_answer || "").toLowerCase();
    const matched = qData.keywords.filter((kw) => answer.includes(kw));
    const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;

    let score = 42;
    if (wordCount > 30) score += 20;
    else if (wordCount > 15) score += 10;

    const kwBonus = Math.min(matched.length * 10, 36);
    score = Math.min(score + kwBonus, 96);

    const strengths: string[] = [];
    const improvements: string[] = [];

    if (matched.length >= 2) {
      strengths.push(`Strong understanding of core concepts (${matched.slice(0, 3).join(", ")}).`);
    }
    if (wordCount > 25) {
      strengths.push("Well-structured answer with sufficient context.");
    } else {
      improvements.push("Answer is brief; elaborate more on system trade-offs and edge cases.");
    }

    if (matched.length < 2) {
      improvements.push(`Consider mentioning key concepts: ${qData.keywords.slice(0, 3).join(", ")}.`);
    }

    const isComplete = idx >= questions.length - 1;
    const nextQ = isComplete ? null : questions[idx + 1].question;

    return NextResponse.json({
      score,
      strengths: strengths.length ? strengths : ["Good initial attempt touching relevant principles."],
      improvements: improvements.length ? improvements : ["Add quantifiable production examples or metrics."],
      model_answer: qData.modelAnswer,
      is_complete: isComplete,
      next_index: isComplete ? null : idx + 1,
      next_question: nextQ
    });
  } catch {
    return NextResponse.json({ detail: "Evaluation failed" }, { status: 500 });
  }
}
