import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

/**
 * Audio cues for the circuit runner: short beeps (expo-audio) and spoken cues
 * (expo-speech, system TTS — no assets). Both work on web and native. Used only
 * while the runner screen is foregrounded, so no background-audio handling needed.
 */

// Allow cues to play even when the phone is on silent (best-effort).
void setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

function makePlayer(source: number): AudioPlayer | null {
  try {
    return createAudioPlayer(source);
  } catch {
    return null;
  }
}

const tick = makePlayer(require('../../assets/sounds/tick.wav'));
const go = makePlayer(require('../../assets/sounds/go.wav'));
const done = makePlayer(require('../../assets/sounds/done.wav'));

function fire(player: AudioPlayer | null): void {
  if (!player) return;
  try {
    player.seekTo(0);
    player.play();
  } catch {
    // Audio not ready / unsupported — ignore.
  }
}

export function playTick(): void {
  fire(tick);
}

export function playGo(): void {
  fire(go);
}

export function playDone(): void {
  fire(done);
}

export function speak(text: string): void {
  try {
    Speech.stop();
    Speech.speak(text, { rate: 1.0, pitch: 1.0 });
  } catch {
    // TTS unavailable — ignore.
  }
}
