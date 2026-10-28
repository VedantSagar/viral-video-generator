import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { saveProject } from "@/src/lib/db";
import { getTextProvider } from "@/src/lib/providers/registry";
import { generateInputSchema } from "@/src/lib/validation";

export async function POST(request: Request) {
  try {
    const input = generateInputSchema.parse(await request.json());
    const script = await getTextProvider().generateScript(input);
    const projectId = randomUUID();
    saveProject({ id: projectId, topic: input.topic, format: input.format, script });
    return NextResponse.json({ projectId, script, provider: process.env.TEXT_PROVIDER ?? "mock" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to generate draft." }, { status: 400 });
  }
}
