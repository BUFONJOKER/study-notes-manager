
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ noteId: string }>;
};

export async function GET(
  req: NextRequest,
  { params }: RouteContext,
) {
  const session = await getServerSession(authOptions);
  const token = (session as { accessToken?: string } | null)?.accessToken;

  if (!token) {
    return Response.json(
      { detail: "Unauthorized" },
      { status: 401 },
    );
  }

  const { noteId } = await params;
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    return Response.json(
      { detail: "Backend API URL is not configured." },
      { status: 500 },
    );
  }

  try {
    // Your FastAPI endpoint is POST, even though this proxy is GET.
    const upstream = await fetch(
      `${backendUrl.replace(/\/+$/, "")}/notes/quiz_generation/${encodeURIComponent(noteId)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        cache: "no-store",
        signal: req.signal,
      },
    );

    // Preserve normal HTTP errors from FastAPI.
    if (!upstream.ok) {
      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          "Content-Type":
            upstream.headers.get("content-type") ??
            "application/json",
          "Cache-Control": "no-store",
        },
      });
    }

    if (!upstream.body) {
      return Response.json(
        { detail: "Backend returned an empty stream." },
        { status: 502 },
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    if (req.signal.aborted) {
      return new Response(null, { status: 204 });
    }

    console.error("Quiz streaming proxy failed:", error);

    return Response.json(
      { detail: "Unable to connect to the quiz generation service." },
      { status: 502 },
    );
  }
}
