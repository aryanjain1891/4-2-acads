import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { readJSON, writeJSON, saveUpload } from "@/lib/storage";
import type { Handout } from "@/lib/types";

export async function GET(req: NextRequest) {
  const handouts = await readJSON<Handout>("handouts.json");
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (courseId) {
    const filtered = handouts.filter((h) => h.courseId === courseId);
    return NextResponse.json(filtered);
  }
  return NextResponse.json(handouts);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const courseId = formData.get("courseId") as string | null;
  const file = formData.get("file") as File | null;

  if (!courseId || !file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing required fields: courseId, file" },
      { status: 400 }
    );
  }

  const filename = file.name;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { relativePath, convertedFilename } = await saveUpload("handouts", courseId, filename, buffer);

  const handouts = await readJSON<Handout>("handouts.json");
  const displayName = filename.replace(/\.[^/.]+$/, "") + (convertedFilename !== filename ? " (PDF)" : "");
  const handout: Handout = {
    id: uuidv4(),
    courseId: String(courseId),
    filename: convertedFilename,
    displayName,
    path: relativePath,
  };
  handouts.push(handout);
  await writeJSON("handouts.json", handouts);
  return NextResponse.json(handout, { status: 201 });
}
