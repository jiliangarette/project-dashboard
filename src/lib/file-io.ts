import fs from "fs/promises";
import path from "path";
import type { ProjectData, ProjectSummary, MdFile } from "./types";
import { projectPath, tasksJsonPath, tasksMdPath, claudeMdPath, PROJECT_NAMES, BASE_PATH } from "./constants";

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readTasksJson(project: string): Promise<ProjectData> {
  const p = tasksJsonPath(project);
  if (await fileExists(p)) {
    const raw = await fs.readFile(p, "utf-8");
    try {
      return JSON.parse(raw) as ProjectData;
    } catch {
      // Corrupted JSON — return empty
    }
  }
  return {
    projectName: project,
    lastSynced: new Date().toISOString(),
    tasks: [],
  };
}

export async function writeTasksJson(project: string, data: ProjectData): Promise<void> {
  const p = tasksJsonPath(project);
  await fs.writeFile(p, JSON.stringify(data, null, 2), "utf-8");
}

export async function readTasksMd(project: string): Promise<string | null> {
  const p = tasksMdPath(project);
  if (await fileExists(p)) {
    return fs.readFile(p, "utf-8");
  }
  return null;
}

export async function writeTasksMd(project: string, content: string): Promise<void> {
  const p = tasksMdPath(project);
  await fs.writeFile(p, content, "utf-8");
}

export async function readClaudeMd(project: string): Promise<string | null> {
  const p = claudeMdPath(project);
  if (await fileExists(p)) {
    return fs.readFile(p, "utf-8");
  }
  return null;
}

export async function listMdFiles(project: string): Promise<MdFile[]> {
  const dir = projectPath(project);
  try {
    const entries = await fs.readdir(dir);
    return entries
      .filter((f) => f.endsWith(".md"))
      .map((f) => ({
        name: f,
        path: path.join(dir, f),
      }));
  } catch {
    return [];
  }
}

export async function readMdFile(project: string, filename: string): Promise<string | null> {
  const filePath = path.join(projectPath(project), filename);
  // Prevent path traversal
  if (!filePath.startsWith(projectPath(project))) return null;
  if (await fileExists(filePath)) {
    return fs.readFile(filePath, "utf-8");
  }
  return null;
}

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
  const summaries: ProjectSummary[] = [];

  for (const name of PROJECT_NAMES) {
    const dir = projectPath(name);
    const dirExists = await fileExists(dir);
    if (!dirExists) continue;

    const data = await readTasksJson(name);
    const pendingCount = data.tasks.filter((t) => t.status !== "done").length;
    const hasClaude = await fileExists(claudeMdPath(name));

    let lastUpdated = data.lastSynced;
    if (data.tasks.length > 0) {
      const latest = data.tasks.reduce((a, b) =>
        a.updatedAt > b.updatedAt ? a : b
      );
      lastUpdated = latest.updatedAt;
    }

    summaries.push({
      name,
      pendingCount,
      totalCount: data.tasks.length,
      lastUpdated,
      hasTasks: data.tasks.length > 0,
      hasClaude,
    });
  }

  return summaries;
}

export async function getFileStat(filePath: string): Promise<Date | null> {
  try {
    const stat = await fs.stat(filePath);
    return stat.mtime;
  } catch {
    return null;
  }
}
