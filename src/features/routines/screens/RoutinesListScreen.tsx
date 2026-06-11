import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { Button, Screen, TextField } from '@/components';
import {
  FREE_ROUTINE_LIMIT,
  selectActiveRoutines,
  selectCanCreateRoutine,
  useAuthStore,
  useRoutinesStore,
} from '@/store';
import { colors, fontSize, spacing } from '@/theme';

import { RoutineCard } from '../components/RoutineCard';

export function RoutinesListScreen() {
  const router = useRouter();
  const routines = useRoutinesStore(useShallow(selectActiveRoutines));
  const exercises = useRoutinesStore((s) => s.exercises);
  const canCreate = useRoutinesStore(selectCanCreateRoutine);
  const createRoutine = useRoutinesStore((s) => s.createRoutine);
  const deleteRoutine = useRoutinesStore((s) => s.deleteRoutine);
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
      Alert.alert(
        'Routine limit reached',
        `The free plan allows ${FREE_ROUTINE_LIMIT} routines. Go premium for unlimited.`,
      );
      return;
    }
    setName('');
  };

  const onDelete = (id: string, routineName: string) => {
    Alert.alert('Delete routine', `Delete "${routineName}" and its exercises?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRoutine(id) },
    ]);
  };

  return (
    <Screen>
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
          Free plan: {FREE_ROUTINE_LIMIT} routines max. Go premium for unlimited.
        </Text>
      )}

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No routines yet. Create your first above.</Text>
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

      <Button
        title="Sign out"
        variant="ghost"
        onPress={() => void signOut()}
        style={styles.signOut}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  addRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    paddingTop: spacing.lg,
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
  },
  list: {
    paddingVertical: spacing.lg,
    flexGrow: 1,
  },
  separator: {
    height: spacing.md,
  },
  empty: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  signOut: {
    marginBottom: spacing.sm,
  },
});
