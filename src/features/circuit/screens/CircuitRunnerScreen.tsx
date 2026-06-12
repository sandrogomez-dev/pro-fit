import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Button, Screen } from '@/components';
import { useCircuitStore, useRoutinesStore } from '@/store';
import { colors, fontSize, fontWeight, radius, spacing, tracking } from '@/theme';

import { buildCircuit } from '../buildCircuit';

function format(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export function CircuitRunnerScreen() {
  useKeepAwake();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const router = useRouter();

  const running = useCircuitStore((s) => s.running);
  const paused = useCircuitStore((s) => s.paused);
  const finished = useCircuitStore((s) => s.finished);
  const steps = useCircuitStore(useShallow((s) => s.steps));
  const index = useCircuitStore((s) => s.index);
  const stepEndsAt = useCircuitStore((s) => s.stepEndsAt);
  const pausedRemaining = useCircuitStore((s) => s.pausedRemaining);
  const start = useCircuitStore((s) => s.start);
  const advance = useCircuitStore((s) => s.advance);
  const skip = useCircuitStore((s) => s.skip);
  const pause = useCircuitStore((s) => s.pause);
  const resume = useCircuitStore((s) => s.resume);
  const stop = useCircuitStore((s) => s.stop);

  // Build and start the circuit once on mount; tear it down on leave.
  useEffect(() => {
    if (!routineId) return;
    const { routines, exercises } = useRoutinesStore.getState();
    const routine = routines.find((r) => r.id === routineId && !r.pendingDelete);
    const list = exercises
      .filter((e) => e.routine_id === routineId && !e.pendingDelete)
      .sort((a, b) => a.order - b.order);
    if (!routine || list.length === 0) return;
    start(routine.id, routine.name, buildCircuit(routine, list));
    return () => stop();
  }, [routineId, start, stop]);

  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!running || paused || stepEndsAt == null) return;
    const tick = () => {
      const left = Math.ceil((stepEndsAt - Date.now()) / 1000);
      if (left <= 0) {
        setRemaining(0);
        advance();
      } else {
        setRemaining(left);
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [running, paused, stepEndsAt, advance]);

  const onExit = () => {
    stop();
    router.back();
  };

  if (finished) {
    return (
      <Screen centered>
        <View style={styles.done}>
          <Text style={styles.doneTitle}>WORKOUT{'\n'}COMPLETE 💪</Text>
          <Button title="Log this workout" onPress={() => router.replace({ pathname: '/workout/[routineId]', params: { routineId } })} />
          <Button title="Done" variant="ghost" onPress={onExit} />
        </View>
      </Screen>
    );
  }

  const current = steps[index];
  if (!running || !current) {
    return (
      <Screen centered>
        <View style={styles.done}>
          <Text style={styles.emptyTitle}>Nothing to run</Text>
          <Text style={styles.emptyText}>Add exercises to this routine first.</Text>
          <Button title="Back" variant="secondary" onPress={onExit} />
        </View>
      </Screen>
    );
  }

  const next = steps[index + 1];
  const shown = paused && pausedRemaining != null ? Math.ceil(pausedRemaining / 1000) : remaining;
  const isWork = current.kind === 'work';
  const phaseColor = isWork ? colors.accent : colors.success;

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.round}>
            ROUND {current.round} / {current.totalRounds}
          </Text>
          <Pressable onPress={onExit} hitSlop={spacing.md}>
            <Text style={styles.exit}>Stop</Text>
          </Pressable>
        </View>

        <View style={styles.center}>
          <Text style={[styles.phase, { color: phaseColor }]}>{isWork ? 'WORK' : 'REST'}</Text>
          <Text style={styles.exercise} numberOfLines={2}>
            {current.exerciseName}
          </Text>
          <Text style={[styles.count, { color: phaseColor }]}>{format(shown)}</Text>
          <Text style={styles.next}>
            {next ? `NEXT: ${next.exerciseName}` : 'LAST ONE — FINISH STRONG'}
          </Text>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={paused ? resume : pause} style={[styles.control, styles.controlPrimary]}>
            <Text style={styles.controlPrimaryText}>{paused ? 'Resume' : 'Pause'}</Text>
          </Pressable>
          <Pressable onPress={skip} style={styles.control}>
            <Text style={styles.controlText}>Skip</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: spacing.lg,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  round: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    letterSpacing: tracking.wider,
  },
  exit: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  phase: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    letterSpacing: tracking.wider,
  },
  exercise: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  count: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.black,
    fontVariant: ['tabular-nums'],
  },
  next: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: tracking.wide,
  },
  controls: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  control: {
    flex: 1,
    minHeight: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  controlText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
  controlPrimaryText: {
    color: colors.textInverse,
    fontSize: fontSize.md,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
  done: {
    gap: spacing.lg,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  doneTitle: {
    color: colors.text,
    fontSize: fontSize.hero,
    fontWeight: fontWeight.black,
    letterSpacing: tracking.tight,
    textAlign: 'center',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
