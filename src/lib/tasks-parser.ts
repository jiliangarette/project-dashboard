import { v4 as uuidv4 } from "uuid";
import type { Task } from "./types";

/**
 * Parse a TASKS.md file and extract tasks from markdown checkboxes.
 *
 * Supports real project formats:
 *   - [ ] [TAG] **Title** — Description
 *   - [ ] `[TAG]` **Title** — Description
 *   - [x] checked -> done
 *   - ### headers -> category context
 *   - Indented sub-items (numbered or bulleted) appended to description
 *   - Multi-line indented content belongs to previous task
 *   - Tags like [PLAN], [TEST], [AUTO] preserved in title
 */
export function parseTasksMd(content: string): Omit<Task, "id">[] {
  const lines = content.split("\n");
  const tasks: Omit<Task, "id">[] = [];
  let currentCategory = "";
  let inDetailsBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip HTML comments
    if (trimmed.startsWith("<!--") && trimmed.endsWith("-->")) continue;

    // Track <details> blocks (collapsed completed sections) — skip tasks inside
    if (trimmed.startsWith("<details")) {
      inDetailsBlock = true;
      continue;
    }
    if (trimmed.startsWith("</details>")) {
      inDetailsBlock = false;
      continue;
    }
    if (inDetailsBlock) continue;

    // Track heading context
    const headingMatch = trimmed.match(/^#{1,6}\s+(.+)/);
    if (headingMatch) {
      currentCategory = headingMatch[1].trim();
      continue;
    }

    // Match checkbox items: - [ ] or - [x] or * [ ] or * [x]
    const checkboxMatch = trimmed.match(/^[-*]\s+\[([ xX])\]\s+(.+)/);
    if (!checkboxMatch) continue;

    const checked = checkboxMatch[1].toLowerCase() === "x";
    const rawText = checkboxMatch[2].trim();

    // Parse: optional tags (with or without backticks) + optional bold title + optional description
    const { title, description: inlineDesc } = parseTaskLine(rawText);
    if (!title) continue;

    // Collect indented continuation lines (sub-items, multi-line descriptions)
    const descLines: string[] = [];
    if (inlineDesc) descLines.push(inlineDesc);

    let j = i + 1;
    while (j < lines.length) {
      const nextLine = lines[j];
      const nextTrimmed = nextLine.trim();
      // Stop at empty lines, new top-level bullets, headings, or HTML tags
      if (nextTrimmed === "") break;
      if (/^[-*]\s+\[[ xX]\]/.test(nextTrimmed)) break;
      if (/^#{1,6}\s+/.test(nextTrimmed)) break;
      if (/^</.test(nextTrimmed)) break;
      if (/^---/.test(nextTrimmed)) break;
      // Must be indented (continuation of previous task)
      if (nextLine.match(/^\s{2,}/) || nextTrimmed.match(/^\d+\.\s/) || nextTrimmed.match(/^[-*]\s/)) {
        // Strip leading "- " or "N. " for cleaner description, but keep indent structure
        descLines.push(nextTrimmed);
        j++;
      } else {
        break;
      }
    }

    const description = buildDescription(currentCategory, descLines);
    const now = new Date().toISOString();

    tasks.push({
      title,
      description: description || undefined,
      status: checked ? "done" : "todo",
      priority: "medium",
      source: "tasks.md",
      sourceRef: `line:${i + 1}`,
      createdAt: now,
      updatedAt: now,
    });

    // Skip lines we consumed as description
    i = j - 1;
  }

  return tasks;
}

/**
 * Parse a task line after the checkbox.
 * Handles formats like:
 *   [PLAN] **Title** — description text
 *   `[PLAN]` `[TEST]` **Title** — description text
 *   **Title** — description text
 *   Plain title text
 */
function parseTaskLine(raw: string): { title: string; description: string } {
  let text = raw;

  // Extract tags: [TAG] or `[TAG]` patterns at the start
  const tags: string[] = [];
  const tagPattern = /^(?:`?\[([A-Z0-9-]+(?:,\s*[A-Z0-9-]+)*)\]`?\s*)+/;

  // Iteratively extract tags from the front
  let tagMatch;
  while ((tagMatch = text.match(/^`?\[([A-Z0-9-]+(?:,\s*[A-Z0-9-]+)*)\]`?\s*/))) {
    tags.push(`[${tagMatch[1]}]`);
    text = text.slice(tagMatch[0].length);
  }

  const tagPrefix = tags.length > 0 ? tags.join(" ") + " " : "";

  // Extract bold title: **Title**
  const boldMatch = text.match(/^\*\*(.+?)\*\*/);
  if (boldMatch) {
    const boldTitle = boldMatch[1].trim();
    const afterBold = text.slice(boldMatch[0].length).trim();

    // Description comes after — or – or : separator
    let description = "";
    const sepMatch = afterBold.match(/^[—–:\-]\s*(.*)/);
    if (sepMatch) {
      description = sepMatch[1].trim();
    } else if (afterBold) {
      description = afterBold;
    }

    // Remove trailing checkmark emojis from title
    const cleanTitle = boldTitle.replace(/\s*✅\s*$/, "").trim();

    return { title: tagPrefix + cleanTitle, description };
  }

  // No bold: treat everything as title (possibly with — separator)
  const sepMatch = text.match(/^(.+?)\s*[—–]\s*(.*)/);
  if (sepMatch) {
    const cleanTitle = sepMatch[1].replace(/\s*✅\s*$/, "").trim();
    return { title: tagPrefix + cleanTitle, description: sepMatch[2].trim() };
  }

  const cleanTitle = text.replace(/\s*✅\s*$/, "").trim();
  return { title: tagPrefix + cleanTitle, description: "" };
}

/**
 * Build a description string from category and description lines.
 */
function buildDescription(category: string, descLines: string[]): string {
  const parts: string[] = [];
  if (category) parts.push(`Category: ${category}`);
  if (descLines.length > 0) {
    const cleaned = descLines
      .map((l) => l.replace(/^<!--.*?-->$/, "").trim())
      .filter(Boolean)
      .join("\n");
    if (cleaned) parts.push(cleaned);
  }
  return parts.join("\n");
}

/**
 * Merge parsed tasks into existing task list, avoiding duplicates by title match.
 * New tasks get appended at the end with the highest order number.
 */
export function mergeTasks(
  existing: Task[],
  parsed: Omit<Task, "id">[]
): Task[] {
  const merged = [...existing];
  const existingTitles = new Set(
    existing.map((t) => t.title.toLowerCase())
  );

  // Find the highest existing order number
  let maxOrder = 0;
  for (const t of existing) {
    if (t.order !== undefined && t.order > maxOrder) {
      maxOrder = t.order;
    }
  }

  for (const p of parsed) {
    if (!existingTitles.has(p.title.toLowerCase())) {
      maxOrder++;
      merged.push({ ...p, id: uuidv4(), order: maxOrder });
      existingTitles.add(p.title.toLowerCase());
    }
  }

  return merged;
}

/**
 * Update TASKS.md content to reflect task status changes.
 * Matches by extracting the bold title from the line and comparing.
 */
export function updateTasksMdCheckbox(
  content: string,
  title: string,
  done: boolean
): string {
  const lines = content.split("\n");

  // Strip tag prefix from title for matching: "[PLAN] Title" -> "Title"
  const titleWithoutTags = title.replace(/^\[.*?\]\s*/g, "").trim();

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const checkboxMatch = trimmed.match(/^([-*]\s+\[)([ xX])(\]\s+)(.+)/);
    if (!checkboxMatch) continue;

    const lineText = checkboxMatch[4].trim();

    // Extract bold title from the line for comparison
    const boldMatch = lineText.match(/\*\*(.+?)\*\*/);
    const lineTitleClean = boldMatch
      ? boldMatch[1].replace(/\s*✅\s*$/, "").trim()
      : lineText.replace(/\s*✅\s*$/, "").trim();

    // Match against full title or title without tags
    if (
      lineTitleClean.toLowerCase() === title.toLowerCase() ||
      lineTitleClean.toLowerCase() === titleWithoutTags.toLowerCase()
    ) {
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
