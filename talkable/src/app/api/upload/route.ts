import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { html_content, doc_id, metadata } = body;
    const response = await fetch("http://localhost:8000/store_html", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html_content, doc_id, metadata }),
    });
    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to proxy to ChromaDB backend." }),
      { status: 500 }
    );
  }
}
