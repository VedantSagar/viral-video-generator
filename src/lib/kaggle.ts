import type { ScriptDraft, VideoJob } from "./types";

type BridgeResponse = {
  id?: string;
  jobId?: string;
  status?: string;
  progress?: number;
  error?: string;
  outputs?: VideoJob["outputs"];
  files?: VideoJob["outputs"];
  estimate?: VideoJob["estimate"];
};

function bridgeConfig() {
  const baseUrl = process.env.KAGGLE_BRIDGE_URL?.replace(/\/+$/, "");
  const token = process.env.KAGGLE_BRIDGE_TOKEN;
  if (!baseUrl || !token) throw new Error("KAGGLE_BRIDGE_URL and KAGGLE_BRIDGE_TOKEN are required.");
  return { baseUrl, token };
}

async function request(path: string, init?: RequestInit): Promise<BridgeResponse> {
  const { baseUrl, token } = bridgeConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...init?.headers },
    cache: "no-store"
  });
  const data = (await response.json().catch(() => ({}))) as BridgeResponse;
  if (!response.ok) throw new Error(data.error ?? `Kaggle bridge returned ${response.status}.`);
  return data;
}

export async function createKaggleJob(input: {
  projectId: string;
  script: ScriptDraft;
  captionStyle: string;
  outputs: Array<"mp4" | "mp3">;
}) {
  const data = await request("/jobs", { method: "POST", body: JSON.stringify(input) });
  const id = data.id ?? data.jobId;
  if (!id) throw new Error("Kaggle bridge did not return a job id.");
  return normalizeJob(data, id, input.projectId);
}

export async function getKaggleJob(id: string, projectId: string) {
  return normalizeJob(await request(`/jobs/${encodeURIComponent(id)}`), id, projectId);
}

function normalizeJob(data: BridgeResponse, id: string, projectId: string): VideoJob {
  const status = data.status === "succeeded" ? "completed" : data.status === "error" ? "failed" : (data.status ?? "queued");
  return {
    id,
    projectId,
    status: status as VideoJob["status"],
    provider: "kaggle",
    progress: Math.max(0, Math.min(100, data.progress ?? (status === "completed" ? 100 : 0))),
    error: data.error,
    outputs: data.outputs ?? data.files ?? [],
    estimate: data.estimate ?? { currency: "USD", estimatedCost: 0, provider: "kaggle", note: "Rendered by the configured Kaggle bridge." },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
