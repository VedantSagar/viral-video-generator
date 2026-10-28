import type { JobStatus, VideoJob } from "./types";

const transitions: Record<JobStatus, JobStatus[]> = {
  queued: ["running", "failed"],
  running: ["completed", "failed"],
  completed: [],
  failed: ["queued"]
};

export function transitionJob(job: VideoJob, nextStatus: JobStatus): VideoJob {
  if (!transitions[job.status].includes(nextStatus)) {
    throw new Error(`Invalid job transition from ${job.status} to ${nextStatus}.`);
  }
  return { ...job, status: nextStatus, progress: nextStatus === "completed" ? 100 : job.progress, updatedAt: new Date().toISOString() };
}
