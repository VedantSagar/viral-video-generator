import { describe, expect, it } from "vitest";
import { LocalVideoProvider, MockTextProvider } from "./mock";
import { transitionJob } from "../jobs";

describe("core vertical slice", () => {
  it("creates a complete deterministic script", async () => {
    const script = await new MockTextProvider().generateScript({ topic: "ocean mysteries", format: "short" });
    expect(script.hook).toContain("ocean mysteries");
    expect(script.scenes.length).toBeGreaterThan(2);
    expect(script.tags).toContain("shorts");
  });
  it("starts jobs in a retry-safe queued state", async () => {
    const script = await new MockTextProvider().generateScript({ topic: "ocean mysteries", format: "short" });
    const job = await new LocalVideoProvider().createJob({ projectId: "project-1", script });
    expect(job.status).toBe("queued");
    expect(job.progress).toBe(0);
    expect(job.id).toBeTruthy();
    const running = transitionJob(job, "running");
    expect(transitionJob(running, "completed").progress).toBe(100);
    expect(() => transitionJob(job, "completed")).toThrow("Invalid job transition");
  });
});
