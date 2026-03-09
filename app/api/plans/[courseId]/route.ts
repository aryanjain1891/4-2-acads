import { NextRequest, NextResponse } from "next/server";
import { readPlan, writePlan, getAbsolutePath } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  let content = await readPlan(courseId);
  const path = getAbsolutePath("content", "plans", `${courseId}.md`);
  if (!content) {
    await writePlan(courseId, "");
    content = "";
  }
  return NextResponse.json({ content, path });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const body = await req.json();
  const { content } = body;

  if (typeof content !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid content (must be string)" },
      { status: 400 }
    );
  }

  await writePlan(courseId, content);
  return NextResponse.json({ success: true });
}
