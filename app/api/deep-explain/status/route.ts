import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { readJSON } from "@/lib/storage";
import { getDeepExplainOutputPath } from "@/lib/gemini";
import type { Resource } from "@/lib/types";

const CONTENT_DIR = path.join(process.cwd(), "content");

export async function GET(req: NextRequest) {
  const courseId = req.nextUrl.searchParams.get("courseId");
  if (!courseId) {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 }
    );
  }

  const resources = await readJSON<Resource>("resources.json");
  const courseResources = resources.filter(
    (r) => r.courseId === courseId && r.type === "file"
  );

  const statuses: Record<
    string,
    { hasTranscript: boolean; hasExplainer: boolean; explainerUrl?: string }
  > = {};

  for (const r of courseResources) {
    const transcriptRel = r.url.endsWith(".md")
      ? r.url
      : r.url.replace(/\.pdf$/i, ".md");
    const transcriptFull = path.join(CONTENT_DIR, transcriptRel);
    const explainerRel = getDeepExplainOutputPath(transcriptRel);
    const explainerFull = path.join(CONTENT_DIR, explainerRel);

    let hasTranscript = false;
    let hasExplainer = false;

    try {
      await fs.access(transcriptFull);
      hasTranscript = true;
    } catch {}

    try {
      await fs.access(explainerFull);
      hasExplainer = true;
    } catch {}

    if (hasTranscript || hasExplainer) {
      statuses[r.id] = {
        hasTranscript,
        hasExplainer,
        ...(hasExplainer && { explainerUrl: explainerRel }),
      };
    }
  }

  return NextResponse.json(statuses);
}
