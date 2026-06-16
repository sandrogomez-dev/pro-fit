import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Screen, notify } from '@/components';
import { FREE_ROUTINE_LIMIT, useRoutinesStore } from '@/store';
import { colors, fontSize, fontWeight, radius, spacing, tracking } from '@/theme';

import { ROUTINE_TEMPLATES, type RoutineTemplate } from '../templates';

export function TemplatesScreen() {
  const router = useRouter();
  const addRoutineFromTemplate = useRoutinesStore((s) => s.addRoutineFromTemplate);

  const onAdd = (template: RoutineTemplate) => {
    const id = addRoutineFromTemplate(template);
    if (id === null) {
      notify(
        'Routine limit reached',
        `The free plan allows ${FREE_ROUTINE_LIMIT} routines. Go premium for unlimited.`,
      );
      return;
    }
    router.replace({ pathname: '/routine/[id]', params: { id } });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Pick a ready-made circuit to start in seconds. You can tweak it after.</Text>
        {ROUTINE_TEMPLATES.map((template) => (
          <View key={template.id} style={styles.card}>
            <Text style={styles.name}>{template.name}</Text>
            <Text style={styles.description}>{template.description}</Text>
            <Text style={styles.meta}>
              {template.exercises.length} EXERCISES · {template.workSeconds}s / {template.restSeconds}s
              {' · '}
              {template.rounds} {template.rounds === 1 ? 'ROUND' : 'ROUNDS'}
            </Text>
            <Button title="Add to my routines" onPress={() => onAdd(template)} style={styles.add} />
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  intro: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  meta: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    letterSpacing: tracking.wide,
  },
  add: {
    marginTop: spacing.sm,
  },
});
