import { NextResponse } from "next/server";
import { createSession, isAuthConfigured, setSessionCookie, verifyPassword } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isAuthConfigured()) return NextResponse.json({ error: "ADMIN_PASSWORD is not configured on the server." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  if (typeof body.password !== "string" || !verifyPassword(body.password)) {
    return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
  }
  setSessionCookie(createSession());
  return NextResponse.json({ authenticated: true });
}
