import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      role: "Full Stack Developer",
      scheduled_for: "10 Nov 2026 at 03:00 PM",
      reminder_channel: "Email & Google Calendar",
      is_completed: false
    }
  ]);
}

