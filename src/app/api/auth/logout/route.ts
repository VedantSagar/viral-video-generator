import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ authenticated: false });
}
