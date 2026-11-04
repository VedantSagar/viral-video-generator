import { NextResponse } from "next/server";
import { hasSession, isAuthConfigured } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ configured: isAuthConfigured(), authenticated: isAuthConfigured() && hasSession() });
}
