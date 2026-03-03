"use client";

import { useMemo } from "react";

interface LanguageChartProps {
  repos: { language: string | null }[];
}

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  "C#": "#178600",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Vue: "#41b883",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
};

export function LanguageChart({ repos }: LanguageChartProps) {
  const languageData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) {
        counts[repo.language] = (counts[repo.language] || 0) + 1;
      }
    }

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
        color: languageColors[name] || "#8b949e",
      }))
      .sort((a, b) => b.count - a.count);
  }, [repos]);

  if (languageData.length === 0) return null;

  return (
    <div className="bg-card-bg border border-card-border rounded-xl p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">Languages</h3>

      {/* Stacked bar */}
      <div className="flex rounded-full overflow-hidden h-2.5 mb-3">
        {languageData.map((lang) => (
          <div
            key={lang.name}
            className="transition-all"
            style={{
              width: `${Math.max(lang.percentage, 2)}%`,
              backgroundColor: lang.color,
            }}
            title={`${lang.name}: ${lang.percentage}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {languageData.slice(0, 6).map((lang) => (
          <div key={lang.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-muted-fg">
              {lang.name} <span className="text-foreground font-medium">{lang.percentage}%</span>
            </span>
          </div>
        ))}
        {languageData.length > 6 && (
          <span className="text-muted text-xs">+{languageData.length - 6} more</span>
        )}
      </div>
    </div>
  );
}
