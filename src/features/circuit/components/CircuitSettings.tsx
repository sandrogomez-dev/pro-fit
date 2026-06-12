import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components';
import { useRoutinesStore } from '@/store';
import type { LocalRoutine } from '@/types';
import { colors, fontSize, fontWeight, spacing, tracking } from '@/theme';

import { DEFAULT_CIRCUIT_REST_SECONDS, DEFAULT_WORK_SECONDS } from '../buildCircuit';

function toPositiveInt(value: string): number | null {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toRounds(value: string): number {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

/**
 * Routine-level circuit config: a single Work / Rest / Rounds applied to the whole
 * routine. Committed on blur so we don't sync on every keystroke. Per-exercise work
 * overrides remain available in the exercise editor.
 */
export function CircuitSettings({ routine }: { routine: LocalRoutine }) {
  const updateRoutine = useRoutinesStore((s) => s.updateRoutine);
  const [work, setWork] = useState(routine.work_seconds == null ? '' : String(routine.work_seconds));
  const [rest, setRest] = useState(routine.rest_seconds == null ? '' : String(routine.rest_seconds));
  const [rounds, setRounds] = useState(String(routine.rounds ?? 1));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Circuit timer</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <TextField
            label="Work (s)"
            value={work}
            onChangeText={setWork}
            placeholder={String(DEFAULT_WORK_SECONDS)}
            keyboardType="number-pad"
            onBlur={() => updateRoutine(routine.id, { work_seconds: toPositiveInt(work) })}
          />
        </View>
        <View style={styles.field}>
          <TextField
            label="Rest (s)"
            value={rest}
            onChangeText={setRest}
            placeholder={String(DEFAULT_CIRCUIT_REST_SECONDS)}
            keyboardType="number-pad"
            onBlur={() => updateRoutine(routine.id, { rest_seconds: toPositiveInt(rest) })}
          />
        </View>
        <View style={styles.field}>
          <TextField
            label="Rounds"
            value={rounds}
            onChangeText={setRounds}
            placeholder="1"
            keyboardType="number-pad"
            onBlur={() => {
              const r = toRounds(rounds);
              setRounds(String(r));
              updateRoutine(routine.id, { rounds: r });
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  title: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  field: {
    flex: 1,
  },
});
