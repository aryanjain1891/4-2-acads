import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { listAssignments, createAssignment, getAbsolutePath } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const basePath = getAbsolutePath("assignments", courseId);
  await fs.mkdir(basePath, { recursive: true });
  const assignments = await listAssignments(courseId);
  const projectPath = getAbsolutePath();
  return NextResponse.json({ assignments, basePath, projectPath });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const body = await req.json();
  const { slug } = body;

  if (!slug || typeof slug !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid slug (must be string)" },
      { status: 400 }
    );
  }

  await createAssignment(courseId, slug);
  const path = getAbsolutePath("assignments", courseId, slug);
  return NextResponse.json({ slug, path }, { status: 201 });
}
