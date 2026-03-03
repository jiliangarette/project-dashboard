import path from "path";
import os from "os";

export const BASE_PATH =
  process.env.PROJECTS_BASE_PATH ||
  path.join(os.homedir(), "OneDrive", "Desktop", "Lovable-Projects");

export const PROJECT_NAMES = [
  "ads-agency",
  "ads-launcher",
  "aia-academy",
  "client-dashboard",
  "financial-presenter",
  "financial-simulator",
  "project-dashboard",
  "themoneybees",
  "website-namecard-builder",
];

export function projectPath(name: string): string {
  return path.join(BASE_PATH, name);
}

export function tasksJsonPath(name: string): string {
  return path.join(BASE_PATH, name, "tasks.json");
}

export function tasksMdPath(name: string): string {
  return path.join(BASE_PATH, name, "TASKS.md");
}

export function claudeMdPath(name: string): string {
  return path.join(BASE_PATH, name, "CLAUDE.md");
}
