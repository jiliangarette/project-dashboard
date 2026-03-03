"use client";

import { useEffect, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { Search, Github } from "lucide-react";

export default function DemoPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("jiliangarette");
  const [inputUsername, setInputUsername] = useState("jiliangarette");
  const [error, setError] = useState<string | null>(null);

  async function loadRepos(user: string) {
    if (!user.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`User "${user}" not found on GitHub`);
        }
        throw new Error("Failed to fetch repos");
      }
      
      const data = await response.json();
      setRepos(data);
      setUsername(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRepos("jiliangarette");
  }, []);

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadRepos(inputUsername);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            GitHub Repository Dashboard
          </h1>
          <p className="text-muted-fg">
            Track any GitHub user's public repositories without authentication
          </p>
        </div>

        {/* Username Input */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-md">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-fg" />
              <input
                type="text"
                placeholder="Enter GitHub username..."
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Load Repos"}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-500/20 bg-red-500/10">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Current User */}
        {repos.length > 0 && (
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-fg">
            <span>Showing repositories for:</span>
            <span className="font-mono text-accent">{username}</span>
            <span>•</span>
            <span>{repos.length} public repos</span>
          </div>
        )}

        {/* Search Bar */}
        {repos.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-fg" />
              <input
                type="text"
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-card-border bg-card-bg text-foreground placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-card-bg border border-card-border rounded-lg" />
            ))}
          </div>
        )}

        {/* Repos Grid */}
        {!loading && filteredRepos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRepos.map((repo) => (
              <ProjectCard key={repo.id} repo={repo} isPinned={false} onTogglePin={() => {}} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && repos.length > 0 && filteredRepos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-fg">No repositories match your search.</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && repos.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-muted-fg">Enter a GitHub username above to view their public repositories.</p>
          </div>
        )}
      </div>
    </div>
  );
}
