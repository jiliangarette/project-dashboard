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

const SYSTEM_PROMPT = `You rewrite technical git commit messages into a plain English changelog.

RULES:
1. Sort by wow factor — Lead with the most impactful, impressive, or complex work first. Read top-to-bottom from "biggest wins" to "smaller fixes."
2. CRITICAL: Don't compress or merge tasks — Each commit gets its own bullet point. If there are 20 commits, produce close to 20 bullets. Do NOT combine multiple changes into one vague summary. More bullets is ALWAYS better. The only exception is truly redundant/duplicate commits (same work described twice) — skip those. Never produce fewer than 10 bullets if there are 10+ commits.
3. Write for a non-technical CEO — Use clear, plain language. Avoid jargon, function names, file names, or developer shorthand. Describe what changed and why it matters, not how it was coded. A non-developer should read each bullet and immediately understand the value.
4. Sound human, not robotic — Write naturally. Don't use stiff, overly formal phrasing or generic filler. Each bullet should feel like you're casually but confidently explaining what you did to your boss.
5. No emoji anywhere in the output.
6. No name or signature at the bottom.
7. Use present tense — "displays", "shows", "renders", not past tense.
8. Skip meaningless commits: "fix typo", "merge branch", "update package-lock.json", "lint fix", etc.
9. The summary captures the overall focus of the period, not just a repeat of bullets.

OUTPUT FORMAT — respond with valid JSON only (no markdown, no code fences):
{
  "summary": "1-2 sentence casual summary of the work",
  "bullets": ["bullet 1", "bullet 2", ...]
}

GOOD example bullet:
- "Campaign wizard now lets agency owners choose which page and ad account to use per campaign, so each client gets the right setup without manual switching"

BAD examples (never produce):
- "Fix regional_regulation_identities keys to flat format: singapore_universal_beneficiary/payer" (too technical)
- "Dashboard redesigned" (too brief/vague)
- "Updated index.ts and fixed the onClick handler in Button.tsx" (file names)`;

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

    // Deduplicate commits by first-line message (merge commits, CI reruns, etc.)
    const seen = new Set<string>();
    const uniqueCommits = commits.filter((c) => {
      const key = c.message.split("\n")[0].trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Cap at 200 unique commits to keep prompt within model limits
    const capped = uniqueCommits.slice(0, 200);

    // Build the commit list for the prompt
    const commitList = capped
      .map((c, i) => `${i + 1}. ${c.message.split("\n")[0].trim()}`)
      .join("\n");

    const commitNote = uniqueCommits.length > 200
      ? `\n(Showing 200 of ${uniqueCommits.length} unique commits — cover all major work)\n`
      : "";

    const userPrompt = `Date: ${date}
${commitNote}
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

      const selectedModel = model || "liquid/lfm-2.5-1.2b-instruct:free";

      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Project Dashboard",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("OpenRouter API error:", response.status, errorData);
        let msg = "Failed to generate changelog via OpenRouter";
        if (response.status === 429) {
          msg = "AI provider rate limited. Wait a moment and try again.";
        } else if (errorData?.error?.message) {
          msg = `OpenRouter: ${errorData.error.message}`;
        } else if (response.status === 401) {
          msg = "OpenRouter API key is invalid or expired.";
        } else if (response.status === 402) {
          msg = "OpenRouter: Insufficient credits.";
        }
        return NextResponse.json(
          { error: msg },
          { status: response.status }
        );
      }

      const data = await response.json();
      const message = data.choices[0].message;
      // Handle reasoning-only models that return content in reasoning instead
      content = message.content;
      if (!content && message.reasoning) {
        // Try to extract JSON from reasoning text
        const reasoning = typeof message.reasoning === "string"
          ? message.reasoning
          : message.reasoning_details?.map((r: { text: string }) => r.text).join("") || "";
        const jsonMatch = reasoning.match(/\{[\s\S]*"summary"[\s\S]*"bullets"[\s\S]*\}/);
        if (jsonMatch) {
          content = jsonMatch[0];
        } else {
          throw new Error(`Model "${selectedModel}" did not return usable content. Try a different model in Settings.`);
        }
      }
      if (!content) {
        throw new Error(`Model "${selectedModel}" returned empty response. Try a different model in Settings.`);
      }
    } else if (provider === "openai") {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return NextResponse.json(
          { error: "OpenAI API key not configured" },
          { status: 500 }
        );
      }

      const selectedOpenAIModel = model || "gpt-4.1-nano";
      // Newer models (gpt-5*, gpt-4.1*) require max_completion_tokens instead of max_tokens
      const useNewTokenParam = /^(gpt-5|gpt-4\.1)/.test(selectedOpenAIModel);

      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedOpenAIModel,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          ...(useNewTokenParam
            ? { max_completion_tokens: 32000 }
            : { max_tokens: 32000 }),
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
