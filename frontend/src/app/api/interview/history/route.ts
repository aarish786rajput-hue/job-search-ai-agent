import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Mock interview history for Next.js API fallback
  return NextResponse.json([
    {
      id: 1,
      role: "AI Engineer",
      difficulty: "Mid-Level",
      total_score: 86.0,
      questions_answered: 3,
      feedback_summary: "Completed 3 technical questions with average score of 86%",
      created_at: "07 Nov 2026, 05:45 PM"
    },
    {
      id: 2,
      role: "Full Stack Developer",
      difficulty: "Mid-Level",
      total_score: 91.5,
      questions_answered: 3,
      feedback_summary: "Completed 3 technical questions with average score of 91.5%",
      created_at: "05 Nov 2026, 02:15 PM"
    }
  ]);
}
