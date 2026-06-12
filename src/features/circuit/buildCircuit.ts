import type { CircuitStep } from '@/store';
import type { LocalExercise, LocalRoutine } from '@/types';

export const DEFAULT_WORK_SECONDS = 30;
export const DEFAULT_CIRCUIT_REST_SECONDS = 15;

/**
 * Expand a routine into the ordered list of timed steps for the guided runner:
 * for each round, each exercise's WORK phase followed by a REST (except after the
 * very last work). A per-exercise `work_seconds` overrides the routine default.
 */
export function buildCircuit(routine: LocalRoutine, exercises: LocalExercise[]): CircuitStep[] {
  const steps: CircuitStep[] = [];
  if (exercises.length === 0) return steps;

  const totalRounds = Math.max(1, routine.rounds ?? 1);
  const work = routine.work_seconds ?? DEFAULT_WORK_SECONDS;
  const rest = routine.rest_seconds ?? DEFAULT_CIRCUIT_REST_SECONDS;

  for (let round = 1; round <= totalRounds; round++) {
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      if (!exercise) continue;

      steps.push({
        kind: 'work',
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        durationSeconds: exercise.work_seconds ?? work,
        round,
        totalRounds,
      });

      const isLast = round === totalRounds && i === exercises.length - 1;
      if (!isLast && rest > 0) {
        const next = exercises[i + 1] ?? exercises[0];
        if (next) {
          steps.push({
            kind: 'rest',
            exerciseId: next.id,
            exerciseName: next.name,
            durationSeconds: rest,
            round,
            totalRounds,
          });
        }
      }
    }
  }
  return steps;
}
