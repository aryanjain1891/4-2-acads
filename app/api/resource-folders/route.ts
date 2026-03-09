import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/storage";
import type { ResourceFolder } from "@/lib/types";

export async function GET(req: NextRequest) {
  const folders = await readJSON<ResourceFolder>("resource-folders.json");
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (courseId) return NextResponse.json(folders.filter((f) => f.courseId === courseId));
  return NextResponse.json(folders);
}

export async function POST(req: NextRequest) {
  const { courseId, name } = await req.json();
  if (!courseId || !name) {
    return NextResponse.json({ error: "courseId and name required" }, { status: 400 });
  }
  const folders = await readJSON<ResourceFolder>("resource-folders.json");
  if (folders.some((f) => f.courseId === courseId && f.name === name)) {
    return NextResponse.json({ error: "Folder already exists" }, { status: 409 });
  }
  const folder: ResourceFolder = { courseId: String(courseId), name: String(name) };
  folders.push(folder);
  await writeJSON("resource-folders.json", folders);
  return NextResponse.json(folder, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { courseId, name } = await req.json();
  if (!courseId || !name) {
    return NextResponse.json({ error: "courseId and name required" }, { status: 400 });
  }
  const folders = await readJSON<ResourceFolder>("resource-folders.json");
  const filtered = folders.filter((f) => !(f.courseId === courseId && f.name === name));
  await writeJSON("resource-folders.json", filtered);
  return NextResponse.json({ success: true });
}
