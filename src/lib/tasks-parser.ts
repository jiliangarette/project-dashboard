import { v4 as uuidv4 } from "uuid";
import type { Task } from "./types";

/**
 * Parse a TASKS.md file and extract tasks from markdown checkboxes.
 * Supports:
 *   - [ ] unchecked -> todo
 *   - [x] checked -> done
 *   - ### headers -> category context
 */
export function parseTasksMd(content: string): Omit<Task, "id">[] {
  const lines = content.split("\n");
  const tasks: Omit<Task, "id">[] = [];
  let currentCategory = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Track heading context
    const headingMatch = trimmed.match(/^#{1,6}\s+(.+)/);
    if (headingMatch) {
      currentCategory = headingMatch[1].trim();
      continue;
    }

    // Match checkbox items: - [ ] or - [x] or * [ ] or * [x]
    const checkboxMatch = trimmed.match(
      /^[-*]\s+\[([ xX])\]\s+(.+)/
    );
    if (checkboxMatch) {
      const checked = checkboxMatch[1].toLowerCase() === "x";
      const title = checkboxMatch[2].trim();
      const now = new Date().toISOString();

      tasks.push({
        title,
        description: currentCategory ? `Category: ${currentCategory}` : undefined,
        status: checked ? "done" : "todo",
        priority: "medium",
        assignee: "jilian",
        source: "tasks.md",
        sourceRef: `line:${i + 1}`,
        createdAt: now,
        updatedAt: now,
      });
      continue;
    }

    // Match plain bullet items under TODO-like headings
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)/);
    if (
      bulletMatch &&
      !trimmed.startsWith("- [") &&
      /todo|task/i.test(currentCategory)
    ) {
      const title = bulletMatch[1].trim();
      if (title.length > 2) {
        const now = new Date().toISOString();
        tasks.push({
          title,
          description: currentCategory ? `Category: ${currentCategory}` : undefined,
          status: "todo",
          priority: "medium",
          assignee: "jilian",
          source: "tasks.md",
          sourceRef: `line:${i + 1}`,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  return tasks;
}

/**
 * Merge parsed tasks into existing task list, avoiding duplicates by title match.
 */
export function mergeTasks(
  existing: Task[],
  parsed: Omit<Task, "id">[]
): Task[] {
  const merged = [...existing];
  const existingTitles = new Set(
    existing.map((t) => t.title.toLowerCase())
  );

  for (const p of parsed) {
    if (!existingTitles.has(p.title.toLowerCase())) {
      merged.push({ ...p, id: uuidv4() });
      existingTitles.add(p.title.toLowerCase());
    }
  }

  return merged;
}

/**
 * Update TASKS.md content to reflect task status changes.
 * Returns the updated markdown string.
 */
export function updateTasksMdCheckbox(
  content: string,
  title: string,
  done: boolean
): string {
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const checkboxMatch = trimmed.match(/^([-*]\s+\[)([ xX])(\]\s+)(.+)/);
    if (checkboxMatch && checkboxMatch[4].trim() === title) {
      const prefix = checkboxMatch[1];
      const suffix = checkboxMatch[3];
      const text = checkboxMatch[4];
      const indent = lines[i].match(/^(\s*)/)?.[1] || "";
      lines[i] = `${indent}${prefix}${done ? "x" : " "}${suffix}${text}`;
      break;
    }
  }

  return lines.join("\n");
}
