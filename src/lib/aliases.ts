export interface RepoAliases {
  [repoId: number]: string;
}

export async function fetchAliases(): Promise<RepoAliases> {
  try {
    const res = await fetch("/api/aliases");
    if (!res.ok) return {};
    const data = await res.json();
    // API stores keys as strings, convert to number keys
    const aliases: RepoAliases = {};
    for (const [key, value] of Object.entries(data)) {
      aliases[Number(key)] = value as string;
    }
    return aliases;
  } catch {
    return {};
  }
}

export async function saveAlias(repoId: number, alias: string): Promise<RepoAliases> {
  try {
    const res = await fetch("/api/aliases", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoId, alias }),
    });
    if (!res.ok) throw new Error("Failed to save alias");
    const data = await res.json();
    const aliases: RepoAliases = {};
    for (const [key, value] of Object.entries(data)) {
      aliases[Number(key)] = value as string;
    }
    return aliases;
  } catch {
    return {};
  }
}
