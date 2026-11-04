"use client";

import { useEffect, useState } from "react";

type Draft = { title: string; description: string; tags: string[]; hook: string; scenes: Array<{ narration: string; visualPrompt: string; seconds: number }> };
type Output = { type: "mp4" | "mp3"; url: string; name?: string };
type Job = { id: string; status: string; progress: number; provider: string; error?: string; outputs?: Output[]; estimate: { estimatedCost: number; note: string } };

export default function Home() {
  const [configured, setConfigured] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("short");
  const [captionStyle, setCaptionStyle] = useState("clean");
  const [outputs, setOutputs] = useState<Array<"mp4" | "mp3">>(["mp4"]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [projectId, setProjectId] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session").then((response) => response.json()).then((data) => {
      setConfigured(data.configured); setAuthenticated(data.authenticated);
    });
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetch("/api/jobs").then((response) => response.json()).then((data) => setJobs(data.jobs ?? []));
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated || jobs.every((job) => ["completed", "failed"].includes(job.status))) return;
    const timer = window.setInterval(async () => {
      const active = jobs.filter((job) => !["completed", "failed"].includes(job.status));
      const refreshed = await Promise.all(active.map(async (job) => {
        const response = await fetch(`/api/jobs/${job.id}`);
        return response.ok ? (await response.json()).job as Job : job;
      }));
      setJobs((current) => current.map((job) => refreshed.find((next) => next.id === job.id) ?? job));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [authenticated, jobs]);

  async function login(event: React.FormEvent) {
    event.preventDefault(); setMessage(""); setBusy(true);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) return setMessage(data.error ?? "Login failed.");
    setAuthenticated(true); setPassword("");
  }

  async function generate() {
    setBusy(true); setMessage("");
    const response = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ topic, format }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) return setMessage(data.error ?? "Generation failed.");
    setDraft(data.script); setProjectId(data.projectId); setMessage("Draft generated. Edit it before sending to Kaggle.");
  }

  async function render() {
    if (!draft) return;
    setBusy(true); setMessage("");
    const response = await fetch("/api/render", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId, script: JSON.stringify(draft), captionStyle, outputs }) });
    const data = await response.json(); setBusy(false);
    if (!response.ok) return setMessage(data.error ?? "Render failed.");
    setJobs((current) => [data.job, ...current]); setMessage("Kaggle job queued. This page will poll for status.");
  }

  if (!configured || !authenticated) return <main className="shell auth-shell"><div className="card auth-card">
    <p className="eyebrow">ADMIN WORKSPACE</p><h1>Private video lab.</h1>
    <p className="lede">{configured ? "Sign in to generate and render videos through your Kaggle bridge." : "Set ADMIN_PASSWORD on the server before signing in."}</p>
    {configured && <form onSubmit={login}><label>Admin password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label><button disabled={busy || !password}>{busy ? "Signing in…" : "Sign in"}</button></form>}
    {message && <p className="notice" role="status">{message}</p>}
  </div></main>;

  return <main className="shell">
    <header><div><p className="eyebrow">KAGGLE VIDEO LAB</p><h1>Make a better first draft.</h1><p className="lede">Generate a script, choose caption styling and output formats, then send the job to your private Kaggle bridge.</p></div><button className="secondary" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); setAuthenticated(false); }}>Sign out</button></header>
    <section className="grid">
      <div className="card"><h2>1. Start a concept</h2>
        <label>Topic<input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Why octopuses change color" /></label>
        <label>Format<select value={format} onChange={(e) => setFormat(e.target.value)}><option value="short">Short</option><option value="story">Story</option><option value="listicle">Listicle</option><option value="explainer">Explainer</option></select></label>
        <button onClick={generate} disabled={busy || topic.length < 3}>{busy ? "Working…" : "Generate draft"}</button>
        {message && <p className="notice" role="status">{message}</p>}
      </div>
      <div className="card editor"><h2>2. Review and render</h2>
        {!draft ? <p className="muted">Your script, title, description, and tags will appear here.</p> : <>
          <label>Title<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
          <label>Description<textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label>
          <label>Hook<textarea value={draft.hook} onChange={(e) => setDraft({ ...draft, hook: e.target.value })} /></label>
          <label>Scenes<textarea rows={8} value={draft.scenes.map((scene) => scene.narration).join("\n\n")} onChange={(e) => setDraft({ ...draft, scenes: e.target.value.split(/\n\n+/).map((narration, index) => ({ narration, visualPrompt: draft.scenes[index]?.visualPrompt ?? "supporting visual", seconds: draft.scenes[index]?.seconds ?? 10 })) })} /></label>
          <p className="muted">Tags: {draft.tags.join(", ")}</p>
          <div className="controls"><label>Caption style<select value={captionStyle} onChange={(e) => setCaptionStyle(e.target.value)}><option value="clean">Clean</option><option value="bold">Bold</option><option value="karaoke">Karaoke</option></select></label><fieldset><legend>Outputs</legend><label><input type="checkbox" checked={outputs.includes("mp4")} onChange={() => setOutputs((current) => current.includes("mp4") ? current.filter((item) => item !== "mp4") : [...current, "mp4"])} /> MP4 video</label><label><input type="checkbox" checked={outputs.includes("mp3")} onChange={() => setOutputs((current) => current.includes("mp3") ? current.filter((item) => item !== "mp3") : [...current, "mp3"])} /> MP3 audio</label></fieldset></div>
          <button onClick={render} disabled={busy || outputs.length === 0}>Send to Kaggle</button>
        </>}
      </div>
    </section>
    <section className="card jobs"><h2>3. Jobs</h2>{jobs.length === 0 ? <p className="muted">No jobs yet.</p> : jobs.map((job) => <div className="job" key={job.id}><strong>{job.status} · {job.progress}%</strong><span>{job.provider} · ${job.estimate.estimatedCost.toFixed(2)} est.</span>{job.error && <small className="error">{job.error}</small>}{job.outputs?.map((output) => <a key={output.type} href={output.url} target="_blank" rel="noreferrer">Download {output.name ?? output.type.toUpperCase()}</a>)}</div>)}</section>
    <footer>Admin access is protected by a server-side password and HTTP-only session cookie. No YouTube upload is included.</footer>
  </main>;
}
