import { NextResponse } from "next/server";

interface CommitData {
  message: string;
  author: string;
}

interface GenerateRequest {
  date: string;
  commits: CommitData[];
  provider?: "openrouter" | "openai" | "anthropic";
  model?: string;
}

const SYSTEM_PROMPT = `You are an AI that rewrites technical git commit messages into plain English changelogs that anyone can understand.

WRITING RULES (you MUST follow these):
1. Write for a non-technical reader - no jargon, no file names, no function names
2. Sound human - casual but confident, not robotic
3. NO EMOJI anywhere
4. Each bullet: 1-2 sentences explaining the change from user/product perspective
5. If multiple commits are related, combine into one bullet
6. Skip meaningless commits entirely: "fix typo", "merge branch", "update package-lock.json", "lint fix", etc.
7. Skip merge commits with no meaningful description
8. The daily summary should capture overall vibe and focus, not just repeat bullets

OUTPUT FORMAT:
You must respond with valid JSON only (no markdown, no code fences):
{
  "summary": "1-2 sentence casual summary of the day's work",
  "bullets": ["bullet 1", "bullet 2", ...]
}

GOOD EXAMPLES:
- "Campaign now lets agency owners choose which page and ad account to use per campaign, so each client gets the right setup without manual switching"
- "The dashboard loads about twice as fast now because we stopped re-fetching data that was already on screen"
- "Added a confirmation step before deleting a project, so you can't accidentally wipe something out with one click"

BAD EXAMPLES (never produce):
- "Fix regional_regulation_identities keys to flat format" (too technical)
- "Dashboard redesigned" (too vague)
- "Updated index.ts and fixed the onClick handler in Button.tsx" (file names)
- "Various bug fixes and improvements" (meaningless)`;

export async function POST(request: Request) {
  try {
    const body: GenerateRequest = await request.json();
    const { date, commits, provider = "openrouter", model } = body;

    if (!commits || commits.length === 0) {
      return NextResponse.json(
        { error: "No commits provided" },
        { status: 400 }
      );
    }

    // Build the commit list for the prompt
    const commitList = commits
      .map((c, i) => `${i + 1}. ${c.message.split("\n")[0].trim()}`)
      .join("\n");

    const userPrompt = `Date: ${date}

Commits:
${commitList}

Rewrite these commits into a daily changelog following the rules. Output JSON only.`;

    let response: Response;
    let content: string;

    if (provider === "openrouter") {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "OpenRouter API key not configured" },
          { status: 500 }
        );
      }

      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Project Dashboard",
        },
        body: JSON.stringify({
          model: model || "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenRouter API error:", errorData);
        const msg = response.status === 429
          ? "AI provider rate limited. Wait a moment and try again."
          : "Failed to generate changelog via OpenRouter";
        return NextResponse.json(
          { error: msg },
          { status: response.status }
        );
      }

      const data = await response.json();
      content = data.choices[0].message.content;
    } else if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "OpenAI API key not configured" },
          { status: 500 }
        );
      }

      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenAI API error:", errorData);
        const msg = response.status === 429
          ? "OpenAI rate limited. Wait a moment and try again."
          : "Failed to generate changelog via OpenAI";
        return NextResponse.json(
          { error: msg },
          { status: response.status }
        );
      }

      const data = await response.json();
      content = data.choices[0].message.content;
    } else if (provider === "anthropic") {
      const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "Anthropic API key not configured" },
          { status: 500 }
        );
      }

      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model || "claude-sonnet-4-5",
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Anthropic API error:", errorData);
        const msg = response.status === 429
          ? "Anthropic rate limited. Wait a moment and try again."
          : "Failed to generate changelog via Anthropic";
        return NextResponse.json(
          { error: msg },
          { status: response.status }
        );
      }

      const data = await response.json();
      content = data.content[0].text;
    } else {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    // Parse JSON from response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // If response isn't pure JSON, try to extract JSON from markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Could not parse response as JSON");
      }
    }

    if (!parsed.summary || !Array.isArray(parsed.bullets)) {
      throw new Error("Invalid response format");
    }

    return NextResponse.json({
      date,
      summary: parsed.summary,
      bullets: parsed.bullets,
    });
  } catch (error) {
    console.error("Error generating changelog:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate changelog" },
      { status: 500 }
    );
  }
}
