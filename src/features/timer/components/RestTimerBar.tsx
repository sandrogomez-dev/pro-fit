import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTimerStore } from '@/store';
import { colors, fontSize, fontWeight, radius, spacing, tracking } from '@/theme';

function format(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

/**
 * Floating rest-timer bar. Cosmetic countdown (the scheduled notification is the
 * source of truth, AGENTS.md §13). Shown only while a rest is active; lets the user
 * add/remove time or skip. Mounted once, app-wide, over the authed stack.
 */
export function RestTimerBar() {
  const insets = useSafeAreaInsets();
  const active = useTimerStore((s) => s.active);
  const phase = useTimerStore((s) => s.phase);
  const endsAt = useTimerStore((s) => s.endsAt);
  const durationSeconds = useTimerStore((s) => s.durationSeconds);
  const addTime = useTimerStore((s) => s.addTime);
  const cancel = useTimerStore((s) => s.cancel);
  const expire = useTimerStore((s) => s.expire);

  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!active || endsAt == null) return;

    const tick = () => {
      const left = Math.ceil((endsAt - Date.now()) / 1000);
      if (left <= 0) {
        setRemaining(0);
        expire();
      } else {
        setRemaining(left);
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [active, endsAt, expire]);

  if (!active) return null;

  const fraction = Math.max(0, Math.min(1, remaining / durationSeconds));
  const phaseColor = phase === 'work' ? colors.accent : colors.success;

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + spacing.md }]}>
      <View style={[styles.bar, { borderColor: phaseColor }]}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${fraction * 100}%`, backgroundColor: phaseColor }]}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.timeBlock}>
            <Text style={[styles.label, { color: phaseColor }]}>
              {phase === 'work' ? 'WORK' : 'REST'}
            </Text>
            <Text style={styles.time}>{format(remaining)}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable onPress={() => addTime(-15)} hitSlop={spacing.sm} style={styles.adjust}>
              <Text style={styles.adjustText}>−15</Text>
            </Pressable>
            <Pressable onPress={() => addTime(30)} hitSlop={spacing.sm} style={styles.adjust}>
              <Text style={styles.adjustText}>+30</Text>
            </Pressable>
            <Pressable onPress={cancel} hitSlop={spacing.sm} style={[styles.skip, { backgroundColor: phaseColor }]}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
  },
  bar: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    overflow: 'hidden',
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.border,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.accent,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  label: {
    color: colors.accent,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.extrabold,
    letterSpacing: tracking.wider,
  },
  time: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    fontVariant: ['tabular-nums'],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adjust: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adjustText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  skip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  skipText: {
    color: colors.textInverse,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: tracking.wide,
  },
});
