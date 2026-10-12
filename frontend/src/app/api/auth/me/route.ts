import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    id: 1,
    full_name: "Aarish Rajput",
    email: "aarish786rajput@gmail.com",
    is_active: true
  });
}
