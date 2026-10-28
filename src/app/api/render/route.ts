import { NextResponse } from "next/server";
import { saveJob } from "@/src/lib/db";
import { LocalVideoProvider } from "@/src/lib/providers/mock";
import { renderInputSchema } from "@/src/lib/validation";
import type { ScriptDraft } from "@/src/lib/types";

export async function POST(request: Request) {
  try {
    const input = renderInputSchema.parse(await request.json());
    const script = JSON.parse(input.script) as ScriptDraft;
    const job = await new LocalVideoProvider().createJob({ projectId: input.projectId, script });
    saveJob(job);
    return NextResponse.json({ job });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to queue render." }, { status: 400 });
  }
}
