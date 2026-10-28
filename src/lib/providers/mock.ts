import { randomUUID } from "node:crypto";
import type { GenerateInput } from "@/src/lib/validation";
import type { ScriptDraft, UsageEstimate, VideoJob } from "@/src/lib/types";
import type { TextProvider, VideoProvider, VoiceProvider, VisualProvider } from "./interfaces";

export class MockTextProvider implements TextProvider {
  readonly name = "mock";
  async generateScript(input: GenerateInput): Promise<ScriptDraft> {
    const format = input.format === "short" ? "60-second short" : input.format;
    return {
      title: `${input.topic}: the ${format} people will want to share`,
      description: `A fast-paced ${format} about ${input.topic}, built for testing hooks and pacing.`,
      tags: [...input.topic.toLowerCase().split(/\s+/).slice(0, 4), "shorts", "youtube"],
      hook: `What if everything you knew about ${input.topic} was missing one surprising detail?`,
      scenes: [
        { narration: `Start with the surprising question: what makes ${input.topic} worth attention?`, visualPrompt: `${input.topic}, energetic opening shot`, seconds: 7 },
        { narration: "Give one concrete example viewers can understand immediately.", visualPrompt: `${input.topic}, illustrative detail`, seconds: 12 },
        { narration: "Build tension with a counterintuitive fact and a quick visual change.", visualPrompt: `${input.topic}, dramatic transition`, seconds: 14 },
        { narration: "End with a useful takeaway and invite viewers to compare their experience.", visualPrompt: `${input.topic}, optimistic closing frame`, seconds: 12 }
      ],
      estimatedSeconds: 45
    };
  }
}

const estimate = (provider: string, estimatedCost: number, note: string): UsageEstimate => ({
  currency: "USD", estimatedCost, provider, note
});

export class MockVoiceProvider implements VoiceProvider {
  readonly name = "mock";
  estimate(text: string) { return estimate(this.name, 0, `Mock voice for ${text.length} characters; no paid API call.`); }
}

export class MockVisualProvider implements VisualProvider {
  readonly name = "mock";
  estimate(sceneCount: number) { return estimate(this.name, 0, `Mock visuals for ${sceneCount} scenes; replace with licensed assets.`); }
}

export class LocalVideoProvider implements VideoProvider {
  readonly name = "local";
  async createJob(input: { projectId: string; script: ScriptDraft }): Promise<VideoJob> {
    const now = new Date().toISOString();
    return {
      id: randomUUID(), projectId: input.projectId, status: "queued", provider: "local", progress: 0,
      createdAt: now, updatedAt: now,
      estimate: estimate(this.name, 0, "Render plan queued locally; wire FFmpeg for MP4 composition.")
    };
  }
}
