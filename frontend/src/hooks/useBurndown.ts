import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

interface Sprint {
  id: string;
  sprint_number: number;
  sprint_name?: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

interface Story {
  id: string;
  sprint_id: string | null;
  title: string;
  points: number | null;
  isDone: boolean;
  date_added: string | null;
  date_completed: string | null;
}

interface BurndownPoint {
  day: string;
  actual: number | null;
  ideal: number;
  isoDate: string;
}

function parseYMDToLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatAxisLabel(index: number, date: Date): string {
  const pretty = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `Day ${index + 1}|${pretty}`;
}

function sumPoints(stories: Story[]): number {
  return stories.reduce((sum, story) => sum + (story.points ?? 0), 0);
}

export function useSprintBurndownData(projectId: string, sprintId: string) {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!projectId || !sprintId) {
      setSprint(null);
      setStories([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [sprintsRes, storiesRes] = await Promise.all([
          api<Sprint[]>(`/sprints?project_id=${projectId}`),
          api<Story[]>(`/stories?project_id=${projectId}`),
        ]);

        if (cancelled) return;

        const allSprints = Array.isArray(sprintsRes) ? sprintsRes : [];
        const allStories = Array.isArray(storiesRes) ? storiesRes : [];

        const selectedSprint = allSprints.find((s) => s.id === sprintId) ?? null;
        const sprintStories = allStories.filter((story) => story.sprint_id === sprintId);

        setSprint(selectedSprint);
        setStories(sprintStories);
      } catch (err) {
        console.error("Error loading burndown data:", err);
        if (!cancelled) {
          setSprint(null);
          setStories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [projectId, sprintId]);

  const chartData = useMemo<BurndownPoint[]>(() => {
    if (!sprint?.start_date || !sprint?.end_date) return [];

    const sprintStart = parseYMDToLocalDate(sprint.start_date);
    const sprintEnd = parseYMDToLocalDate(sprint.end_date);

    if (sprintEnd < sprintStart) return [];

    const days: Date[] = [];
    const cursor = new Date(sprintStart);

    while (cursor <= sprintEnd) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    const totalPoints = sumPoints(stories);

    return days.map((date, idx) => {
      const isoDate = toLocalISODate(date);

      const remaining = stories.reduce((sum, story) => {
        const pts = story.points ?? 0;
        const addedDate = story.date_added || sprint.start_date;
        const completedDate = story.date_completed;

        if (addedDate > isoDate) return sum;

        if (completedDate && completedDate < isoDate) {
          return sum;
        }

        return sum + pts;
      }, 0);

      const ideal = totalPoints - (totalPoints * idx) / Math.max(days.length - 1, 1);

      return {
        day: formatAxisLabel(idx, date),
        isoDate,
        actual: remaining,
        ideal: Number(ideal.toFixed(1)),
      };
    });
  }, [sprint, stories]);

  const velocity = useMemo(() => {
    return stories
      .filter((story) => Boolean(story.date_completed))
      .reduce((sum, story) => sum + (story.points ?? 0), 0);
  }, [stories]);

  const expectedVelocity = useMemo(() => {
    return stories.reduce((sum, story) => sum + (story.points ?? 0), 0);
  }, [stories]);

  return {
    chartData,
    sprintNumber: sprint?.sprint_number ?? "—",
    velocity,
    expectedVelocity,
    loading,
  };
}