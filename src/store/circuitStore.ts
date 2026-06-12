import { create } from 'zustand';

import { restEndHaptic } from '@/services';

export interface CircuitStep {
  kind: 'work' | 'rest';
  exerciseId: string;
  /** For work: the current exercise. For rest: the exercise coming up next. */
  exerciseName: string;
  durationSeconds: number;
  round: number;
  totalRounds: number;
}

interface CircuitState {
  running: boolean;
  paused: boolean;
  finished: boolean;
  routineId: string | null;
  routineName: string | null;
  steps: CircuitStep[];
  index: number;
  /** Epoch ms when the current step ends (null while paused/stopped). */
  stepEndsAt: number | null;
  pausedRemaining: number | null;

  start: (routineId: string, routineName: string, steps: CircuitStep[]) => void;
  /** Current step elapsed (called by the runner tick) → advance or finish. */
  advance: () => void;
  /** Manually jump to the next step. */
  skip: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

/**
 * Guided circuit runner (AGENTS.md §13, extended). Plays a routine hands-free:
 * work → rest → next exercise, looping for the configured rounds. The runner screen
 * keeps the display awake and drives the countdown; transitions fire a haptic.
 * In-memory only — a circuit is a live session, not persisted.
 */
export const useCircuitStore = create<CircuitState>((set, get) => {
  function goToNext(withHaptic: boolean): void {
    const { steps, index } = get();
    const nextStep = steps[index + 1];
    if (!nextStep) {
      set({ running: false, finished: true, stepEndsAt: null, pausedRemaining: null });
      if (withHaptic) void restEndHaptic();
      return;
    }
    set({
      index: index + 1,
      stepEndsAt: Date.now() + nextStep.durationSeconds * 1000,
      paused: false,
      pausedRemaining: null,
    });
    if (withHaptic) void restEndHaptic();
  }

  return {
    running: false,
    paused: false,
    finished: false,
    routineId: null,
    routineName: null,
    steps: [],
    index: 0,
    stepEndsAt: null,
    pausedRemaining: null,

    start: (routineId, routineName, steps) => {
      const first = steps[0];
      if (!first) return;
      set({
        running: true,
        paused: false,
        finished: false,
        routineId,
        routineName,
        steps,
        index: 0,
        stepEndsAt: Date.now() + first.durationSeconds * 1000,
        pausedRemaining: null,
      });
    },

    advance: () => {
      if (!get().running || get().paused) return;
      goToNext(true);
    },

    skip: () => {
      if (!get().running) return;
      goToNext(false);
    },

    pause: () => {
      const { running, paused, stepEndsAt } = get();
      if (!running || paused || stepEndsAt == null) return;
      set({
        paused: true,
        pausedRemaining: Math.max(0, stepEndsAt - Date.now()),
        stepEndsAt: null,
      });
    },

    resume: () => {
      const { paused, pausedRemaining } = get();
      if (!paused || pausedRemaining == null) return;
      set({
        paused: false,
        stepEndsAt: Date.now() + pausedRemaining,
        pausedRemaining: null,
      });
    },

    stop: () => {
      set({
        running: false,
        paused: false,
        finished: false,
        steps: [],
        index: 0,
        stepEndsAt: null,
        pausedRemaining: null,
        routineId: null,
        routineName: null,
      });
    },
  };
});
