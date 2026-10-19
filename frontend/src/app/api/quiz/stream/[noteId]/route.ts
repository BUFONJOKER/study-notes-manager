import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params;

  // 1. Grab the OpenAI key sent from the client headers
  const apiKey = request.headers.get("x-openai-key");
  // const authHeader = request.headers.get("authorization");
  if (!apiKey) {
    return NextResponse.json(
      { detail: "OpenAI API key is missing in request headers." },
      { status: 400 }
    );
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  try {
    // 2. Forward the request to FastAPI, explicitly passing the X-OpenAI-Key header
    const backendResponse = await fetch(`${backendUrl}/notes/quiz_generation/${encodeURIComponent(noteId)}`, {
      method: "POST",
      headers: {
        "Accept": "text/event-stream",
        "X-OpenAI-Key": apiKey, // 👈 Crucial: Forward the key to FastAPI!
        // Forward authorization token if needed as well:
        ...(request.headers.get("authorization")
          ? { "Authorization": request.headers.get("authorization")! }
          : {}),
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      return NextResponse.json(
        { detail: errorText || "Backend quiz generation failed." },
        { status: backendResponse.status }
      );
    }

    // 3. Stream the response back to the frontend client
    return new NextResponse(backendResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : "Proxy connection failed." },
      { status: 500 }
    );
  }
}