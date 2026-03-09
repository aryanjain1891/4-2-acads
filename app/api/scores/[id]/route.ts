import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/storage";
import type { EvalComponent } from "@/lib/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { courseId, name, weightage, maxMarks, obtained } = body;

  const scores = await readJSON<EvalComponent>("scores.json");
  const index = scores.findIndex((s) => s.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Score not found" }, { status: 404 });
  }

  const updated: EvalComponent = {
    ...scores[index],
    ...(courseId !== undefined && { courseId: String(courseId) }),
    ...(name !== undefined && { name: String(name) }),
    ...(weightage !== undefined && { weightage: Number(weightage) }),
    ...(maxMarks !== undefined && {
      maxMarks: maxMarks === null ? null : Number(maxMarks),
    }),
    ...(obtained !== undefined && {
      obtained: obtained === null ? null : Number(obtained),
    }),
  };
  scores[index] = updated;
  await writeJSON("scores.json", scores);
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const scores = await readJSON<EvalComponent>("scores.json");
  const index = scores.findIndex((s) => s.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Score not found" }, { status: 404 });
  }

  scores.splice(index, 1);
  await writeJSON("scores.json", scores);
  return NextResponse.json({ success: true });
}
