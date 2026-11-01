import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// In-memory demo profile state for serverless Next.js
export const userProfileStore = {
  id: 1,
  full_name: "Aarish Rajput",
  email: "aarish786rajput@gmail.com",
  is_active: true,
  target_role: "Full Stack Developer",
  target_salary: "15 LPA",
  preferred_locations: "Bengaluru, Remote",
  notice_period: "30 days",
  work_mode: "Hybrid",
  primary_skills: "React, Next.js, FastAPI, Python, TypeScript",
  experience_years: "2-4 Years"
};

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(userProfileStore);
}

export async function PUT(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (body.full_name !== undefined) userProfileStore.full_name = body.full_name;
    if (body.target_role !== undefined) userProfileStore.target_role = body.target_role;
    if (body.target_salary !== undefined) userProfileStore.target_salary = body.target_salary;
    if (body.preferred_locations !== undefined) userProfileStore.preferred_locations = body.preferred_locations;
    if (body.notice_period !== undefined) userProfileStore.notice_period = body.notice_period;
    if (body.work_mode !== undefined) userProfileStore.work_mode = body.work_mode;
    if (body.primary_skills !== undefined) userProfileStore.primary_skills = body.primary_skills;
    if (body.experience_years !== undefined) userProfileStore.experience_years = body.experience_years;

    return NextResponse.json(userProfileStore);
  } catch {
    return NextResponse.json({ detail: "Invalid payload" }, { status: 400 });
  }
}
