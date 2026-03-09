import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Resource } from "@/lib/types";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { updates } = body as { updates: { id: string; folder?: string }[] };
  if (!updates || !Array.isArray(updates)) {
    return NextResponse.json({ error: "updates array required" }, { status: 400 });
  }
  const resources = await readJSON<Resource>("resources.json");
  for (const u of updates) {
    const idx = resources.findIndex((r) => r.id === u.id);
    if (idx !== -1 && u.folder !== undefined) {
      resources[idx].folder = u.folder;
    }
  }
  await writeJSON("resources.json", resources);
  return NextResponse.json({ success: true });
}
