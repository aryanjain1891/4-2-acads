export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  credits: number;
  order?: number;
}

export interface Exam {
  id: string;
  courseId: string;
  type: string;
  title: string;
  date: string;
  syllabus: string;
}

export interface EvalComponent {
  id: string;
  courseId: string;
  name: string;
  weightage: number;
  maxMarks: number | null;
  obtained: number | null;
}

export interface Resource {
  id: string;
  courseId: string;
  title: string;
  type: "link" | "file";
  url: string;
  fileType: string | null;
  folder?: string;
  order?: number;
  isPYQ?: boolean;
  isSolution?: boolean;
  solutionStatus?: "included" | "separate" | "unavailable";
  solutionId?: string;
}

export interface ResourceFolder {
  courseId: string;
  name: string;
}

export interface Handout {
  id: string;
  courseId: string;
  filename: string;
  displayName: string;
  path: string;
}

export interface Deadline {
  id: string;
  courseId: string;
  title: string;
  date: string;
  type: "assignment" | "project" | "report" | "other";
  done: boolean;
}
