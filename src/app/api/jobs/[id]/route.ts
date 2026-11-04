import { NextResponse } from "next/server";
import { requireSession } from "@/src/lib/auth";
import { getKaggleJob } from "@/src/lib/kaggle";
import { getJob, saveJob } from "@/src/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: { id: string } }) {
  try { requireSession(); } catch (error) { if (error instanceof Response) return error; throw error; }
  try {
    const stored = getJob(context.params.id);
    const job = await getKaggleJob(context.params.id, stored?.projectId ?? context.params.id);
    saveJob(job);
    return NextResponse.json({ job });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to read job status." }, { status: 502 });
  }
}
