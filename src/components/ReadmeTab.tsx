"use client";

import { useState, useEffect } from "react";
import { FileText, ExternalLink } from "lucide-react";

interface ReadmeTabProps {
  owner: string;
  repo: string;
}

// Simple markdown-to-HTML renderer for common patterns
function renderMarkdown(md: string): string {
  let html = md
    // Code blocks (fenced)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-input-bg p-4 rounded-lg overflow-x-auto mb-4 text-sm"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-input-bg px-1.5 py-0.5 rounded text-sm">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-foreground mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold text-foreground mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-foreground mt-8 mb-4">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" loading="lazy" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">$1</a>')
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="border-card-border my-6" />')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, '</p><p class="mb-3 text-foreground/90 leading-relaxed">')
    // Single newlines within paragraphs
    .replace(/\n/g, '<br />');

  // Wrap list items
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/g, '<ul class="list-disc mb-4">$&</ul>');

  return `<p class="mb-3 text-foreground/90 leading-relaxed">${html}</p>`;
}

export function ReadmeTab({ owner, repo }: ReadmeTabProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadReadme() {
      try {
        setLoading(true);
        const response = await fetch(`/api/repo/${owner}/${repo}/file/README.md`);

        if (response.status === 404) {
          setNotFound(true);
          return;
        }

        if (!response.ok) throw new Error("Failed to load README");

        const data = await response.json();
        setContent(data.content || null);
      } catch (err) {
        console.error("Error loading README:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadReadme();
  }, [owner, repo]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-card-bg border border-card-border rounded-lg p-6">
          <div className="h-8 bg-muted/20 rounded w-1/3 mb-4" />
          <div className="h-4 bg-muted/20 rounded w-full mb-2" />
          <div className="h-4 bg-muted/20 rounded w-5/6 mb-2" />
          <div className="h-4 bg-muted/20 rounded w-4/6 mb-4" />
          <div className="h-4 bg-muted/20 rounded w-full mb-2" />
          <div className="h-4 bg-muted/20 rounded w-3/4" />
        </div>
      </div>
    );
  }

  if (notFound || !content) {
    return (
      <div className="bg-card-bg border border-card-border rounded-lg p-12 text-center">
        <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
        <p className="text-muted-fg mb-2">No README.md found</p>
        <p className="text-sm text-muted">
          Add a README.md to your repository to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">README</h2>
        <a
          href={`https://github.com/${owner}/${repo}#readme`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-muted-fg hover:text-accent transition-colors"
        >
          View on GitHub
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="bg-card-bg border border-card-border rounded-lg p-5 sm:p-8">
        <div
          className="markdown-body prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      </div>
    </div>
  );
}
