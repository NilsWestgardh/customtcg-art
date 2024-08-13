import { TriggerClient } from "@trigger.dev/sdk";

export const client = new TriggerClient({
  id: "CustomTCG.art",
  apiKey: process.env.TRIGGER_SECRET_KEY,
});