import { useShallow } from 'zustand/react/shallow';

import { selectSessionSetsForExercise, useWorkoutStore } from '@/store';
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

  const onAddSet = () => {
    const last = sets[sets.length - 1];
    addSet(exercise.id, {
      reps: last?.reps ?? exercise.target_reps ?? 0,
      weight: last?.weight ?? 0,
    });
  };

  return (
    <ExerciseLogCard
      name={exercise.name}
      targetSets={exercise.target_sets}
      targetReps={exercise.target_reps}
      sets={sets}
      onAddSet={onAddSet}
      onCommitSet={updateSet}
      onToggleDone={toggleDone}
      onDeleteSet={deleteSet}
    />
  );
}
