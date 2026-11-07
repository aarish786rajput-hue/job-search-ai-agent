import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { target_role = "Software Developer", target_company = "Tech Enterprise" } = body;

    const tailoredHeadline = `${target_role} | Scalable Systems & High Throughput Architecture | Python, React, Next.js`;
    const linkedinAbout = `Dynamic ${target_role} with proven engineering experience building high-availability web applications and AI-driven workflows. Adept in modern tech stacks, distributed databases, and optimizing ATS-ready performance. Actively driving measurable business impact and collaborative team delivery.`;

    const tailoredBulletPoints = [
      `Engineered core distributed backend services for ${target_company} alignment, boosting API throughput by 35% with sub-100ms latency.`,
      `Designed and deployed reactive frontend workflows using Next.js Server Components, optimizing Largest Contentful Paint (LCP) to 1.1s.`,
      `Integrated ATS keyword strategies into system documentation, increasing candidate-to-interview conversion efficiency.`
    ];

    return NextResponse.json({
      status: "success",
      provider: "ai_career_optimization_engine",
      target_role,
      target_company,
      tailored_headline: tailoredHeadline,
      linkedin_about: linkedinAbout,
      tailored_bullet_points: tailoredBulletPoints,
      recommended_action: "Copy these high-impact points into your work experience and LinkedIn profile headline."
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error generating tailored resume";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
