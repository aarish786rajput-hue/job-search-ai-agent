import { NextResponse } from "next/server";
import { alertsStore } from "../route";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);
  const idx = alertsStore.findIndex((a) => a.id === numId);
  if (idx !== -1) {
    alertsStore.splice(idx, 1);
  }
  return NextResponse.json({ message: "Job alert deleted" });
}

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);
  const alert = alertsStore.find((a) => a.id === numId);
  if (!alert) {
    return NextResponse.json({ detail: "Alert not found" }, { status: 404 });
  }

  alert.is_active = !alert.is_active;
  return NextResponse.json({ id: alert.id, is_active: alert.is_active });
}
