import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const offered = Number(body.offered_lpa) || 12;
    const target = Number(body.target_lpa) || 16;
    const company = body.company || "Target Company";
    const role = body.role || "Software Engineer";
    const noticePeriod = body.notice_period_days || 30;

    const diffLpa = Math.max(0, Number((target - offered).toFixed(1)));
    const diffPct = offered > 0 ? Number((((target - offered) / offered) * 100).toFixed(1)) : 0;

    // Approximate monthly in-hand (after Indian PF and income tax deductions)
    const inHandOffered = Math.round((offered * 100000 * 0.84) / 12);
    const inHandTarget = Math.round((target * 100000 * 0.84) / 12);

    const emailDraft =
      `Subject: In appreciation of the offer — Discussion regarding ${role} compensation at ${company}\n\n` +
      `Dear Hiring Team,\n\n` +
      `Thank you very much for offering me the ${role} position at ${company}. I am truly excited about the team's roadmap and the opportunity to make a positive impact.\n\n` +
      `Based on my experience, technical skill alignment, and current market benchmarks for this role in India, I was hoping we could explore aligning the total compensation closer to ${target} LPA (offered: ${offered} LPA). ` +
      `With my ${noticePeriod}-day notice period and hands-on readiness with modern engineering workflows, I am confident I will ramp up and deliver immediate business value.\n\n` +
      `Would it be possible to discuss whether there is flexibility in the base component or a joining bonus to bridge this difference? Either way, I am very enthusiastic about joining ${company}.\n\n` +
      `Warm regards,\n[Your Name]`;

    const talkingPoints = [
      `Leverage Notice Period: Your ${noticePeriod}-day notice period enables rapid onboarding and value creation.`,
      `State Market Median: Current tech market benchmarks for ${role} in metro hubs typically sit around ${target} LPA.`,
      `Alternative Levers: If base fixed pay is constrained, negotiate a ₹${(diffLpa * 0.7).toFixed(1)} LPA joining bonus or performance-linked bonuses.`,
      `Always maintain an enthusiastic and collaborative tone while negotiating.`
    ];

    return NextResponse.json({
      offered_lpa: offered,
      target_lpa: target,
      difference_lpa: diffLpa,
      difference_percent: diffPct,
      estimated_in_hand_monthly_offered: `₹${inHandOffered.toLocaleString("en-IN")}/month`,
      estimated_in_hand_monthly_target: `₹${inHandTarget.toLocaleString("en-IN")}/month`,
      email_draft: emailDraft,
      talking_points: talkingPoints
    });
  } catch {
    return NextResponse.json({ detail: "Negotiation analysis failed" }, { status: 500 });
  }
}
