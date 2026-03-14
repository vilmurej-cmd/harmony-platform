/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * HARMONY Audio Engine
 *
 * Wraps Tone.js with dynamic import (SSR-safe) and provides instrument
 * presets, composition scheduling, and lifecycle helpers.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Note {
  pitch: string;        // e.g. "C4", "Eb5"
  time: string;         // Tone.js transport time, e.g. "0:0:0"
  duration: string;     // e.g. "4n", "2n", "1m"
  velocity?: number;    // 0–1
}

export interface Measure {
  bar: number;
  melody: Note[];
  harmony: Note[];
  bass: Note[];
  dynamic?: string;     // pp, p, mp, mf, f, ff
}

export interface Composition {
  title: string;
  key: string;
  tempo: number;
  timeSignature: [number, number];
  detectedEmotion: string;
  dynamicArc: string[];
  measures: Measure[];
}

export interface InstrumentBundle {
  synth: any;
  effects: any[];
}

// ---------------------------------------------------------------------------
// Dynamic Tone.js import (keeps Next.js SSR happy)
// ---------------------------------------------------------------------------

let ToneModule: any = null;

export async function initAudio(): Promise<any> {
  if (ToneModule) {
    if (ToneModule.context.state !== "running") {
      await ToneModule.start();
    }
    return ToneModule;
  }
  ToneModule = await import("tone");
  await ToneModule.start();
  return ToneModule;
}

// ---------------------------------------------------------------------------
// Dynamic-to-velocity mapping
// ---------------------------------------------------------------------------

const dynamicVelocity: Record<string, number> = {
  pp: 0.2,
  p: 0.35,
  mp: 0.5,
  mf: 0.65,
  f: 0.8,
  ff: 0.95,
};

function resolveVelocity(note: Note, measure: Measure): number {
  if (note.velocity !== undefined) return note.velocity;
  return dynamicVelocity[measure.dynamic ?? "mf"] ?? 0.65;
}

// ---------------------------------------------------------------------------
// Instrument Presets
// ---------------------------------------------------------------------------

export const instruments: Record<
  string,
  { label: string; create: (Tone: any) => InstrumentBundle }
> = {
  piano: {
    label: "Piano",
    create(Tone) {
      const reverb = new Tone.Reverb({ decay: 3, wet: 0.35 }).toDestination();
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle8" },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 },
      }).connect(reverb);
      return { synth, effects: [reverb] };
    },
  },

  strings: {
    label: "Strings",
    create(Tone) {
      const chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.5 }).start();
      const reverb = new Tone.Reverb({ decay: 5, wet: 0.5 }).toDestination();
      chorus.connect(reverb);
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "fatsawtooth", count: 3, spread: 20 },
        envelope: { attack: 0.3, decay: 0.4, sustain: 0.7, release: 2 },
      }).connect(chorus);
      return { synth, effects: [chorus, reverb] };
    },
  },

  ambient: {
    label: "Ambient",
    create(Tone) {
      const delay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.4, wet: 0.3 });
      const reverb = new Tone.Reverb({ decay: 8, wet: 0.6 }).toDestination();
      delay.connect(reverb);
      const synth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3,
        modulationIndex: 10,
        envelope: { attack: 0.5, decay: 0.5, sustain: 0.6, release: 3 },
      }).connect(delay);
      return { synth, effects: [delay, reverb] };
    },
  },

  jazz: {
    label: "Jazz Piano",
    create(Tone) {
      const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.25 }).toDestination();
      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.8 },
      }).connect(reverb);
      return { synth, effects: [reverb] };
    },
  },

  cinematic: {
    label: "Cinematic",
    create(Tone) {
      const chorus = new Tone.Chorus({ frequency: 0.8, delayTime: 5, depth: 0.9, wet: 0.4 }).start();
      const reverb = new Tone.Reverb({ decay: 6, wet: 0.55 }).toDestination();
      chorus.connect(reverb);
      const synth = new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 2,
        envelope: { attack: 0.2, decay: 0.5, sustain: 0.6, release: 2.5 },
      }).connect(chorus);
      return { synth, effects: [chorus, reverb] };
    },
  },
};

// ---------------------------------------------------------------------------
// Scheduling
// ---------------------------------------------------------------------------

export function scheduleComposition(
  Tone: any,
  synth: any,
  composition: Composition,
  onNote?: (note: Note, type: "melody" | "harmony" | "bass") => void,
): void {
  Tone.Transport.cancel();
  Tone.Transport.bpm.value = composition.tempo;
  Tone.Transport.timeSignature = composition.timeSignature;

  for (const measure of composition.measures) {
    const schedule = (notes: Note[], type: "melody" | "harmony" | "bass") => {
      for (const note of notes) {
        const velocity = resolveVelocity(note, measure);
        Tone.Transport.schedule((time: number) => {
          synth.triggerAttackRelease(note.pitch, note.duration, time, velocity);
          onNote?.(note, type);
        }, note.time);
      }
    };

    schedule(measure.melody, "melody");
    schedule(measure.harmony, "harmony");
    schedule(measure.bass, "bass");
  }
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

export function cleanup(synth: any, effects: any[]): void {
  try {
    ToneModule?.Transport.stop();
    ToneModule?.Transport.cancel();
    synth?.dispose();
    for (const fx of effects) {
      fx?.dispose();
    }
  } catch {
    // Tone disposal can throw if already disposed — safe to ignore.
  }
}

// ---------------------------------------------------------------------------
// Duration helpers
// ---------------------------------------------------------------------------

export function getTotalDuration(composition: Composition): number {
  const beatsPerMeasure = composition.timeSignature[0];
  const totalBars = composition.measures.length;
  const totalBeats = totalBars * beatsPerMeasure;
  const secondsPerBeat = 60 / composition.tempo;
  return totalBeats * secondsPerBeat;
}
