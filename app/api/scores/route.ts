import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { readJSON, writeJSON } from "@/lib/storage";
import type { EvalComponent } from "@/lib/types";

export async function GET(req: NextRequest) {
  const scores = await readJSON<EvalComponent>("scores.json");
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (courseId) {
    const filtered = scores.filter((s) => s.courseId === courseId);
    return NextResponse.json(filtered);
  }
  return NextResponse.json(scores);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { courseId, name, weightage, maxMarks, obtained } = body;
  if (!courseId || !name || weightage === undefined) {
    return NextResponse.json(
      { error: "Missing required fields: courseId, name, weightage" },
      { status: 400 }
    );
  }
  const scores = await readJSON<EvalComponent>("scores.json");
  const score: EvalComponent = {
    id: uuidv4(),
    courseId: String(courseId),
    name: String(name),
    weightage: Number(weightage),
    maxMarks: maxMarks !== undefined && maxMarks !== null ? Number(maxMarks) : null,
    obtained: obtained !== undefined && obtained !== null ? Number(obtained) : null,
  };
  scores.push(score);
  await writeJSON("scores.json", scores);
  return NextResponse.json(score, { status: 201 });
}
