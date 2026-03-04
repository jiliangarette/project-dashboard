/**
 * Tag management utilities for project organization
 */

export interface RepoTags {
  [repoId: number]: string[];
}

const STORAGE_KEY = "repoTags";

/**
 * Load all repo tags from localStorage
 */
export function loadRepoTags(): RepoTags {
  if (typeof window === "undefined") return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load repo tags:", error);
    return {};
  }
}

/**
 * Save all repo tags to localStorage
 */
export function saveRepoTags(tags: RepoTags): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  } catch (error) {
    console.error("Failed to save repo tags:", error);
  }
}

/**
 * Get tags for a specific repo
 */
export function getRepoTags(repoId: number): string[] {
  const allTags = loadRepoTags();
  return allTags[repoId] || [];
}

/**
 * Add a tag to a repo (case-insensitive, no duplicates)
 */
export function addRepoTag(repoId: number, tag: string): string[] {
  const normalizedTag = tag.trim().toLowerCase();
  if (!normalizedTag) return getRepoTags(repoId);
  
  const allTags = loadRepoTags();
  const currentTags = allTags[repoId] || [];
  
  // Check if tag already exists (case-insensitive)
  if (currentTags.some(t => t.toLowerCase() === normalizedTag)) {
    return currentTags;
  }
  
  const updatedTags = [...currentTags, normalizedTag];
  allTags[repoId] = updatedTags;
  saveRepoTags(allTags);
  
  return updatedTags;
}

/**
 * Remove a tag from a repo
 */
export function removeRepoTag(repoId: number, tag: string): string[] {
  const allTags = loadRepoTags();
  const currentTags = allTags[repoId] || [];
  
  const updatedTags = currentTags.filter(t => t !== tag);
  
  if (updatedTags.length === 0) {
    delete allTags[repoId];
  } else {
    allTags[repoId] = updatedTags;
  }
  
  saveRepoTags(allTags);
  return updatedTags;
}

/**
 * Get all unique tags across all repos (for filter dropdown)
 */
export function getAllUniqueTags(): string[] {
  const allTags = loadRepoTags();
  const tagSet = new Set<string>();
  
  Object.values(allTags).forEach(tags => {
    tags.forEach(tag => tagSet.add(tag));
  });
  
  return Array.from(tagSet).sort();
}

/**
 * Check if a repo has a specific tag
 */
export function repoHasTag(repoId: number, tag: string): boolean {
  const tags = getRepoTags(repoId);
  return tags.includes(tag.toLowerCase());
}
