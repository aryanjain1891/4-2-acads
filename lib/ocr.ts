import { spawn } from "child_process";
import path from "path";

const OCR_SCRIPT = path.join(process.cwd(), "..", "ocr_pdf.py");

/**
 * Fire-and-forget: spawn the OCR script for a single PDF.
 * The .md transcript will appear next to the PDF when done.
 * Requires GEMINI_API_KEY in the server environment.
 */
export function triggerOCR(relativeUrl: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("[ocr] GEMINI_API_KEY not set — skipping OCR for", relativeUrl);
    return;
  }

  const pdfPath = path.join(process.cwd(), "content", relativeUrl);

  const child = spawn("python3", [OCR_SCRIPT, pdfPath], {
    detached: true,
    stdio: "ignore",
    env: { ...process.env, GEMINI_API_KEY: apiKey },
  });

  child.unref();
  console.log("[ocr] Triggered OCR for", relativeUrl, "(pid:", child.pid, ")");
}
