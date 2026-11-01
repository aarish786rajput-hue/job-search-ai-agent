import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export interface JobAlertItem {
  id: number;
  user_id: number;
  keyword: str;
  location: str;
  min_salary: str;
  work_mode: str;
  channel: str;
  frequency: str;
  is_active: boolean;
  matched_jobs_count: number;
  created_at: string;
}

type str = string;

export const alertsStore: JobAlertItem[] = [
  {
    id: 1,
    user_id: 1,
    keyword: "AI Engineer",
    location: "Bengaluru",
    min_salary: "20 LPA",
    work_mode: "Hybrid",
    channel: "Email & SMS",
    frequency: "Instant",
    is_active: true,
    matched_jobs_count: 2,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 2,
    user_id: 1,
    keyword: "Frontend Developer",
    location: "Any",
    min_salary: "10 LPA",
    work_mode: "Remote",
    channel: "Email",
    frequency: "Daily Digest",
    is_active: true,
    matched_jobs_count: 3,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const notificationsStore = [
  {
    id: "notif-1",
    title: "New Job Match: AI Engineer",
    message: "AI Labs (Bengaluru) posted a job matching your 'AI Engineer' alert (20-30 LPA).",
    channel: "Email & SMS",
    timestamp: "Just now",
    read: false
  },
  {
    id: "notif-2",
    title: "Daily Alert Digest",
    message: "3 new Frontend Developer roles matching your criteria were found in Bengaluru & Remote.",
    channel: "Email",
    timestamp: "2 hours ago",
    read: false
  }
];

export async function GET() {
  return NextResponse.json(alertsStore);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.keyword || !body.keyword.trim()) {
      return NextResponse.json({ detail: "Keyword is required" }, { status: 400 });
    }

    const newAlert: JobAlertItem = {
      id: Date.now(),
      user_id: 1,
      keyword: body.keyword.trim(),
      location: body.location || "Any",
      min_salary: body.min_salary || "10 LPA",
      work_mode: body.work_mode || "Any",
      channel: body.channel || "Email & SMS",
      frequency: body.frequency || "Instant",
      is_active: true,
      matched_jobs_count: Math.floor(Math.random() * 3) + 1,
      created_at: new Date().toISOString()
    };

    alertsStore.unshift(newAlert);

    notificationsStore.unshift({
      id: `notif-${Date.now()}`,
      title: `Job Alert Created: ${newAlert.keyword}`,
      message: `Alert activated for '${newAlert.keyword}' in ${newAlert.location}. Notifications will be sent via ${newAlert.channel}.`,
      channel: newAlert.channel,
      timestamp: "Just now",
      read: false
    });

    return NextResponse.json(newAlert, { status: 201 });
  } catch {
    return NextResponse.json({ detail: "Failed to create alert" }, { status: 500 });
  }
}
