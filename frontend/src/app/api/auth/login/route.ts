import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let email = "";
    let password = "";

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      email = (formData.get("username") as string) || "";
      password = (formData.get("password") as string) || "";
    } else {
      const body = await request.json();
      email = body.username || body.email || "";
      password = body.password || "";
    }

    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required" }, { status: 400 });
    }

    // Return authenticated token
    const token = `token_${Buffer.from(email).toString("base64")}_${Date.now()}`;

    return NextResponse.json({
      access_token: token,
      token_type: "bearer"
    });
  } catch {
    return NextResponse.json({ detail: "Login failed" }, { status: 500 });
  }
}
