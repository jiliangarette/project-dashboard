import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { readTasksJson, writeTasksJson } from "@/lib/file-io";
import { PROJECT_NAMES } from "@/lib/constants";
import type { Task } from "@/lib/types";

function validateProject(project: string): boolean {
  return PROJECT_NAMES.includes(project);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ project: string }> }
) {
  const { project } = await params;
  if (!validateProject(project)) {
    return NextResponse.json({ error: "Invalid project" }, { status: 400 });
  }

  const data = await readTasksJson(project);
  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ project: string }> }
) {
  const { project } = await params;
  if (!validateProject(project)) {
    return NextResponse.json({ error: "Invalid project" }, { status: 400 });
  }

  const body = await request.json();
  const now = new Date().toISOString();

  const data = await readTasksJson(project);

  // Assign order: append at the bottom (highest order + 1)
  let maxOrder = 0;
  for (const t of data.tasks) {
    if (t.order !== undefined && t.order > maxOrder) maxOrder = t.order;
  }

  const newTask: Task = {
    id: uuidv4(),
    title: body.title,
    description: body.description || undefined,
    status: body.status || "todo",
    priority: body.priority || "medium",
    order: maxOrder + 1,
    source: "manual",
    createdAt: now,
    updatedAt: now,
  };

  data.tasks.push(newTask);
  data.lastSynced = now;
  await writeTasksJson(project, data);

  return NextResponse.json(newTask, { status: 201 });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ project: string }> }
) {
  const { project } = await params;
  if (!validateProject(project)) {
    return NextResponse.json({ error: "Invalid project" }, { status: 400 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Task id required" }, { status: 400 });
  }

  const data = await readTasksJson(project);
  const idx = data.tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  data.tasks[idx] = {
    ...data.tasks[idx],
    ...updates,
    id: data.tasks[idx].id,
    updatedAt: new Date().toISOString(),
  };
  data.lastSynced = new Date().toISOString();
  await writeTasksJson(project, data);

  return NextResponse.json(data.tasks[idx]);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ project: string }> }
) {
  const { project } = await params;
  if (!validateProject(project)) {
    return NextResponse.json({ error: "Invalid project" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Task id required" }, { status: 400 });
  }

  const data = await readTasksJson(project);
  const idx = data.tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  data.tasks.splice(idx, 1);
  data.lastSynced = new Date().toISOString();
  await writeTasksJson(project, data);

  return NextResponse.json({ ok: true });
}
