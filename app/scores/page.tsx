"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Course, EvalComponent } from "@/lib/types";

function useCourseScores(
  courses: Course[],
  scores: EvalComponent[]
): Map<
  string,
  { componentsDone: number; totalComponents: number; weightedScore: number; completedWeight: number }
> {
  const map = new Map<
    string,
    { componentsDone: number; totalComponents: number; weightedScore: number; completedWeight: number }
  >();
  for (const course of courses) {
    const courseScores = scores.filter((s) => s.courseId === course.id);
    const totalComponents = courseScores.length;
    const completed = courseScores.filter((s) => s.obtained != null && s.maxMarks != null);
    const componentsDone = completed.length;
    const weightedScore = completed.reduce(
      (acc, s) => acc + ((s.obtained ?? 0) / (s.maxMarks ?? 1)) * s.weightage,
      0
    );
    const completedWeight = completed.reduce((acc, s) => acc + s.weightage, 0);
    map.set(course.id, { componentsDone, totalComponents, weightedScore, completedWeight });
  }
  return map;
}

const TABLE_GRID = "grid grid-cols-[1fr_auto_auto_1fr_minmax(100px,1fr)] gap-4";

export default function ScoresPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [scores, setScores] = useState<EvalComponent[]>([]);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then(setCourses)
      .catch(() => {});
    fetch("/api/scores")
      .then((r) => r.json())
      .then(setScores)
      .catch(() => {});
  }, []);

  const courseScores = useCourseScores(courses, scores);

  if (courses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Scores</h1>
          <p className="text-sm text-muted">Overview across all courses</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <p className="text-muted">No courses yet. Add courses from the dashboard to see scores here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Scores</h1>
        <p className="text-sm text-muted">Overview across all courses</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className={`${TABLE_GRID} border-b border-border bg-surface-hover px-4 py-3 text-xs uppercase tracking-wider text-muted`}>
          <span>Course Name</span>
          <span>Code</span>
          <span>Components Done</span>
          <span>Weighted % So Far</span>
          <span>Progress</span>
        </div>
        {courses.map((course) => {
          const data = courseScores.get(course.id);
          const componentsDone = data?.componentsDone ?? 0;
          const totalComponents = data?.totalComponents ?? 0;
          const weightedScore = data?.weightedScore ?? 0;
          const completedWeight = data?.completedWeight ?? 0;
          const pct =
            completedWeight > 0 ? Math.min(100, (weightedScore / completedWeight) * 100) : 0;

          return (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className={`${TABLE_GRID} items-center border-b border-border px-4 py-3 text-sm text-foreground no-underline transition-colors last:border-0 hover:bg-surface-hover`}
            >
              <span className="font-medium">{course.name}</span>
              <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                {course.code}
              </span>
              <span className="text-muted">
                {componentsDone}/{totalComponents}
              </span>
              <span>
                {completedWeight > 0 ? (
                  <>
                    {weightedScore.toFixed(1)}%{" "}
                    <span className="text-muted">/ {completedWeight}%</span>
                  </>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </span>
              <div className="h-2 min-w-[80px] overflow-hidden rounded-full bg-accent/20">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
