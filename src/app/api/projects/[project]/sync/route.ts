import { NextResponse } from "next/server";
import { readTasksJson, readTasksMd, writeTasksJson, writeTasksMd } from "@/lib/file-io";
import { parseTasksMd, mergeTasks, updateTasksMdCheckbox } from "@/lib/tasks-parser";
import { PROJECT_NAMES } from "@/lib/constants";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ project: string }> }
) {
  const { project } = await params;
  if (!PROJECT_NAMES.includes(project)) {
    return NextResponse.json({ error: "Invalid project" }, { status: 400 });
  }

  const md = await readTasksMd(project);
  const data = await readTasksJson(project);

  if (md) {
    const parsed = parseTasksMd(md);
    data.tasks = mergeTasks(data.tasks, parsed);

    // Two-way sync: update TASKS.md checkboxes from existing task statuses
    let updatedMd = md;
    for (const task of data.tasks) {
      if (task.source === "tasks.md") {
        updatedMd = updateTasksMdCheckbox(
          updatedMd,
          task.title,
          task.status === "done"
        );
      }
    }
    if (updatedMd !== md) {
      await writeTasksMd(project, updatedMd);
    }
  }

  data.lastSynced = new Date().toISOString();
  await writeTasksJson(project, data);

  return NextResponse.json(data);
}
