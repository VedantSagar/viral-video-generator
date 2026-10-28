"use client";

import { useState } from "react";

type Draft = { title: string; description: string; tags: string[]; hook: string; scenes: Array<{ narration: string; visualPrompt: string; seconds: number }> };
type Job = { id: string; status: string; progress: number; provider: string; estimate: { estimatedCost: number; note: string } };

export default function Home() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("short");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [projectId, setProjectId] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topic, format }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) return setMessage(data.error ?? "Generation failed.");
    setDraft(data.script); setProjectId(data.projectId); setMessage("Draft generated in clearly labeled mock mode. Edit it before rendering.");
  }

  async function render() {
    if (!draft) return;
    setBusy(true); setMessage("");
    const response = await fetch("/api/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId, script: JSON.stringify(draft) }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) return setMessage(data.error ?? "Render failed.");
    setJobs((current) => [data.job, ...current]); setMessage("Render job queued. No public upload was performed.");
  }

  return <main className="shell">
    <header><div><p className="eyebrow">MVP WORKSPACE</p><h1>Make a better first draft.</h1><p className="lede">Hooks, pacing, captions, and iteration—without promising “viral” or “unskippable” results.</p></div><span className="badge">MOCK MODE</span></header>
    <section className="grid">
      <div className="card"><h2>1. Start a concept</h2>
        <label>Topic<input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Why octopuses change color" /></label>
        <label>Format<select value={format} onChange={(e) => setFormat(e.target.value)}><option value="short">Short</option><option value="story">Story</option><option value="listicle">Listicle</option><option value="explainer">Explainer</option></select></label>
        <button onClick={generate} disabled={busy || topic.length < 3}>{busy ? "Working…" : "Generate draft"}</button>
        {message && <p className="notice" role="status">{message}</p>}
      </div>
      <div className="card editor"><h2>2. Review and edit</h2>
        {!draft ? <p className="muted">Your script, title, description, and tags will appear here.</p> : <>
          <label>Title<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
          <label>Description<textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
          <label>Hook<textarea value={draft.hook} onChange={(e) => setDraft({ ...draft, hook: e.target.value })} /></label>
          <label>Scenes<textarea rows={9} value={draft.scenes.map((scene) => scene.narration).join("\n\n")} onChange={(e) => setDraft({ ...draft, scenes: e.target.value.split(/\n\n+/).map((narration, index) => ({ narration, visualPrompt: draft.scenes[index]?.visualPrompt ?? "supporting visual", seconds: draft.scenes[index]?.seconds ?? 10 })) })} /></label>
          <p className="muted">Tags: {draft.tags.join(", ")}</p><button onClick={render} disabled={busy}>Queue local render</button>
        </>}
      </div>
    </section>
    <section className="card jobs"><h2>3. Render jobs</h2>{jobs.length === 0 ? <p className="muted">No jobs yet. Videos remain private until you explicitly configure publishing.</p> : jobs.map((job) => <div className="job" key={job.id}><strong>{job.status}</strong><span>{job.provider} · {job.progress}% · ${job.estimate.estimatedCost.toFixed(2)} est.</span><small>{job.estimate.note}</small></div>)}</section>
    <footer>Provider limits, quotas, estimated costs, and failures are explicit. YouTube publishing is opt-in and defaults to private/draft.</footer>
  </main>;
}
