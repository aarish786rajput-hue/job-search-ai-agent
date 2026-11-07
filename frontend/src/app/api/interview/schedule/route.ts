import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const role = body.role || "Software Engineer";
    const date = body.date || new Date().toISOString().split("T")[0];
    const time = body.time || "10:00";

    const title = encodeURIComponent(`Mock Interview Practice: ${role}`);
    const details = encodeURIComponent(`AI-Powered Technical Mock Interview session for ${role} on CareerOrbit platform.`);

    // Convert date + time to basic calendar format
    const startStr = `${date.replace(/-/g, "")}T${time.replace(/:/g, "")}00Z`;
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${startStr}&details=${details}`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CareerOrbit AI//Mock Interview//EN
BEGIN:VEVENT
SUMMARY:Mock Interview Practice: ${role}
DESCRIPTION:Practice session for ${role} on CareerOrbit AI platform.
DTSTART:${startStr}
DTEND:${startStr}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    return NextResponse.json({
      id: Date.now(),
      role,
      scheduled_for: `${date} at ${time}`,
      google_calendar_url: gcalUrl,
      ics_content: icsContent
    });
  } catch {
    return NextResponse.json({ detail: "Scheduling failed" }, { status: 500 });
  }
}
