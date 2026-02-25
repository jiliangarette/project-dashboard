import { NextResponse } from "next/server";
import { fileExists, readTasksJson, readTasksMd, writeTasksJson, writeTasksMd } from "@/lib/file-io";
import { parseTasksMd, mergeTasks, updateTasksMdCheckbox } from "@/lib/tasks-parser";
import { PROJECT_NAMES, projectPath } from "@/lib/constants";

export async function POST() {
  const results: { project: string; synced: boolean }[] = [];

  await Promise.all(
    PROJECT_NAMES.map(async (project) => {
      try {
        const dirExists = await fileExists(projectPath(project));
        if (!dirExists) {
          results.push({ project, synced: false });
          return;
        }

        const data = await readTasksJson(project);
        const md = await readTasksMd(project);

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

        // Always write tasks.json so the project is visible on the homepage
        data.lastSynced = new Date().toISOString();
        await writeTasksJson(project, data);
        results.push({ project, synced: true });
      } catch (err) {
        console.error(`Failed to sync ${project}:`, err);
        results.push({ project, synced: false });
      }
    })
  );

  return NextResponse.json(results);
}
