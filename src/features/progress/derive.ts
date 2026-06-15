import type { LocalExercise, LocalWorkoutLog } from '@/types';

/**
 * Progress is auto-derived from workout_logs (AGENTS.md §12), not hand-entered.
 * Pure functions so they're trivial to reason about and test.
 */

export interface PrEntry {
  exerciseId: string;
  exerciseName: string;
  bestWeight: number;
  reps: number;
  achievedAt: string;
  /** Best weight per day, chronological — for the mini chart. */
  series: number[];
}

export interface HistoryExercise {
  name: string;
  sets: number;
  topWeight: number;
}

export interface HistoryDay {
  date: string; // YYYY-MM-DD
  totalSets: number;
  exercises: HistoryExercise[];
}

function dayOf(iso: string): string {
  return iso.slice(0, 10);
}

function nameMap(exercises: LocalExercise[]): Map<string, string> {
  return new Map(exercises.filter((e) => !e.pendingDelete).map((e) => [e.id, e.name]));
}

/** Best weight per exercise (weight > 0), with a per-day series for charting. */
export function derivePRs(logs: LocalWorkoutLog[], exercises: LocalExercise[]): PrEntry[] {
  const names = nameMap(exercises);
  const byExercise = new Map<string, LocalWorkoutLog[]>();
  for (const log of logs) {
    if (log.pendingDelete || log.weight <= 0) continue;
    const list = byExercise.get(log.exercise_id);
    if (list) list.push(log);
    else byExercise.set(log.exercise_id, [log]);
  }

  const entries: PrEntry[] = [];
  for (const [exerciseId, group] of byExercise) {
    let best = group[0];
    if (!best) continue;
    for (const log of group) {
      if (log.weight > best.weight || (log.weight === best.weight && log.performed_at > best.performed_at)) {
        best = log;
      }
    }

    const bestByDay = new Map<string, number>();
    for (const log of group) {
      const day = dayOf(log.performed_at);
      bestByDay.set(day, Math.max(bestByDay.get(day) ?? 0, log.weight));
    }
    const series = [...bestByDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, weight]) => weight);

    entries.push({
      exerciseId,
      exerciseName: names.get(exerciseId) ?? 'Exercise',
      bestWeight: best.weight,
      reps: best.reps,
      achievedAt: best.performed_at,
      series,
    });
  }

  return entries.sort((a, b) => b.bestWeight - a.bestWeight);
}

/** Workout history grouped by calendar day, most recent first. */
export function deriveHistory(
  logs: LocalWorkoutLog[],
  exercises: LocalExercise[],
  limitDays = 30,
): HistoryDay[] {
  const names = nameMap(exercises);
  const byDay = new Map<string, Map<string, HistoryExercise>>();

  for (const log of logs) {
    if (log.pendingDelete) continue;
    const day = dayOf(log.performed_at);
    let dayMap = byDay.get(day);
    if (!dayMap) {
      dayMap = new Map();
      byDay.set(day, dayMap);
    }
    const name = names.get(log.exercise_id) ?? 'Exercise';
    const entry = dayMap.get(log.exercise_id);
    if (entry) {
      entry.sets += 1;
      entry.topWeight = Math.max(entry.topWeight, log.weight);
    } else {
      dayMap.set(log.exercise_id, { name, sets: 1, topWeight: log.weight });
    }
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, limitDays)
    .map(([date, dayMap]) => {
      const exercises2 = [...dayMap.values()];
      return {
        date,
        totalSets: exercises2.reduce((sum, e) => sum + e.sets, 0),
        exercises: exercises2,
      };
    });
}
