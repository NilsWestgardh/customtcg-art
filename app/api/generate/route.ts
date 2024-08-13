import { NextRequest } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { generate } from "@/trigger/generate";

export async function POST(
  req: NextRequest
) {
  if (req.method === "POST") {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ 
        error: 'Prompt is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const handle = await tasks.trigger<typeof generate>("generate", { prompt })

    return Response.json(handle)

  } else {
    return new Response(null, { status: 405 });
  }
}