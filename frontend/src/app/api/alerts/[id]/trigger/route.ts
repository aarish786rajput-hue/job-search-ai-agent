import { NextResponse } from "next/server";
import { alertsStore, notificationsStore } from "../../route";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);
  const alert = alertsStore.find((a) => a.id === numId);
  if (!alert) {
    return NextResponse.json({ detail: "Alert not found" }, { status: 404 });
  }

  const matches = alert.matched_jobs_count || 2;
  const notifMsg = `Dispatched ${alert.channel} notification to aarish786rajput@gmail.com: ${matches} active role(s) found for '${alert.keyword}' in ${alert.location}.`;

  notificationsStore.unshift({
    id: `notif-${Date.now()}`,
    title: `Live Alert Trigger: ${alert.keyword}`,
    message: notifMsg,
    channel: alert.channel,
    timestamp: "Just now",
    read: false
  });

  return NextResponse.json({
    status: "success",
    channel: alert.channel,
    recipient: "aarish786rajput@gmail.com",
    message: notifMsg,
    matched_jobs: matches
  });
}
