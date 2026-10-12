import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory tracked applications fallback for Vercel
const trackedApps: Array<{
  id: number;
  user_id: number;
  job_id: number;
  job_title: string;
  company: string;
  location: string;
  salary: string;
  status: string;
  created_at: string;
}> = [];

export async function GET() {
  return NextResponse.json(trackedApps);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newApp = {
      id: trackedApps.length + 1,
      user_id: 1,
      job_id: body.job_id || 1,
      job_title: body.job_title || "Developer",
      company: body.company || "Tech Company",
      location: body.location || "Bengaluru",
      salary: body.salary || "12-18 LPA",
      status: body.status || "Saved",
      created_at: new Date().toISOString()
    };
    trackedApps.push(newApp);
    return NextResponse.json(newApp, { status: 201 });
  } catch {
    return NextResponse.json({ detail: "Failed to track application" }, { status: 500 });
  }
}
