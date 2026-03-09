import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Deadline } from "@/lib/types";

export async function GET(req: NextRequest) {
  const deadlines = await readJSON<Deadline>("deadlines.json");
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (courseId) {
    const filtered = deadlines.filter((d) => d.courseId === courseId);
    return NextResponse.json(filtered);
  }
  return NextResponse.json(deadlines);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { courseId, title, date, type, done } = body;
  if (!courseId || !title || !type) {
    return NextResponse.json(
      { error: "Missing required fields: courseId, title, type" },
      { status: 400 }
    );
  }
  const validTypes = ["assignment", "project", "report", "other"] as const;
  if (!validTypes.includes(type)) {
    return NextResponse.json(
      { error: "Invalid type. Must be: assignment, project, report, or other" },
      { status: 400 }
    );
  }
  const deadlines = await readJSON<Deadline>("deadlines.json");
  const deadline: Deadline = {
    id: uuidv4(),
    courseId: String(courseId),
    title: String(title),
    date: date ? String(date) : "",
    type,
    done: done === true,
  };
  deadlines.push(deadline);
  await writeJSON("deadlines.json", deadlines);
  return NextResponse.json(deadline, { status: 201 });
}
