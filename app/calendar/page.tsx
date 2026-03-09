"use client";

import { useEffect, useState, useMemo } from "react";
import type { Exam, Deadline, Course } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getCalendarCells(year: number, month: number): { date: Date; day: number; isCurrentMonth: boolean }[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const daysInMonth = last.getDate();
  const startOffset = (first.getDay() + 6) % 7; // Mon = 0
  const prevLast = new Date(year, month, 0);
  const prevDays = prevLast.getDate();
  const cells: { date: Date; day: number; isCurrentMonth: boolean }[] = [];
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    if (i < startOffset) {
      const day = prevDays - startOffset + 1 + i;
      cells.push({
        date: new Date(year, month - 1, day),
        day,
        isCurrentMonth: false,
      });
    } else if (i < startOffset + daysInMonth) {
      const day = i - startOffset + 1;
      cells.push({
        date: new Date(year, month, day),
        day,
        isCurrentMonth: true,
      });
    } else {
      const day = i - startOffset - daysInMonth + 1;
      cells.push({
        date: new Date(year, month + 1, day),
        day,
        isCurrentMonth: false,
      });
    }
  }
  return cells;
}

function isToday(d: Date): boolean {
  const today = new Date();
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [exams, setExams] = useState<Exam[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/exams").then((r) => r.json()),
      fetch("/api/deadlines").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ]).then(([examsData, deadlinesData, coursesData]) => {
      setExams(examsData);
      setDeadlines(deadlinesData);
      setCourses(coursesData);
    }).catch(() => {});
  }, []);

  const courseName = (id: string) => courses.find((c) => c.id === id)?.name ?? "Unknown";

  const cells = useMemo(() => getCalendarCells(year, month), [year, month]);

  const selectedItems = useMemo(() => {
    if (!selectedDate) return { exams: [] as Exam[], deadlines: [] as Deadline[] };
    return {
      exams: exams.filter((e) => e.date === selectedDate),
      deadlines: deadlines.filter((d) => d.date === selectedDate),
    };
  }, [selectedDate, exams, deadlines]);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const getItemsForDate = (dateStr: string) => {
    const dayExams = exams.filter((e) => e.date === dateStr);
    const dayDeadlines = deadlines.filter((d) => d.date === dateStr);
    return { dayExams, dayDeadlines };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exam Calendar</h1>
        <p className="text-sm text-muted">Month view of exams and deadlines</p>
      </div>

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <button
            onClick={prevMonth}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            ← Prev
          </button>
          <h2 className="text-lg font-semibold">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            Next →
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-px">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="bg-surface-hover py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted"
              >
                {d}
              </div>
            ))}
            {cells.map((cell, i) => {
              const dateStr = toYMD(cell.date);
              const { dayExams, dayDeadlines } = getItemsForDate(dateStr);
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`
                    min-h-[100px] rounded-lg border p-2 text-left transition-colors
                    ${cell.isCurrentMonth ? "bg-surface text-foreground" : "bg-background text-muted"}
                    ${isToday(cell.date) ? "ring-2 ring-accent ring-offset-2 ring-offset-background" : "border-transparent"}
                    ${isSelected ? "ring-2 ring-accent" : ""}
                    hover:bg-surface-hover
                  `}
                >
                  <span className={`block text-sm font-medium ${!cell.isCurrentMonth ? "opacity-50" : ""}`}>
                    {cell.day}
                  </span>
                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayExams.slice(0, 2).map((e) => (
                      <div
                        key={e.id}
                        className="truncate rounded px-1.5 py-0.5 text-xs font-medium bg-accent/10 text-accent"
                        title={`${e.title} - ${courseName(e.courseId)}`}
                      >
                        {e.title}
                      </div>
                    ))}
                    {dayDeadlines.slice(0, 2).map((d) => (
                      <div
                        key={d.id}
                        className={`truncate rounded px-1.5 py-0.5 text-xs font-medium bg-warning/10 text-warning ${d.done ? "line-through opacity-70" : ""}`}
                        title={`${d.title} - ${courseName(d.courseId)}`}
                      >
                        {d.title}
                      </div>
                    ))}
                    {(dayExams.length + dayDeadlines.length) > 2 && (
                      <span className="text-xs text-muted">
                        +{dayExams.length + dayDeadlines.length - 2}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-IN", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h3>
          <div className="space-y-2">
            {selectedItems.exams.length === 0 && selectedItems.deadlines.length === 0 ? (
              <p className="text-sm text-muted">No exams or deadlines on this day.</p>
            ) : (
              <>
                {selectedItems.exams.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-2 rounded-lg border border-border bg-accent/10 px-3 py-2"
                  >
                    <span className="rounded bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                      Exam
                    </span>
                    <div>
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="text-xs text-muted">{courseName(e.courseId)} · {e.type}</p>
                    </div>
                  </div>
                ))}
                {selectedItems.deadlines.map((d) => (
                  <div
                    key={d.id}
                    className={`flex items-center gap-2 rounded-lg border border-border bg-warning/10 px-3 py-2 ${d.done ? "opacity-70" : ""}`}
                  >
                    <span className="rounded bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning">
                      {d.type}
                    </span>
                    <div>
                      <p className={`text-sm font-medium ${d.done ? "line-through text-muted" : ""}`}>
                        {d.title}
                      </p>
                      <p className="text-xs text-muted">{courseName(d.courseId)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
