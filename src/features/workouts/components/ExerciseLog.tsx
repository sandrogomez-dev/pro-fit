import { useShallow } from 'zustand/react/shallow';

import {
  DEFAULT_REST_SECONDS,
  selectSessionSetsForExercise,
  useTimerStore,
  useWorkoutStore,
} from '@/store';
import type { LocalExercise } from '@/types';

import { ExerciseLogCard } from './ExerciseLogCard';

/**
 * Connects one routine exercise to the workout store: pulls its session sets and
 * wires the set actions. New sets default to the previous set's values (or the
 * exercise target), which is the fast in-gym logging flow.
 */
export function ExerciseLog({ exercise }: { exercise: LocalExercise }) {
  const sets = useWorkoutStore(useShallow(selectSessionSetsForExercise(exercise.id)));
  const addSet = useWorkoutStore((s) => s.addSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleDone = useWorkoutStore((s) => s.toggleDone);
  const deleteSet = useWorkoutStore((s) => s.deleteSet);
  const startRest = useTimerStore((s) => s.startRest);
  const startWork = useTimerStore((s) => s.startWork);
  const cancelTimer = useTimerStore((s) => s.cancel);

  const workSeconds = exercise.work_seconds ?? 0;
  const restSeconds = exercise.rest_seconds ?? DEFAULT_REST_SECONDS;
  const hasWork = workSeconds > 0;

  const onAddSet = () => {
    const last = sets[sets.length - 1];
    addSet(exercise.id, {
      reps: last?.reps ?? exercise.target_reps ?? 0,
      weight: last?.weight ?? 0,
    });
  };

  // Timed exercises are driven by the ▶ Start (work → rest). For untimed ones,
  // marking a set done starts the rest timer; un-checking cancels it (AGENTS.md §13).
  const onToggleDone = (logId: string, currentlyDone: boolean) => {
    toggleDone(logId);
    if (hasWork) return;
    if (currentlyDone) cancelTimer();
    else startRest(restSeconds);
  };

  const onStartSet = hasWork ? () => startWork(workSeconds, restSeconds) : undefined;

  return (
    <ExerciseLogCard
      name={exercise.name}
      targetSets={exercise.target_sets}
      targetReps={exercise.target_reps}
      sets={sets}
      onAddSet={onAddSet}
      onCommitSet={updateSet}
      onToggleDone={onToggleDone}
      onDeleteSet={deleteSet}
      onStartSet={onStartSet}
    />
  );
}
