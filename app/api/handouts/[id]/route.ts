import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON, deleteFile } from "@/lib/storage";
import type { Handout } from "@/lib/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const handouts = await readJSON<Handout>("handouts.json");
  const index = handouts.findIndex((h) => h.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Handout not found" }, { status: 404 });
  }
  if (body.displayName) {
    handouts[index].displayName = String(body.displayName);
  }
  await writeJSON("handouts.json", handouts);
  return NextResponse.json(handouts[index]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const handouts = await readJSON<Handout>("handouts.json");
  const index = handouts.findIndex((h) => h.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Handout not found" }, { status: 404 });
  }

  const handout = handouts[index];
  await deleteFile(handout.path);

  handouts.splice(index, 1);
  await writeJSON("handouts.json", handouts);
  return NextResponse.json({ success: true });
}
