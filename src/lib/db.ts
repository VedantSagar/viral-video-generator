import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { VideoJob } from "./types";

const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const file = isBuild ? ":memory:" : path.resolve(process.env.DATABASE_PATH ?? "./data/viral-video-generator.db");
if (!isBuild) fs.mkdirSync(path.dirname(file), { recursive: true });
const db = new Database(file);
if (!isBuild) {
  db.pragma("busy_timeout = 5000");
  db.pragma("journal_mode = WAL");
}
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY, topic TEXT NOT NULL, format TEXT NOT NULL,
    script_json TEXT NOT NULL, created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY, project_id TEXT NOT NULL, status TEXT NOT NULL,
    provider TEXT NOT NULL, progress INTEGER NOT NULL, error TEXT,
    estimate_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL
  );
`);

export function saveProject(project: { id: string; topic: string; format: string; script: unknown }) {
  db.prepare("INSERT OR REPLACE INTO projects VALUES (?, ?, ?, ?, ?)").run(
    project.id, project.topic, project.format, JSON.stringify(project.script), new Date().toISOString()
  );
}

export function saveJob(job: VideoJob) {
  db.prepare("INSERT OR REPLACE INTO jobs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
    job.id, job.projectId, job.status, job.provider, job.progress, job.error ?? null,
    JSON.stringify(job.estimate), job.createdAt, job.updatedAt
  );
}

export function listJobs(): VideoJob[] {
  return (db.prepare("SELECT * FROM jobs ORDER BY created_at DESC LIMIT 20").all() as Array<Record<string, unknown>>).map((row) => ({
    id: row.id as string, projectId: row.project_id as string, status: row.status as VideoJob["status"],
    provider: row.provider as VideoJob["provider"], progress: row.progress as number, error: (row.error as string | null) ?? undefined,
    estimate: JSON.parse(row.estimate_json as string), createdAt: row.created_at as string, updatedAt: row.updated_at as string
  }));
}

export function saveSetting(key: string, value: string) {
  db.prepare("INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)")
    .run(key, value, new Date().toISOString());
}
