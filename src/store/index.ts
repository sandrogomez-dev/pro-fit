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
  selectExerciseById,
  selectCanCreateRoutine,
} from './routinesStore';
export {
  useWorkoutStore,
  selectSession,
  selectSessionSetsForExercise,
} from './workoutStore';
export { useTimerStore, DEFAULT_REST_SECONDS } from './timerStore';
export { useCircuitStore, type CircuitStep } from './circuitStore';
export { useSessionsStore, selectSessions } from './sessionsStore';
export { useSettingsStore, type AudioMode } from './settingsStore';
