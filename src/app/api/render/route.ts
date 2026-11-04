import { NextResponse } from "next/server";
import { saveJob } from "@/src/lib/db";
import { createKaggleJob } from "@/src/lib/kaggle";
import { renderInputSchema } from "@/src/lib/validation";
import type { ScriptDraft } from "@/src/lib/types";
import { requireSession } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try { requireSession(); } catch (error) { if (error instanceof Response) return error; throw error; }
  try {
    const input = renderInputSchema.parse(await request.json());
    const script = JSON.parse(input.script) as ScriptDraft;
    const job = await createKaggleJob({
      projectId: input.projectId,
      script,
      captionStyle: input.captionStyle,
      outputs: input.outputs
    });
    saveJob(job);
    return NextResponse.json({ job });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to queue render." }, { status: 400 });
  }
}
