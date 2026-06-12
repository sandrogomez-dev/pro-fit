import { useShallow } from 'zustand/react/shallow';

import { selectSessionSetsForExercise, useTimerStore, useWorkoutStore } from '@/store';
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
  const startTimer = useTimerStore((s) => s.start);
  const cancelTimer = useTimerStore((s) => s.cancel);

  const onAddSet = () => {
    const last = sets[sets.length - 1];
    addSet(exercise.id, {
      reps: last?.reps ?? exercise.target_reps ?? 0,
      weight: last?.weight ?? 0,
    });
  };

  // Marking a set done starts the rest timer; un-checking cancels it (AGENTS.md §13).
  const onToggleDone = (logId: string, currentlyDone: boolean) => {
    toggleDone(logId);
    if (currentlyDone) cancelTimer();
    else startTimer();
  };

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
    />
  );
}
