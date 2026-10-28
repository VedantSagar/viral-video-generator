import type { YouTubePublisher } from "./interfaces";

export class DisabledYouTubePublisher implements YouTubePublisher {
  readonly name = "disabled";

  async uploadPrivateDraft(): Promise<{ externalId: string }> {
    throw new Error("YouTube publishing is disabled. Configure OAuth and explicitly enable the publisher before uploading.");
  }
}
