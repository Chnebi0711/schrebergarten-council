import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const AGENT_MODEL       = "claude-haiku-4-5-20251001";
const MODERATOR_MODEL   = "claude-sonnet-4-5-20250929";

export async function POST(req: NextRequest) {
  try {
    // ── Auth check ────────────────────────────────────────────
    const cookieStore = await cookies();
    const session = cookieStore.get("sc_session");
    if (!session || session.value !== process.env.ACCESS_PASSWORD) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    // ── API key from server env only ──────────────────────────
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server misconfigured — ANTHROPIC_API_KEY missing" }, { status: 500 });
    }

    const { systemPrompt, userMessage, maxTokens, isModerator } = await req.json();
    const model = isModerator ? MODERATOR_MODEL : AGENT_MODEL;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens ?? 400,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic error:", JSON.stringify(data));
      return NextResponse.json(
        { error: data?.error?.message ?? `Anthropic error ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ text: data.content[0].text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
