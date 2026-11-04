export type VideoFormat = "short" | "story" | "listicle" | "explainer";
export type ProviderName = "mock" | "omniroute" | "runway" | "luma" | "kling" | "local" | "kaggle";
export type JobStatus = "queued" | "running" | "completed" | "failed";

export interface ScriptDraft {
  title: string;
  description: string;
  tags: string[];
  hook: string;
  scenes: Array<{ narration: string; visualPrompt: string; seconds: number }>;
  estimatedSeconds: number;
}

export interface UsageEstimate {
  currency: "USD";
  estimatedCost: number;
  provider: string;
  note: string;
}

export interface VideoJob {
  id: string;
  projectId: string;
  status: JobStatus;
  provider: ProviderName;
  progress: number;
  error?: string;
  outputs?: Array<{ type: "mp4" | "mp3"; url: string; name?: string }>;
  createdAt: string;
  updatedAt: string;
  estimate: UsageEstimate;
}
