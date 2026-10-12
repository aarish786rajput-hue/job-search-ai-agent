import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json({ detail: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ detail: "Password must be at least 6 characters" }, { status: 400 });
    }

    return NextResponse.json({
      message: "Account created successfully! Please log in."
    }, { status: 201 });
  } catch {
    return NextResponse.json({ detail: "Registration failed" }, { status: 500 });
  }
}
