import path from "path";

export const BASE_PATH = "C:\\Users\\Jilian\\OneDrive\\Desktop\\Lovable-Projects";

export const PROJECT_NAMES = [
  "ads-agency",
  "ads-launcher",
  "aia-academy",
  "client-dashboard",
  "financial-presenter",
  "financial-simulator",
  "jilian-dashboard",
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
