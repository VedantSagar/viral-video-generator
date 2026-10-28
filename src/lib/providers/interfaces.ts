import type { GenerateInput } from "@/src/lib/validation";
import type { ScriptDraft, UsageEstimate, VideoJob } from "@/src/lib/types";

export interface TextProvider {
  readonly name: string;
  generateScript(input: GenerateInput): Promise<ScriptDraft>;
}
export interface VoiceProvider {
  readonly name: string;
  estimate(text: string): UsageEstimate;
}
export interface VisualProvider {
  readonly name: string;
  estimate(sceneCount: number): UsageEstimate;
}
export interface VideoProvider {
  readonly name: string;
  createJob(input: { projectId: string; script: ScriptDraft }): Promise<VideoJob>;
}
export interface YouTubePublisher {
  readonly name: string;
  uploadPrivateDraft(input: { title: string; description: string }): Promise<{ externalId: string }>;
}
