import type { ProviderName } from "@/src/lib/types";
import type { TextProvider } from "./interfaces";
import { MockTextProvider } from "./mock";
import { OmniRouteTextProvider, UnsupportedRemoteTextProvider } from "./remote";

export function getTextProvider(name = process.env.TEXT_PROVIDER ?? "mock"): TextProvider {
  switch (name as ProviderName) {
    case "mock": return new MockTextProvider();
    case "omniroute": return new OmniRouteTextProvider();
    case "runway":
    case "luma":
    case "kling": return new UnsupportedRemoteTextProvider(name as "runway" | "luma" | "kling");
    default: throw new Error(`Unknown text provider "${name}".`);
  }
}
