import { NextResponse } from "next/server";
import { readTasksJson, writeTasksJson } from "@/lib/file-io";
import { PROJECT_NAMES } from "@/lib/constants";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ project: string }> }
) {
  const { project } = await params;
  if (!PROJECT_NAMES.includes(project)) {
    return NextResponse.json({ error: "Invalid project" }, { status: 400 });
  }

  const body = await request.json();
  const { id, direction } = body as { id: string; direction: "up" | "down" };

  if (!id || !direction) {
    return NextResponse.json(
      { error: "id and direction required" },
      { status: 400 }
    );
  }

  const data = await readTasksJson(project);

  // Ensure all tasks have order values
  for (let i = 0; i < data.tasks.length; i++) {
    if (data.tasks[i].order === undefined) {
      data.tasks[i].order = i + 1;
    }
  }

  // Sort by order to find neighbors
  const sorted = [...data.tasks].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  const sortedIdx = sorted.findIndex((t) => t.id === id);
  if (sortedIdx === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const swapIdx =
    direction === "up" ? sortedIdx - 1 : sortedIdx + 1;
  if (swapIdx < 0 || swapIdx >= sorted.length) {
    return NextResponse.json(data);
  }

  // Swap order values
  const taskA = sorted[sortedIdx];
  const taskB = sorted[swapIdx];
  const tempOrder = taskA.order;
  taskA.order = taskB.order;
  taskB.order = tempOrder;

  // Apply swapped orders back to data.tasks
  for (const task of data.tasks) {
    if (task.id === taskA.id) task.order = taskA.order;
    if (task.id === taskB.id) task.order = taskB.order;
  }

  await writeTasksJson(project, data);
  return NextResponse.json(data);
}
