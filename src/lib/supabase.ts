import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface UserPreference {
  id: string;
  user_id: string;
  pinned_repos: number[];
  created_at: string;
  updated_at: string;
}

export interface ManualTask {
  id: string;
  user_id: string;
  repo_owner: string;
  repo_name: string;
  title: string;
  description?: string;
  status: "todo" | "done";
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export interface ChangelogCache {
  id: string;
  repo_owner: string;
  repo_name: string;
  date: string;
  summary: string;
  bullets: string[];
  created_at: string;
}
