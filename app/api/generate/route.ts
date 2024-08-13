import { NextRequest } from "next/server";
import fetch from "node-fetch";

export const maxDuration = 45;

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  if (!process.env["OPENAI_API_KEY"]) {
    return new Response(JSON.stringify({ 
      error: "OpenAI API key is not set.",
      details: "Server configuration error"
    }), { status: 500 });
  }

  try {
    const { prompt } = await req.json();

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env["OPENAI_API_KEY"]}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      }),
      timeout: 45000,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({ 
        error: `API call failed: ${response.statusText}`,
        status: response.status,
        details: errorData
      }), { status: response.status });
    }

    const responseData = await response.json() as { data: { url: string }[] };
    const openAiImageUrl = responseData.data[0]?.url;

    if (!openAiImageUrl) {
      return new Response(JSON.stringify({ 
        error: "Image URL not found in the API response.",
        details: responseData
      }), { status: 500 });
    }

    return new Response(JSON.stringify({ 
      imageUrl: openAiImageUrl 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "An unexpected error occurred during image generation.",
      details: error instanceof Error ? error.message : String(error)
    }), { status: 500 });
  }
}