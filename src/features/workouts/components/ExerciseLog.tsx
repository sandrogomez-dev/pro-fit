import { useShallow } from 'zustand/react/shallow';

import { selectSessionSetsForExercise, useTimerStore, useWorkoutStore } from '@/store';
import type { LocalExercise } from '@/types';

import { ExerciseLogCard } from './ExerciseLogCard';

/**
 * Connects one routine exercise to the workout store: pulls its session sets and
 * wires the set actions. Marking a set done starts the rest timer; un-checking
 * cancels it. New sets default to the previous set's values for fast logging.
 */
export function ExerciseLog({ exercise }: { exercise: LocalExercise }) {
  const sets = useWorkoutStore(useShallow(selectSessionSetsForExercise(exercise.id)));
  const addSet = useWorkoutStore((s) => s.addSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleDone = useWorkoutStore((s) => s.toggleDone);
  const deleteSet = useWorkoutStore((s) => s.deleteSet);
  const startRest = useTimerStore((s) => s.startRest);
  const cancelTimer = useTimerStore((s) => s.cancel);

  const onAddSet = () => {
    const last = sets[sets.length - 1];
    addSet(exercise.id, { reps: last?.reps ?? 0, weight: last?.weight ?? 0 });
  };

  const onToggleDone = (logId: string, currentlyDone: boolean) => {
    toggleDone(logId);
    if (currentlyDone) cancelTimer();
    else startRest();
  };

  return (
    <ExerciseLogCard
      name={exercise.name}
      sets={sets}
      onAddSet={onAddSet}
      onCommitSet={updateSet}
      onToggleDone={onToggleDone}
      onDeleteSet={deleteSet}
    />
  );
}
