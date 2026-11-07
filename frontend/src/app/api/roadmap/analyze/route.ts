import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ROADMAPS: Record<string, {
  requiredSkills: string[];
  roadmap: Array<{ week: string; focus: string; project: string }>;
}> = {
  "ai engineer": {
    requiredSkills: ["Python", "LangChain", "LangGraph", "Vector Databases", "Embeddings", "RAG Pipelines", "Docker", "FastAPI"],
    roadmap: [
      { week: "Phase 1: State Machines & Core Agents", focus: "Cyclic state graphs with LangGraph, state schemas, and conditional branching.", project: "Build an autonomous agent with short-term state and memory." },
      { week: "Phase 2: Enterprise RAG Architecture", focus: "Hybrid search (BM25 + Chroma/Pinecone), cross-encoder re-ranking, and chunking.", project: "Document QA engine with citation grounding and low hallucination." },
      { week: "Phase 3: Tool Orchestration & Multi-Agent", focus: "Function calling, dynamic tool dispatch, and supervisor multi-agent patterns.", project: "Multi-tool research agent with web search & calculation." },
      { week: "Phase 4: Evaluation & Production Deployment", focus: "RAGAS evaluation framework, Redis semantic caching, and Docker packaging.", project: "Production-ready API service with latency and accuracy benchmarks." }
    ]
  },
  "full stack developer": {
    requiredSkills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "FastAPI", "SQLAlchemy", "PostgreSQL", "Docker", "CI/CD"],
    roadmap: [
      { week: "Phase 1: Modern Frontend Architecture", focus: "Next.js App Router, React Server Components (RSC), and state management.", project: "High-performance job portal dashboard with glassmorphism UI." },
      { week: "Phase 2: Resilient RESTful APIs", focus: "FastAPI asynchronous handlers, Pydantic v2 schemas, and JWT authentication.", project: "Complete Auth & Profile microservice with PBKDF2 hashing." },
      { week: "Phase 3: Database & Performance", focus: "SQLAlchemy relationships, query indexing, and eliminating N+1 queries.", project: "Optimized multi-tenant application tracking database." },
      { week: "Phase 4: DevOps & Cloud Delivery", focus: "Docker containerization, GitHub Actions CI/CD pipelines, and Vercel edge deployment.", project: "Zero-downtime deployment pipeline with automated test suites." }
    ]
  },
  "backend developer": {
    requiredSkills: ["Python", "FastAPI", "PostgreSQL", "Redis", "Celery", "Docker", "System Design", "Microservices"],
    roadmap: [
      { week: "Phase 1: High-Throughput APIs", focus: "FastAPI async endpoints, dependency injection, and middleware telemetry.", project: "Rate-limited API gateway with Bearer token authentication." },
      { week: "Phase 2: Caching & Asynchronous Tasks", focus: "Redis key-value caching and Celery task queues for long-running jobs.", project: "Background email and notification dispatcher with worker queues." },
      { week: "Phase 3: Distributed Database Patterns", focus: "Database transactions, optimistic locking, connection pooling, and indexing.", project: "High-concurrency booking engine handling race conditions." },
      { week: "Phase 4: Scalable System Design", focus: "Microservices decomposition, message queues, and load balancing principles.", project: "End-to-end scalable backend architecture with documentation." }
    ]
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const roleKey = (body.target_role || "").toLowerCase().trim();
    const benchmark = ROADMAPS[roleKey] || ROADMAPS["full stack developer"];

    const userSkillsList = (body.current_skills || "")
      .split(",")
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean);

    const matched: string[] = [];
    const missing: string[] = [];

    benchmark.requiredSkills.forEach((r) => {
      if (userSkillsList.some((u: string) => r.toLowerCase().includes(u) || u.includes(r.toLowerCase()))) {
        matched.push(r);
      } else {
        missing.push(r);
      }
    });

    const matchPct = Math.round((matched.length / benchmark.requiredSkills.length) * 100);

    return NextResponse.json({
      target_role: body.target_role || "Full Stack Developer",
      match_percentage: matchPct,
      matched_skills: matched,
      missing_skills: missing,
      total_required: benchmark.requiredSkills.length,
      roadmap: benchmark.roadmap
    });
  } catch {
    return NextResponse.json({ detail: "Roadmap generation failed" }, { status: 500 });
  }
}
