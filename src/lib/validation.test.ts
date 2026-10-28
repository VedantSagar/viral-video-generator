import { describe, expect, it } from "vitest";
import { generateInputSchema, renderInputSchema } from "./validation";

describe("validation", () => {
  it("requires a useful topic", () => expect(() => generateInputSchema.parse({ topic: "x", format: "short" })).toThrow());
  it("accepts supported formats", () => expect(generateInputSchema.parse({ topic: "space facts", format: "short" }).format).toBe("short"));
  it("requires an editable script", () => expect(() => renderInputSchema.parse({ projectId: "p", script: "too short" })).toThrow());
});
