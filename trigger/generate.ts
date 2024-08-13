import { task, logger } from "@trigger.dev/sdk/v3";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generate = task({
  id: "generate",
  retry: {
    maxAttempts: 1,
  },
  run: async (payload: { prompt: string }) => {
    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: payload.prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
      })
  
      if (!response.data || !response.data[0] || response.data[0] === undefined) {
        throw new Error("Error generating image");
      }

      const image = response.data[0].url;

      if (image === undefined) throw new Error("Generated image undefined");

      return response.data[0].url;
    } catch (error) {
      throw new Error("Error generating image");
    }
  },
})