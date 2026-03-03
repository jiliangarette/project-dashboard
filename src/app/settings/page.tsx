"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

interface Settings {
  aiProvider: "openrouter" | "openai" | "anthropic";
  openrouterModel: string;
  openaiModel: string;
  anthropicModel: string;
}

const DEFAULT_SETTINGS: Settings = {
  aiProvider: "openrouter",
  openrouterModel: "meta-llama/llama-3.1-8b-instruct:free",
  openaiModel: "gpt-4o-mini",
  anthropicModel: "claude-sonnet-4-5",
};

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("changelog-settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("changelog-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearCache = () => {
    if (confirm("Clear all cached changelogs? They'll regenerate on next visit.")) {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith("changelog:")) {
          localStorage.removeItem(key);
        }
      });
      alert("Cache cleared!");
    }
  };

  const handleClearPins = () => {
    if (confirm("Clear all pinned repositories?")) {
      localStorage.removeItem("pinnedRepos");
      alert("Pinned repos cleared!");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-fg hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold text-foreground mb-6">Settings</h1>

        <div className="space-y-6">
          {/* AI Provider Selection */}
          <div className="bg-card-bg border border-card-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
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
                    setSettings({ ...settings, aiProvider: e.target.value as any })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="openrouter">OpenRouter (FREE models available)</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                </select>
              </div>

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
                    className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="meta-llama/llama-3.1-8b-instruct:free">
                      Llama 3.1 8B (FREE)
                    </option>
                    <option value="meta-llama/llama-3.1-70b-instruct:free">
                      Llama 3.1 70B (FREE)
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
                    className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini (cheapest)</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
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
                    className="w-full px-4 py-2 rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="claude-sonnet-4-5">Claude Sonnet 4.5</option>
                    <option value="claude-opus-4-6">Claude Opus 4.6</option>
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors"
            >
              <Save className="w-4 h-4" />
              {saved ? "Saved!" : "Save Settings"}
            </button>
          </div>

          {/* Cache Management */}
          <div className="bg-card-bg border border-card-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Cache Management
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleClearCache}
                className="w-full px-4 py-2 rounded-lg border border-card-border hover:bg-foreground/5 text-foreground transition-colors text-left"
              >
                Clear Changelog Cache
              </button>
              <button
                onClick={handleClearPins}
                className="w-full px-4 py-2 rounded-lg border border-card-border hover:bg-foreground/5 text-foreground transition-colors text-left"
              >
                Clear Pinned Repositories
              </button>
            </div>
          </div>

          {/* API Keys Info */}
          <div className="bg-card-bg border border-card-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              API Keys Required
            </h2>
            <div className="space-y-2 text-sm text-muted-fg">
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
    </div>
  );
}
