import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Button, Screen, TextField, confirm, notify } from '@/components';
import {
  FREE_ROUTINE_LIMIT,
  selectActiveRoutines,
  selectCanCreateRoutine,
  useAuthStore,
  useRoutinesStore,
} from '@/store';
import { colors, fontSize, fontWeight, spacing, tracking } from '@/theme';

import { RoutineCard } from '../components/RoutineCard';

export function RoutinesListScreen() {
  const router = useRouter();
  const routines = useRoutinesStore(useShallow(selectActiveRoutines));
  const exercises = useRoutinesStore((s) => s.exercises);
  const canCreate = useRoutinesStore(selectCanCreateRoutine);
  const createRoutine = useRoutinesStore((s) => s.createRoutine);
  const deleteRoutine = useRoutinesStore((s) => s.deleteRoutine);
  const isPremium = useAuthStore((s) => s.isPremium);
  const signOut = useAuthStore((s) => s.signOut);

  const [name, setName] = useState('');

  const exerciseCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of exercises) {
      if (e.pendingDelete) continue;
      counts.set(e.routine_id, (counts.get(e.routine_id) ?? 0) + 1);
    }
    return counts;
  }, [exercises]);

  const onAdd = () => {
    const trimmed = name.trim();
    if (trimmed === '') return;
    const id = createRoutine(trimmed);
    if (id === null) {
      notify(
        'Routine limit reached',
        `The free plan allows ${FREE_ROUTINE_LIMIT} routines. Go premium for unlimited.`,
      );
      return;
    }
    setName('');
  };

  const onDelete = (id: string, routineName: string) => {
    confirm(
      {
        title: 'Delete routine',
        message: `Delete "${routineName}" and its exercises?`,
        confirmLabel: 'Delete',
        destructive: true,
      },
      () => deleteRoutine(id),
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>ROUTINES</Text>
          <Text style={styles.count}>
            {routines.length}
            {!isPremium && <Text style={styles.countMax}> / {FREE_ROUTINE_LIMIT}</Text>}
          </Text>
        </View>
        <Pressable onPress={() => void signOut()} hitSlop={spacing.md}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.addRow}>
        <View style={styles.addInput}>
          <TextField
            label="New routine"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Push day"
            autoCapitalize="sentences"
            editable={canCreate}
          />
        </View>
        <Button title="Add" onPress={onAdd} disabled={!canCreate} style={styles.addButton} />
      </View>
      {!canCreate && (
        <Text style={styles.limitNote}>
          Free plan: {FREE_ROUTINE_LIMIT} routines max — go premium for unlimited.
        </Text>
      )}

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No routines yet</Text>
            <Text style={styles.emptyText}>Create your first one above to start training.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <RoutineCard
            name={item.name}
            exerciseCount={exerciseCounts.get(item.id) ?? 0}
            onPress={() => router.push({ pathname: '/routine/[id]', params: { id: item.id } })}
            onDelete={() => onDelete(item.id, item.name)}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.xl,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.hero,
    fontWeight: fontWeight.black,
    letterSpacing: tracking.tight,
  },
  count: {
    color: colors.accent,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
  },
  countMax: {
    color: colors.textFaint,
    fontWeight: fontWeight.semibold,
  },
  signOut: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.sm,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
  addInput: {
    flex: 1,
  },
  addButton: {
    paddingHorizontal: spacing.xl,
  },
  limitNote: {
    color: colors.warning,
    fontSize: fontSize.xs,
    marginTop: spacing.sm,
    fontWeight: fontWeight.medium,
  },
  list: {
    paddingVertical: spacing.xl,
    flexGrow: 1,
  },
  separator: {
    height: spacing.md,
  },
  empty: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
