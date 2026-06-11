/**
 * Global state barrel. Local-first, persisted slices live here (AGENTS.md §6).
 */
export { useAuthStore } from './authStore';
export {
  useRoutinesStore,
  FREE_ROUTINE_LIMIT,
  selectActiveRoutines,
  selectExercisesForRoutine,
  selectRoutineById,
  selectCanCreateRoutine,
} from './routinesStore';
