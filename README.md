# 4-2 Acads

A local-first academic tracker that puts your entire semester into one clean interface. Track courses, exams, scores, resources, handouts, study plans, and assignments — with Cursor IDE and AI integration.

## Features

- **Dashboard** — Upcoming exams and deadlines at a glance, course cards with weighted scores
- **Course Management** — Add courses with custom evaluation structures (user-defined components and weights)
- **Exam & Deadline Tracking** — Quiz, midsem, endsem dates with calendar view and countdown
- **Score Tracker** — Define grading components per course, enter marks, see live weighted percentages
- **Resources** — Upload files or add links, organize into collapsible folders, drag-to-reorder, bulk upload, inline PDF/image preview
- **PYQ Management** — Upload previous year question papers with linked solutions
- **Handouts** — Course handout uploads with inline preview
- **Study Plans** — Per-course Markdown editor with live preview
- **Assignments** — Create assignment workspace folders, open in Cursor IDE
- **AI Integration** — Auto-transcribe uploaded PDFs via Gemini OCR; one-click AI prompts referencing your lecture notes for Cursor
- **Calendar** — Month view with color-coded exams and deadlines
- **Dark Mode** — Toggle in sidebar
- **PPTX to PDF** — Auto-converts Office documents to PDF on upload (requires LibreOffice)

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- @dnd-kit for drag-and-drop
- File-based storage (JSON + disk files, no database)
- Single-user, runs locally

## Setup

```bash
# Install dependencies
npm install

# Copy env file and add your Gemini API key (optional, for PDF OCR)
cp .env.example .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On first run, the app creates `data/`, `content/`, and `assignments/` directories automatically as you add courses and resources.

### Optional: PPTX to PDF conversion

To auto-convert `.pptx`, `.docx`, and other Office formats to PDF on upload, install LibreOffice:

```bash
# macOS
brew install --cask libreoffice

# Ubuntu/Debian
sudo apt install libreoffice
```

## Storage Layout

```
data/              # JSON data files (auto-created)
  courses.json
  exams.json
  scores.json
  resources.json
  handouts.json
  deadlines.json
  resource-folders.json

content/           # Uploaded files (auto-created)
  handouts/{courseId}/
  resources/{courseId}/
  plans/{courseId}.md

assignments/       # Assignment workspaces (auto-created)
  {courseId}/{slug}/
```

## License

MIT
