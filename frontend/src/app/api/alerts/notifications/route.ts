import { NextResponse } from "next/server";
import { notificationsStore } from "../route";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(notificationsStore);
}

export async function POST() {
  notificationsStore.forEach((n) => {
    n.read = true;
  });
  return NextResponse.json({ status: "success", count: notificationsStore.length });
}

export async function DELETE() {
  notificationsStore.length = 0;
  return NextResponse.json({ status: "cleared" });
}
