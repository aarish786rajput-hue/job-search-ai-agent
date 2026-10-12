import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    environment: "vercel-serverless",
    total_jobs: 8
  });
}
