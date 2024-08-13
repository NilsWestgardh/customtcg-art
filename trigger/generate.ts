import { task } from "@trigger.dev/sdk/v3";
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
    console.log("Starting generate task");
    console.log("Prompt:", payload.prompt);
    
    try {
      console.log("Calling OpenAI API");
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: payload.prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
      });
      
      console.log("OpenAI API response received");

      if (!response.data || !response.data[0] || response.data[0] === undefined) {
        throw new Error("Error generating image: No data in response");
      }

      const image = response.data[0].url;

      if (image === undefined) throw new Error("Generated image URL is undefined");

      console.log("Image URL:", image);
      return image;
    } catch (error) {
      console.error("Error in generate task:", error);
      throw error;
    }
  },
});