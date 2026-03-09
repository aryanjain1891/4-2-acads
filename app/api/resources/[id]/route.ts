import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readJSON, writeJSON, deleteFile } from "@/lib/storage";
import type { Resource } from "@/lib/types";

const CONTENT_DIR = path.join(process.cwd(), "content");

async function renameResourceFile(oldUrl: string, newTitle: string): Promise<string | null> {
  const oldAbsolute = path.join(CONTENT_DIR, oldUrl);
  const dir = path.dirname(oldAbsolute);
  const ext = path.extname(oldAbsolute);
  const safeName = newTitle.replace(/[/\\]/g, "_");
  const newFilename = safeName + ext;
  const newAbsolute = path.join(dir, newFilename);

  if (oldAbsolute === newAbsolute) return null;

  try {
    await fs.access(oldAbsolute);
    await fs.rename(oldAbsolute, newAbsolute);
  } catch (err) {
    console.error("[rename] Failed to rename PDF:", oldAbsolute, "->", newAbsolute, err);
    return null;
  }

  const oldMd = oldAbsolute.replace(/\.[^.]+$/, ".md");
  const newMd = newAbsolute.replace(/\.[^.]+$/, ".md");
  try {
    await fs.access(oldMd);
    await fs.rename(oldMd, newMd);
  } catch {
    /* no .md transcript to rename */
  }

  return path.join(path.dirname(oldUrl), newFilename);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const resources = await readJSON<Resource>("resources.json");
  const index = resources.findIndex((r) => r.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const old = { ...resources[index] };
  resources[index] = { ...old, ...body, id, courseId: old.courseId, type: old.type };

  if (body.title && body.title !== old.title && old.type === "file" && old.url) {
    const newUrl = await renameResourceFile(old.url, body.title);
    if (newUrl) {
      resources[index].url = newUrl;
    }
  }

  await writeJSON("resources.json", resources);
  return NextResponse.json(resources[index]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const resources = await readJSON<Resource>("resources.json");
  const index = resources.findIndex((r) => r.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const resource = resources[index];
  if (resource.type === "file") {
    await deleteFile(resource.url);
  }

  resources.splice(index, 1);
  await writeJSON("resources.json", resources);
  return NextResponse.json({ success: true });
}
