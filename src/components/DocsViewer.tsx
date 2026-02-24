"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { clsx } from "clsx";

interface DocsViewerProps {
  project: string;
}

export function DocsViewer({ project }: DocsViewerProps) {
  const [claudeMd, setClaudeMd] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/projects/${project}/docs`)
      .then((r) => r.json())
      .then((data) => {
        setClaudeMd(data.claudeMd);
        setFiles(data.files || []);
      })
      .catch(() => {});
  }, [project]);

  async function loadFile(name: string) {
    if (selectedFile === name) {
      setSelectedFile(null);
      setFileContent(null);
      return;
    }
    const res = await fetch(
      `/api/projects/${project}/docs?file=${encodeURIComponent(name)}`
    );
    if (res.ok) {
      const data = await res.json();
      setSelectedFile(name);
      setFileContent(data.content);
    }
  }

  if (!claudeMd && files.length === 0) return null;

  return (
    <div className="bg-card-bg border border-card-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-fg hover:text-foreground transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <FileText className="w-4 h-4" />
        Project Docs
        <span className="text-xs text-muted ml-auto">
          {files.length} file{files.length !== 1 ? "s" : ""}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-card-border">
          {claudeMd && (
            <div className="p-4 border-b border-card-border">
              <h4 className="text-xs font-medium text-muted-fg uppercase tracking-wider mb-2">
                CLAUDE.md
              </h4>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono markdown-body max-h-64 overflow-y-auto">
                {claudeMd}
              </pre>
            </div>
          )}

          {files.length > 0 && (
            <div className="p-4">
              <h4 className="text-xs font-medium text-muted-fg uppercase tracking-wider mb-2">
                Markdown Files
              </h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {files.map((f) => (
                  <button
                    key={f}
                    onClick={() => loadFile(f)}
                    className={clsx(
                      "text-xs px-2 py-1 rounded border transition-colors",
                      selectedFile === f
                        ? "bg-accent/15 text-accent border-accent/40"
                        : "bg-input-bg text-muted-fg border-input-border hover:text-foreground"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              {fileContent && selectedFile && (
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono markdown-body max-h-64 overflow-y-auto bg-input-bg p-3 rounded-lg">
                  {fileContent}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
