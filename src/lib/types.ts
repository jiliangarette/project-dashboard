export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "done";
  priority: "low" | "medium" | "high";
  dueDate?: string; // ISO 8601 date string
  order?: number;
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
