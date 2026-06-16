import { Linking, Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize, fontWeight, spacing, tracking } from '@/theme';

/**
 * Opens a focused "how to" search for an exercise (interim until an in-app
 * animation library is licensed). Universal — works for any free-text name.
 */
export function HowToButton({ name, label = 'How to do it' }: { name: string; label?: string }) {
  if (name.trim() === '') return null;

  const onPress = () => {
    const query = encodeURIComponent(`how to do ${name.trim()} exercise`);
    void Linking.openURL(`https://www.youtube.com/results?search_query=${query}`);
  };

  return (
    <Pressable onPress={onPress} hitSlop={spacing.sm} style={styles.btn}>
      <Text style={styles.text}>▶ {label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  text: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    letterSpacing: tracking.wide,
  },
});
