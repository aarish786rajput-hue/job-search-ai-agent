import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE() {
  return NextResponse.json({
    status: "success",
    message: "Your candidate account and all associated data have been permanently erased in compliance with GDPR / DPDP Act."
  });
}

