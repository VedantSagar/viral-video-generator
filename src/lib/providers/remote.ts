import type { GenerateInput } from "@/src/lib/validation";
import type { ScriptDraft } from "@/src/lib/types";
import type { TextProvider } from "./interfaces";

export class OmniRouteTextProvider implements TextProvider {
  readonly name = "omniroute";
  async generateScript(_input: GenerateInput): Promise<ScriptDraft> {
    if (!process.env.OMNIROUTE_BASE_URL || !process.env.OMNIROUTE_API_KEY || !process.env.OMNIROUTE_TEXT_PATH) {
      throw new Error("OmniRoute requires OMNIROUTE_BASE_URL, OMNIROUTE_API_KEY, and documented OMNIROUTE_TEXT_PATH.");
    }
    throw new Error("OmniRoute adapter boundary is configured; add the documented deployment payload before enabling live calls.");
  }
}

export class UnsupportedRemoteTextProvider implements TextProvider {
  constructor(public readonly name: "runway" | "luma" | "kling") {}
  async generateScript(_input: GenerateInput): Promise<ScriptDraft> {
    throw new Error(`${this.name} adapter is not configured in this MVP. Use mock or add the official API integration.`);
  }
}
