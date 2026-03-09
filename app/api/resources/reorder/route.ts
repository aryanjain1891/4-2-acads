import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Resource } from "@/lib/types";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { orderedIds } = body as { orderedIds: string[] };
  if (!orderedIds || !Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds array required" }, { status: 400 });
  }
  const resources = await readJSON<Resource>("resources.json");
  for (let i = 0; i < orderedIds.length; i++) {
    const idx = resources.findIndex((r) => r.id === orderedIds[i]);
    if (idx !== -1) resources[idx].order = i;
  }
  await writeJSON("resources.json", resources);
  return NextResponse.json({ success: true });
}
