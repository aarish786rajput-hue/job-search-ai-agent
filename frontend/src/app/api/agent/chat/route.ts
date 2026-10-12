import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = (body.query || "").toLowerCase();
    const role = body.role || (query.includes("ai") ? "AI Engineer" : query.includes("backend") ? "Backend Developer" : "Frontend Developer");

    let reply = "";
    let intent = "general";

    if (query.includes("salary") || query.includes("lpa") || query.includes("package")) {
      intent = "salary";
      reply = `💰 **Salary Insights for ${role} in India:**\n\n• **Fresher / Entry:** 6-12 LPA\n• **Mid-Level (2-4 Yrs):** 14-24 LPA\n• **Senior (5+ Yrs):** 28-45+ LPA\n\n📍 **Top Hiring Hubs:** Bengaluru, Hyderabad, Pune, Gurgaon`;
    } else if (query.includes("interview") || query.includes("question") || query.includes("prep")) {
      intent = "interview";
      reply = `🎯 **Interview Prep Guide for ${role}:**\n\n1. Explain REST API idempotency and status code conventions.\n2. How do you handle concurrency, caching, and state management in production?\n3. Describe your experience with CI/CD and deployment pipelines.\n\n💡 **Pro Tip:** Emphasize hands-on projects, measurable impact, and system design clarity.`;
    } else if (query.includes("resume") || query.includes("ats") || query.includes("cv")) {
      intent = "resume";
      reply = `📄 **ATS Resume Optimization Strategy:**\n\n• **Target Keywords:** FastAPI, Next.js, LangGraph, Docker, PostgreSQL, Tailwind CSS.\n• **Structure:** 1-page clean format, quantifiable achievements (e.g. 'Improved speed by 40%').\n• **Action Verbs:** Architected, Optimized, Deployed, Spearheaded.`;
    } else {
      reply = `🔍 **Matched Opportunities for ${role}:**\n\n• **${role}** at Top Tech Hubs (Bengaluru / Remote)\n• Check our verified job recommendations above to apply and track your application!`;
    }

    return NextResponse.json({
      reply,
      intent,
      target_role: role,
      tool_results: { role, query }
    });
  } catch {
    return NextResponse.json({ detail: "AI Agent processing failed" }, { status: 500 });
  }
}
