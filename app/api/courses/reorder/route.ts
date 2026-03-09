import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Course } from "@/lib/types";

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { orderedIds } = body as { orderedIds: string[] };
  if (!orderedIds || !Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds array required" }, { status: 400 });
  }
  const courses = await readJSON<Course>("courses.json");
  for (let i = 0; i < orderedIds.length; i++) {
    const idx = courses.findIndex((c) => c.id === orderedIds[i]);
    if (idx !== -1) courses[idx].order = i;
  }
  await writeJSON("courses.json", courses);
  return NextResponse.json({ success: true });
}
