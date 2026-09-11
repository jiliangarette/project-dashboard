export type AiProvider = "local" | "openrouter" | "openai" | "anthropic";

export interface AiSettings {
  aiProvider: AiProvider;
  openrouterModel: string;
  openaiModel: string;
  anthropicModel: string;
}

export interface ChangelogCommit {
  message: string;
  author?: string;
}

export interface ChangelogResult {
  date: string;
  summary: string;
  bullets: string[];
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  aiProvider: "local",
  openrouterModel: "liquid/lfm-2.5-1.2b-instruct:free",
  openaiModel: "gpt-4.1-nano",
  anthropicModel: "claude-sonnet-4-5",
};

export const AI_SETTINGS_KEY = "changelog-settings-v2";

export const OFFLINE_MESSAGE = "Jarvis is offline. The laptop is asleep or the bridge is down.";

const PROVIDERS: AiProvider[] = ["local", "openrouter", "openai", "anthropic"];
const GENERATE_LIMIT_MS = 6 * 60 * 1000;
const POLL_GAP_MS = 1000;

export const readAiSettings = (): AiSettings => {
  try {
    const stored = localStorage.getItem(AI_SETTINGS_KEY);
    const merged: AiSettings = { ...DEFAULT_AI_SETTINGS, ...(stored ? JSON.parse(stored) : {}) };
    return PROVIDERS.includes(merged.aiProvider)
      ? merged
      : { ...merged, aiProvider: DEFAULT_AI_SETTINGS.aiProvider };
  } catch {
    return { ...DEFAULT_AI_SETTINGS };
  }
};

export const writeAiSettings = (s: AiSettings) => {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(s));
};

export const providerModel = (s: AiSettings): { provider: AiProvider; model: string | undefined } => {
  if (s.aiProvider === "openrouter") {
    return { provider: "openrouter", model: s.openrouterModel || DEFAULT_AI_SETTINGS.openrouterModel };
  }
  if (s.aiProvider === "openai") {
    return { provider: "openai", model: s.openaiModel || DEFAULT_AI_SETTINGS.openaiModel };
  }
  if (s.aiProvider === "anthropic") {
    return { provider: "anthropic", model: s.anthropicModel || DEFAULT_AI_SETTINGS.anthropicModel };
  }
  return { provider: "local", model: undefined };
};

const readJson = (res: Response) => res.json().catch(() => ({}));

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateChangelog = async ({
  date,
  commits,
  provider,
  model,
}: {
  date: string;
  commits: ChangelogCommit[];
  provider: AiProvider;
  model?: string;
}): Promise<ChangelogResult> => {
  const signal = AbortSignal.timeout(GENERATE_LIMIT_MS);
  try {
    let res = await fetch("/api/changelog/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, commits, provider, model }),
      signal,
    });
    let data = await readJson(res);
    while (res.status === 202) {
      if (typeof data.job !== "string") throw new Error("Jarvis did not return a job id");
      await pause(POLL_GAP_MS);
      res = await fetch(`/api/changelog/generate?job=${encodeURIComponent(data.job)}`, {
        cache: "no-store",
        signal,
      });
      data = await readJson(res);
    }
    if (!res.ok) throw new Error(data.error || "Failed to generate");
    return data;
  } catch (error) {
    if (signal.aborted) throw new Error("Jarvis took longer than 6 minutes. Try again.");
    throw error;
  }
};
