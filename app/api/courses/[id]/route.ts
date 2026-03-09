import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Course } from "@/lib/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, code, instructor, credits } = body;

  const courses = await readJSON<Course>("courses.json");
  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const updated: Course = {
    ...courses[index],
    ...(name !== undefined && { name: String(name) }),
    ...(code !== undefined && { code: String(code) }),
    ...(instructor !== undefined && { instructor: String(instructor) }),
    ...(credits !== undefined && { credits: Number(credits) }),
  };
  courses[index] = updated;
  await writeJSON("courses.json", courses);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const courses = await readJSON<Course>("courses.json");
  const index = courses.findIndex((c) => c.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  courses.splice(index, 1);
  await writeJSON("courses.json", courses);
  return NextResponse.json({ success: true });
}
