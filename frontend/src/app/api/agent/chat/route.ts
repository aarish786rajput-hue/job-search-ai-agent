import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const COMPANY_INSIGHTS: Record<string, {
  name: string;
  rating: number;
  wlb: number;
  salary: string;
  notice: string;
  workMode: string;
  stack: string;
  culture: string;
  difficulty: string;
}> = {
  google: {
    name: "Google India",
    rating: 4.6,
    wlb: 4.4,
    salary: "25 - 65+ LPA",
    notice: "30 days buyout / standard notice",
    workMode: "Hybrid (3 days in-office)",
    stack: "Go, C++, Python, Kubernetes, TensorFlow, GCP",
    culture: "Top-tier engineering culture, world-class amenities, strong work-life balance.",
    difficulty: "Challenging (DSA, System Design, Googleyness)"
  },
  microsoft: {
    name: "Microsoft India (IDC)",
    rating: 4.5,
    wlb: 4.5,
    salary: "22 - 60+ LPA",
    notice: "30-60 days",
    workMode: "Flexible Hybrid",
    stack: "C#, .NET Core, Azure, TypeScript, Python, React",
    culture: "Exceptional work-life balance, collaborative team culture, extensive healthcare.",
    difficulty: "Moderate to Hard (Problem Solving & Low Level Design)"
  },
  flipkart: {
    name: "Flipkart",
    rating: 4.2,
    wlb: 3.8,
    salary: "18 - 55 LPA",
    notice: "30-60 days",
    workMode: "Hybrid (Bengaluru campus)",
    stack: "Java, Dropwizard, Kafka, Aerospike, React, Python",
    culture: "Fast-paced e-commerce scale, high engineering autonomy, lucrative ESOPs.",
    difficulty: "Hard (High-concurrency System Design & Data Structures)"
  },
  swiggy: {
    name: "Swiggy",
    rating: 4.2,
    wlb: 4.0,
    salary: "18 - 48 LPA",
    notice: "30 days",
    workMode: "Remote-First",
    stack: "Golang, Node.js, React Native, Kubernetes, AWS",
    culture: "High product velocity, modern tech stack, flexible work-from-anywhere model.",
    difficulty: "Moderate (Real-world system architecture & coding)"
  },
  zomato: {
    name: "Zomato",
    rating: 4.1,
    wlb: 3.7,
    salary: "16 - 45 LPA",
    notice: "30 days",
    workMode: "In-Office / Hybrid",
    stack: "PHP, Go, React, Python, Kafka, Redis",
    culture: "Energetic consumer startup culture with direct business impact.",
    difficulty: "Fast-tracked technical and cultural fit rounds"
  },
  razorpay: {
    name: "Razorpay",
    rating: 4.3,
    wlb: 4.1,
    salary: "18 - 50 LPA",
    notice: "30 days",
    workMode: "Hybrid",
    stack: "Go, PHP, React, MySQL, AWS, Docker",
    culture: "Fintech innovation leader, transparent leadership, employee-friendly ESOP policies.",
    difficulty: "Moderate-Hard (Machine Coding + Architecture)"
  },
  tcs: {
    name: "Tata Consultancy Services (TCS)",
    rating: 3.9,
    wlb: 4.1,
    salary: "3.6 - 18 LPA",
    notice: "90 days (Strictly enforced)",
    workMode: "In-Office (5 days / week policy)",
    stack: "Java, Spring Boot, Angular, Oracle, Cloud, Mainframe",
    culture: "Immense enterprise stability, international onsite opportunities, structured career ladder.",
    difficulty: "Moderate (Aptitude, Core CS concepts, Managerial round)"
  },
  infosys: {
    name: "Infosys",
    rating: 3.8,
    wlb: 4.0,
    salary: "3.8 - 20 LPA",
    notice: "90 days (Mandatory in Indian IT services)",
    workMode: "Hybrid / In-Office",
    stack: "Java, Python, React, Cloud, DevOps, AI/GenAI",
    culture: "Predictable work hours, strong training and upskilling ecosystem, global brand.",
    difficulty: "Moderate (Online assessment + Technical interview)"
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = (body.query || "").toLowerCase();
    const role = body.role || (query.includes("ai") ? "AI Engineer" : query.includes("backend") ? "Backend Developer" : "Frontend Developer");

    let reply = "";
    let intent = "general";

    // Check company intelligence intent
    const companyKeywords = ["company", "culture", "ambitionbox", "glassdoor", "review", "work life", "rating", "google", "microsoft", "flipkart", "swiggy", "zomato", "razorpay", "tcs", "infosys"];
    const matchedCompanyKey = Object.keys(COMPANY_INSIGHTS).find((key) => query.includes(key));

    if (matchedCompanyKey || companyKeywords.some((k) => query.includes(k))) {
      intent = "company";
      const c = COMPANY_INSIGHTS[matchedCompanyKey || "google"];
      reply = `🏢 **Company Intelligence: ${c.name}**\n\n` +
        `⭐ **AmbitionBox & Glassdoor Rating:** ${c.rating} / 5.0\n` +
        `⚖️ **Work-Life Balance:** ${c.wlb} / 5.0\n` +
        `💼 **Expected Salary Band:** ${c.salary}\n` +
        `⏱️ **Notice Period Policy:** ${c.notice}\n` +
        `🏠 **Work Mode:** ${c.workMode}\n` +
        `💻 **Core Tech Stack:** ${c.stack}\n\n` +
        `💡 **Culture & Interview Insights:**\n` +
        `• ${c.culture}\n` +
        `• **Interview Difficulty:** ${c.difficulty}`;
    } else if (query.includes("salary") || query.includes("lpa") || query.includes("package")) {
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
