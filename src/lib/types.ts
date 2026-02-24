export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  assignee: "jilian" | "openclaw" | "lovable";
  source: "manual" | "tasks.md";
  sourceRef?: string;
  createdAt: string;
  updatedAt: string;
  completedNote?: string;
}

export interface ProjectData {
  projectName: string;
  lastSynced: string;
  tasks: Task[];
}

export interface ProjectSummary {
  name: string;
  pendingCount: number;
  totalCount: number;
  lastUpdated: string;
  hasTasks: boolean;
  hasClaude: boolean;
}

export interface MdFile {
  name: string;
  path: string;
}
