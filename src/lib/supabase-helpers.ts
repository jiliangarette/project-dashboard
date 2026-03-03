import { supabase } from "./supabase";
import type { UserPreference, ManualTask, ChangelogCache } from "./supabase";

// ============================================================================
// User Preferences (Pinned Repos)
// ============================================================================

export async function getUserPreferences(userId: string): Promise<UserPreference | null> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" - that's okay, we'll create it
    console.error("Error fetching user preferences:", error);
    return null;
  }

  return data;
}

export async function updatePinnedRepos(userId: string, pinnedRepos: number[]): Promise<boolean> {
  const existing = await getUserPreferences(userId);

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("user_preferences")
      .update({ pinned_repos: pinnedRepos, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating pinned repos:", error);
      return false;
    }
  } else {
    // Insert new
    const { error } = await supabase
      .from("user_preferences")
      .insert({ user_id: userId, pinned_repos: pinnedRepos });

    if (error) {
      console.error("Error inserting pinned repos:", error);
      return false;
    }
  }

  return true;
}

// ============================================================================
// Manual Tasks
// ============================================================================

export async function getManualTasks(
  userId: string,
  repoOwner: string,
  repoName: string
): Promise<ManualTask[]> {
  const { data, error } = await supabase
    .from("manual_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("repo_owner", repoOwner)
    .eq("repo_name", repoName)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching manual tasks:", error);
    return [];
  }

  return data || [];
}

export async function createManualTask(
  userId: string,
  repoOwner: string,
  repoName: string,
  task: { title: string; description?: string; priority: "low" | "medium" | "high" }
): Promise<ManualTask | null> {
  const { data, error } = await supabase
    .from("manual_tasks")
    .insert({
      user_id: userId,
      repo_owner: repoOwner,
      repo_name: repoName,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: "todo",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    return null;
  }

  return data;
}

export async function updateManualTask(
  taskId: string,
  updates: Partial<Pick<ManualTask, "title" | "description" | "priority" | "status">>
): Promise<boolean> {
  const { error } = await supabase
    .from("manual_tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) {
    console.error("Error updating task:", error);
    return false;
  }

  return true;
}

export async function deleteManualTask(taskId: string): Promise<boolean> {
  const { error } = await supabase.from("manual_tasks").delete().eq("id", taskId);

  if (error) {
    console.error("Error deleting task:", error);
    return false;
  }

  return true;
}

// ============================================================================
// Changelog Cache
// ============================================================================

export async function getCachedChangelog(
  repoOwner: string,
  repoName: string,
  date: string
): Promise<ChangelogCache | null> {
  const { data, error } = await supabase
    .from("changelog_cache")
    .select("*")
    .eq("repo_owner", repoOwner)
    .eq("repo_name", repoName)
    .eq("date", date)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching changelog cache:", error);
    return null;
  }

  return data;
}

export async function setCachedChangelog(
  repoOwner: string,
  repoName: string,
  date: string,
  summary: string,
  bullets: string[]
): Promise<boolean> {
  const { error } = await supabase.from("changelog_cache").upsert(
    {
      repo_owner: repoOwner,
      repo_name: repoName,
      date,
      summary,
      bullets,
    },
    { onConflict: "repo_owner,repo_name,date" }
  );

  if (error) {
    console.error("Error caching changelog:", error);
    return false;
  }

  return true;
}
