import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Exam } from "@/lib/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { courseId, type, title, date, syllabus } = body;

  const exams = await readJSON<Exam>("exams.json");
  const index = exams.findIndex((e) => e.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  const updated: Exam = {
    ...exams[index],
    ...(courseId !== undefined && { courseId: String(courseId) }),
    ...(type !== undefined && { type: String(type) }),
    ...(title !== undefined && { title: String(title) }),
    ...(date !== undefined && { date: String(date) }),
    ...(syllabus !== undefined && { syllabus: String(syllabus) }),
  };
  exams[index] = updated;
  await writeJSON("exams.json", exams);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const exams = await readJSON<Exam>("exams.json");
  const index = exams.findIndex((e) => e.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  exams.splice(index, 1);
  await writeJSON("exams.json", exams);
  return NextResponse.json({ success: true });
}
