import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Exam } from "@/lib/types";

export async function GET(req: NextRequest) {
  const exams = await readJSON<Exam>("exams.json");
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (courseId) {
    const filtered = exams.filter((e) => e.courseId === courseId);
    return NextResponse.json(filtered);
  }
  return NextResponse.json(exams);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { courseId, type, title, date, syllabus } = body;
  if (!courseId || !title) {
    return NextResponse.json(
      { error: "Missing required fields: courseId, title" },
      { status: 400 }
    );
  }
  const exams = await readJSON<Exam>("exams.json");
  const exam: Exam = {
    id: uuidv4(),
    courseId: String(courseId),
    type: type ? String(type) : "",
    title: String(title),
    date: date ? String(date) : "",
    syllabus: syllabus ? String(syllabus) : "",
  };
  exams.push(exam);
  await writeJSON("exams.json", exams);
  return NextResponse.json(exam, { status: 201 });
}
