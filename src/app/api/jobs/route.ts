import { NextResponse } from "next/server";
import { listJobs } from "@/src/lib/db";

export function GET() {
  return NextResponse.json({ jobs: listJobs() });
}
