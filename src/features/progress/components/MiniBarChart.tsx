import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

/**
 * Tiny dependency-free bar chart (best weight per day). Premium-only content.
 * Bars scale to the series max; needs at least two points to be meaningful.
 */
export function MiniBarChart({ data, color }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);

  return (
    <View style={styles.chart}>
      {data.map((value, index) => (
        <View
          key={index}
          style={[
            styles.bar,
            { height: `${Math.max(6, (value / max) * 100)}%`, backgroundColor: color ?? colors.accent },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  bar: {
    flex: 1,
    borderRadius: radius.sm,
    minWidth: 4,
  },
});
