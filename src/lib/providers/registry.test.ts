import { describe, expect, it } from "vitest";
import { getTextProvider } from "./registry";

describe("provider selection", () => {
  it("uses mock", () => expect(getTextProvider("mock").name).toBe("mock"));
  it("rejects unknown providers", () => expect(() => getTextProvider("bad")).toThrow("Unknown text provider"));
  it("keeps remote adapters explicit", async () => {
    await expect(getTextProvider("runway").generateScript({ topic: "test topic", format: "short" })).rejects.toThrow("not configured");
  });
});
