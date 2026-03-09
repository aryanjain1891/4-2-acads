import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Course } from "@/lib/types";

export async function GET() {
  const courses = await readJSON<Course>("courses.json");
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, code, instructor, credits } = body;
  if (!name || !code || credits === undefined) {
    return NextResponse.json(
      { error: "Missing required fields: name, code, credits" },
      { status: 400 }
    );
  }
  const courses = await readJSON<Course>("courses.json");
  const course: Course = {
    id: uuidv4(),
    name: String(name),
    code: String(code),
    instructor: instructor ? String(instructor) : "",
    credits: Number(credits),
  };
  courses.push(course);
  await writeJSON("courses.json", courses);
  return NextResponse.json(course, { status: 201 });
}
