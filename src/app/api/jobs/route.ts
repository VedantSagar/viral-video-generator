import { NextResponse } from "next/server";
import { listJobs } from "@/src/lib/db";
import { requireSession } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export function GET() {
  try { requireSession(); } catch (error) { if (error instanceof Response) return error; throw error; }
  return NextResponse.json({ jobs: listJobs() });
}
