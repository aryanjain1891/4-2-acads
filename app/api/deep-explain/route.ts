import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { readJSON, writeJSON } from "@/lib/storage";
import {
  generateDeepExplanation,
  getDeepExplainOutputPath,
} from "@/lib/gemini";
import type { Resource } from "@/lib/types";

const CONTENT_DIR = path.join(process.cwd(), "content");

function getTranscriptPath(pdfUrl: string): string {
  return pdfUrl.replace(/\.pdf$/i, ".md");
}

export async function POST(req: NextRequest) {
  const { resourceId } = await req.json();
  if (!resourceId) {
    return NextResponse.json(
      { error: "resourceId is required" },
      { status: 400 }
    );
  }

  const resources = await readJSON<Resource>("resources.json");
  const resource = resources.find((r) => r.id === resourceId);
  if (!resource) {
    return NextResponse.json(
      { error: "Resource not found" },
      { status: 404 }
    );
  }

  if (resource.type !== "file") {
    return NextResponse.json(
      { error: "Resource must be a file" },
      { status: 400 }
    );
  }

  const transcriptRelPath = resource.url.endsWith(".md")
    ? resource.url
    : getTranscriptPath(resource.url);

  const transcriptFullPath = path.join(CONTENT_DIR, transcriptRelPath);
  try {
    await fs.access(transcriptFullPath);
  } catch {
    return NextResponse.json(
      { error: "No transcript found for this resource. Upload a PDF first and wait for OCR to complete." },
      { status: 404 }
    );
  }

  const outputRelPath = getDeepExplainOutputPath(transcriptRelPath);
  const outputFullPath = path.join(CONTENT_DIR, outputRelPath);

  try {
    await fs.access(outputFullPath);
    return NextResponse.json(
      { alreadyExists: true, outputUrl: outputRelPath },
      { status: 200 }
    );
  } catch {
    // doesn't exist yet — generate it
  }

  try {
    const text = await generateDeepExplanation(transcriptRelPath);

    await fs.mkdir(path.dirname(outputFullPath), { recursive: true });
    await fs.writeFile(outputFullPath, text, "utf-8");

    return NextResponse.json(
      { alreadyExists: false, outputUrl: outputRelPath },
      { status: 201 }
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
