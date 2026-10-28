#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
const output = process.argv[3] ?? "./data/rendered-video.mp4";

if (!input) {
  console.error("Usage: node scripts/render-local.mjs <script.json> [output.mp4]");
  process.exit(1);
}

const script = JSON.parse(fs.readFileSync(input, "utf8"));
if (!Array.isArray(script.scenes) || script.scenes.length === 0) {
  throw new Error("script.json must contain a non-empty scenes array.");
}

const outputPath = path.resolve(output);
const workDir = path.dirname(outputPath);
const subtitlePath = path.join(workDir, `${path.basename(outputPath, ".mp4")}.srt`);
fs.mkdirSync(workDir, { recursive: true });

let elapsed = 0;
const subtitles = script.scenes.map((scene, index) => {
  const start = elapsed;
  elapsed += Number(scene.seconds) || 10;
  const end = elapsed;
  const timestamp = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remaining = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")},000`;
  };
  return `${index + 1}\n${timestamp(start)} --> ${timestamp(end)}\n${scene.narration}\n`;
}).join("\n");

fs.writeFileSync(subtitlePath, subtitles);
const duration = Math.max(elapsed, 1).toString();

execFileSync("ffmpeg", [
  "-y",
  "-f", "lavfi",
  "-i", `color=c=0x101a33:s=1080x1920:r=30:d=${duration}`,
  "-vf", `subtitles=${subtitlePath}:force_style='FontName=DejaVu Sans,FontSize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Alignment=5,MarginV=180'`,
  "-c:v", "libx264",
  "-preset", "veryfast",
  "-pix_fmt", "yuv420p",
  "-movflags", "+faststart",
  outputPath
], { stdio: "inherit" });

console.log(`Created ${outputPath}`);
