export interface RepoAliases {
  [repoId: number]: string;
}

const STORAGE_KEY = "repo-aliases";

export async function fetchAliases(): Promise<RepoAliases> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const aliases: RepoAliases = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string" && value.trim()) {
        aliases[Number(key)] = value as string;
      }
    }
    return aliases;
  } catch {
    return {};
  }
}

export async function saveAlias(repoId: number, alias: string): Promise<RepoAliases> {
  const aliases = await fetchAliases();
  const trimmed = (alias || "").trim();
  if (!trimmed) {
    delete aliases[repoId];
  } else {
    aliases[repoId] = trimmed;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(aliases));
  return aliases;
}
