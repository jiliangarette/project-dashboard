"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "@/components/Toast";
import {
  DEFAULT_AI_SETTINGS,
  readAiSettings,
  writeAiSettings,
  type AiProvider,
  type AiSettings,
} from "@/lib/ai";

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [relayStatus, setRelayStatus] = useState<{ online: boolean; text: string } | null>(null);
  const [checkingRelay, setCheckingRelay] = useState(false);

  useEffect(() => {
    setSettings(readAiSettings());
  }, []);

  const checkRelay = useCallback(async () => {
    setCheckingRelay(true);
    try {
      const res = await fetch("/api/relay/status", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      setRelayStatus(
        data.online
          ? { online: true, text: "Online" }
          : { online: false, text: data.error || "Could not check Jarvis. Try again." }
      );
    } catch {
      setRelayStatus({ online: false, text: "Could not check Jarvis. Try again." });
    } finally {
      setCheckingRelay(false);
    }
  }, []);

  useEffect(() => {
    if (settings.aiProvider === "local") checkRelay();
  }, [settings.aiProvider, checkRelay]);

  const handleSave = () => {
    writeAiSettings(settings);
    setSaved(true);
    toast("success", "Settings saved");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearCache = () => {
    if (confirm("Clear all cached changelogs? They'll regenerate on next visit.")) {
      const keys = Object.keys(localStorage);
      let count = 0;
      keys.forEach((key) => {
        if (key.startsWith("changelog:")) {
          localStorage.removeItem(key);
          count++;
        }
      });
      toast("success", `Cleared ${count} cached changelogs`);
    }
  };

  const handleClearPins = () => {
    if (confirm("Clear all pinned repositories?")) {
      localStorage.removeItem("pinnedRepos");
      toast("success", "Pinned repos cleared");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-fg hover:text-foreground transition-colors py-2 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>

      <div className="space-y-4 sm:space-y-6">
        {/* AI Provider Selection */}
        <div className="bg-card-bg border border-card-border rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
            AI Changelog Generation
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Provider
              </label>
              <select
                value={settings.aiProvider}
                onChange={(e) =>
                  setSettings({ ...settings, aiProvider: e.target.value as AiProvider })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
              >
                <option value="local">Jarvis (Claude Code on your laptop)</option>
                <option value="openrouter">OpenRouter (FREE models available)</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
              </select>
            </div>

            {settings.aiProvider === "local" && (
              <div className="flex flex-wrap items-center gap-3">
                <span
                  role="status"
                  aria-live="polite"
                  className={`inline-flex items-center gap-2 text-sm ${
                    relayStatus?.online && !checkingRelay ? "text-green-400" : "text-muted-fg"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      checkingRelay || !relayStatus
                        ? "bg-muted-fg"
                        : relayStatus.online
                          ? "bg-green-400"
                          : "bg-red-400"
                    }`}
                  />
                  {checkingRelay || !relayStatus ? "Checking Jarvis..." : relayStatus.text}
                </span>
                <button
                  type="button"
                  onClick={checkRelay}
                  disabled={checkingRelay}
                  className="px-4 py-2 rounded-lg border border-card-border hover:bg-foreground/5 text-foreground text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  Check again
                </button>
              </div>
            )}

            {settings.aiProvider === "openrouter" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  OpenRouter Model
                </label>
                <select
                  value={settings.openrouterModel}
                  onChange={(e) =>
                    setSettings({ ...settings, openrouterModel: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                >
                  <option value="liquid/lfm-2.5-1.2b-instruct:free">
                    Liquid LFM 1.2B (FREE)
                  </option>
                  <option value="nvidia/nemotron-nano-9b-v2:free">
                    Nemotron Nano 9B (FREE)
                  </option>
                  <option value="google/gemma-3n-e2b-it:free">
                    Gemma 3N E2B (FREE)
                  </option>
                  <option value="google/gemini-flash-1.5">Gemini Flash 1.5</option>
                  <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                </select>
                <p className="text-sm text-muted-fg mt-1">
                  Free models have no cost. Paid models use your OpenRouter credits.
                </p>
              </div>
            )}

            {settings.aiProvider === "openai" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  OpenAI Model
                </label>
                <select
                  value={settings.openaiModel}
                  onChange={(e) =>
                    setSettings({ ...settings, openaiModel: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                >
                  <option value="gpt-4.1-nano">GPT-4.1 Nano (default)</option>
                  <option value="gpt-5-mini">GPT-5 Mini</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                </select>
              </div>
            )}

            {settings.aiProvider === "anthropic" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Anthropic Model
                </label>
                <select
                  value={settings.anthropicModel}
                  onChange={(e) =>
                    setSettings({ ...settings, anthropicModel: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]"
                >
                  <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
                  <option value="claude-opus-4-6">Claude Opus 4.6</option>
                </select>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>

        {/* Cache Management */}
        <div className="bg-card-bg border border-card-border rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
            Cache Management
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleClearCache}
              className="w-full px-4 py-3 rounded-lg border border-card-border hover:bg-foreground/5 text-foreground transition-colors text-left min-h-[44px]"
            >
              Clear Changelog Cache
            </button>
            <button
              onClick={handleClearPins}
              className="w-full px-4 py-3 rounded-lg border border-card-border hover:bg-foreground/5 text-foreground transition-colors text-left min-h-[44px]"
            >
              Clear Pinned Repositories
            </button>
          </div>
        </div>

        {/* API Keys Info */}
        <div className="bg-card-bg border border-card-border rounded-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
            API Keys Required
          </h2>
          <div className="space-y-2 text-sm text-muted-fg">
            <p>
              <strong>Jarvis:</strong> Needs no key. It runs Claude Code on your laptop.
            </p>
            <p>
              <strong>OpenRouter:</strong> Add OPENROUTER_API_KEY to your .env file
            </p>
            <p>
              <strong>OpenAI:</strong> Add OPENAI_API_KEY to your .env file
            </p>
            <p>
              <strong>Anthropic:</strong> Add ANTHROPIC_API_KEY to your .env file
            </p>
            <p className="mt-4 text-accent">
              Only the key for your selected provider is required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
