import { z } from "zod";

export const generateInputSchema = z.object({
  topic: z.string().trim().min(3, "Topic must be at least 3 characters").max(160),
  format: z.enum(["short", "story", "listicle", "explainer"])
});

export const renderInputSchema = z.object({
  projectId: z.string().min(1),
  script: z.string().trim().min(20, "Add more detail to the script before rendering").max(20000)
});

export type GenerateInput = z.infer<typeof generateInputSchema>;
