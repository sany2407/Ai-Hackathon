// app/api/chat/route.ts
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const response = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: "Error calling LangGraph service" }),
      { status: 500 }
    );
  }

  const data = await response.json();
  return new Response(
    JSON.stringify({ role: "assistant", content: data.reply }),
    { status: 200 }
  );
}
