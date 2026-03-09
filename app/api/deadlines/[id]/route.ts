import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Deadline } from "@/lib/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { courseId, title, date, type, done } = body;

  const deadlines = await readJSON<Deadline>("deadlines.json");
  const index = deadlines.findIndex((d) => d.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Deadline not found" }, { status: 404 });
  }

  const validTypes = ["assignment", "project", "report", "other"] as const;
  if (type !== undefined && !validTypes.includes(type)) {
    return NextResponse.json(
      { error: "Invalid type. Must be: assignment, project, report, or other" },
      { status: 400 }
    );
  }

  const updated: Deadline = {
    ...deadlines[index],
    ...(courseId !== undefined && { courseId: String(courseId) }),
    ...(title !== undefined && { title: String(title) }),
    ...(date !== undefined && { date: String(date) }),
    ...(type !== undefined && { type }),
    ...(done !== undefined && { done: done === true }),
  };
  deadlines[index] = updated;
  await writeJSON("deadlines.json", deadlines);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const deadlines = await readJSON<Deadline>("deadlines.json");
  const index = deadlines.findIndex((d) => d.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Deadline not found" }, { status: 404 });
  }

  deadlines.splice(index, 1);
  await writeJSON("deadlines.json", deadlines);
  return NextResponse.json({ success: true });
}
