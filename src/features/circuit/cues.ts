import { playDone, playGo, playTick, speak } from '@/services';
import { useSettingsStore } from '@/store';

/**
 * Maps circuit events to audio cues, honouring the user's audio mode
 * (off / beeps / voice / both). Beeps are the default; voice uses system TTS.
 */
function mode() {
  return useSettingsStore.getState().audioMode;
}

export function cueWork(exerciseName: string): void {
  const m = mode();
  if (m === 'off') return;
  if (m === 'beeps' || m === 'both') playGo();
  if (m === 'voice' || m === 'both') speak(exerciseName);
}

export function cueRest(nextExerciseName: string): void {
  const m = mode();
  if (m === 'off') return;
  if (m === 'beeps' || m === 'both') playGo();
  if (m === 'voice' || m === 'both') speak(`Rest. Next, ${nextExerciseName}`);
}

export function cueCountdown(): void {
  const m = mode();
  if (m === 'beeps' || m === 'both') playTick();
}

export function cueDone(): void {
  const m = mode();
  if (m === 'off') return;
  if (m === 'beeps' || m === 'both') playDone();
  if (m === 'voice' || m === 'both') speak('Workout complete');
}
