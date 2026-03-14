import type { Composition } from "./audio-engine";

/**
 * "First Light" — A 16-bar piano composition in C major.
 *
 * Structured as a miniature journey:
 *   Bars  1–4:  Gentle intro, pp → mp, ascending C-major arpeggios
 *   Bars  5–8:  Development, mp → mf, Am / F / G harmonic colour
 *   Bars  9–12: Climax, mf → f, fuller voicings, higher register
 *   Bars 13–16: Resolution, f → pp, descending home to C, gentle close
 */

export const demoComposition: Composition = {
  title: "First Light",
  key: "C major",
  tempo: 72,
  timeSignature: [4, 4],
  detectedEmotion: "serenity",
  dynamicArc: ["pp", "pp", "mp", "mp", "mp", "mf", "mf", "mf", "mf", "f", "f", "mf", "mf", "mp", "p", "pp"],
  measures: [
    // ── BAR 1  (pp) — single ascending notes, barely there ──
    {
      bar: 1,
      dynamic: "pp",
      melody: [
        { pitch: "C4", time: "0:0:0", duration: "4n", velocity: 0.2 },
        { pitch: "E4", time: "0:1:0", duration: "4n", velocity: 0.22 },
        { pitch: "G4", time: "0:2:0", duration: "4n", velocity: 0.24 },
        { pitch: "C5", time: "0:3:0", duration: "4n", velocity: 0.26 },
      ],
      harmony: [],
      bass: [
        { pitch: "C3", time: "0:0:0", duration: "1m", velocity: 0.18 },
      ],
    },
    // ── BAR 2  (pp) — repeat with slight variation ──
    {
      bar: 2,
      dynamic: "pp",
      melody: [
        { pitch: "D4", time: "1:0:0", duration: "4n", velocity: 0.22 },
        { pitch: "F4", time: "1:1:0", duration: "4n", velocity: 0.24 },
        { pitch: "A4", time: "1:2:0", duration: "4n", velocity: 0.26 },
        { pitch: "D5", time: "1:3:0", duration: "4n", velocity: 0.28 },
      ],
      harmony: [],
      bass: [
        { pitch: "D3", time: "1:0:0", duration: "1m", velocity: 0.18 },
      ],
    },
    // ── BAR 3  (mp) — melody lingers, first harmony ──
    {
      bar: 3,
      dynamic: "mp",
      melody: [
        { pitch: "E4", time: "2:0:0", duration: "2n", velocity: 0.35 },
        { pitch: "G4", time: "2:2:0", duration: "4n", velocity: 0.38 },
        { pitch: "A4", time: "2:3:0", duration: "4n", velocity: 0.4 },
      ],
      harmony: [
        { pitch: "C4", time: "2:0:0", duration: "2n", velocity: 0.25 },
        { pitch: "E4", time: "2:2:0", duration: "2n", velocity: 0.25 },
      ],
      bass: [
        { pitch: "A2", time: "2:0:0", duration: "2n", velocity: 0.3 },
        { pitch: "E3", time: "2:2:0", duration: "2n", velocity: 0.3 },
      ],
    },
    // ── BAR 4  (mp) — settling, preparing for development ──
    {
      bar: 4,
      dynamic: "mp",
      melody: [
        { pitch: "G4", time: "3:0:0", duration: "4n.", velocity: 0.4 },
        { pitch: "F4", time: "3:1:2", duration: "8n", velocity: 0.35 },
        { pitch: "E4", time: "3:2:0", duration: "2n", velocity: 0.38 },
      ],
      harmony: [
        { pitch: "C4", time: "3:0:0", duration: "1m", velocity: 0.25 },
      ],
      bass: [
        { pitch: "C3", time: "3:0:0", duration: "2n", velocity: 0.3 },
        { pitch: "G2", time: "3:2:0", duration: "2n", velocity: 0.3 },
      ],
    },
    // ── BAR 5  (mp) — Am colour, rising energy ──
    {
      bar: 5,
      dynamic: "mp",
      melody: [
        { pitch: "A4", time: "4:0:0", duration: "4n", velocity: 0.45 },
        { pitch: "C5", time: "4:1:0", duration: "4n", velocity: 0.48 },
        { pitch: "B4", time: "4:2:0", duration: "4n", velocity: 0.45 },
        { pitch: "A4", time: "4:3:0", duration: "4n", velocity: 0.42 },
      ],
      harmony: [
        { pitch: "E4", time: "4:0:0", duration: "2n", velocity: 0.3 },
        { pitch: "A3", time: "4:2:0", duration: "2n", velocity: 0.3 },
      ],
      bass: [
        { pitch: "A2", time: "4:0:0", duration: "1m", velocity: 0.35 },
      ],
    },
    // ── BAR 6  (mf) — F major warmth ──
    {
      bar: 6,
      dynamic: "mf",
      melody: [
        { pitch: "F4", time: "5:0:0", duration: "4n", velocity: 0.5 },
        { pitch: "A4", time: "5:1:0", duration: "4n", velocity: 0.52 },
        { pitch: "C5", time: "5:2:0", duration: "4n.", velocity: 0.55 },
        { pitch: "B4", time: "5:3:2", duration: "8n", velocity: 0.48 },
      ],
      harmony: [
        { pitch: "F3", time: "5:0:0", duration: "2n", velocity: 0.35 },
        { pitch: "A3", time: "5:0:0", duration: "2n", velocity: 0.35 },
        { pitch: "C4", time: "5:2:0", duration: "2n", velocity: 0.35 },
      ],
      bass: [
        { pitch: "F2", time: "5:0:0", duration: "2n", velocity: 0.38 },
        { pitch: "C3", time: "5:2:0", duration: "2n", velocity: 0.38 },
      ],
    },
    // ── BAR 7  (mf) — G dominant, tension builds ──
    {
      bar: 7,
      dynamic: "mf",
      melody: [
        { pitch: "G4", time: "6:0:0", duration: "4n", velocity: 0.52 },
        { pitch: "B4", time: "6:1:0", duration: "4n", velocity: 0.55 },
        { pitch: "D5", time: "6:2:0", duration: "4n", velocity: 0.58 },
        { pitch: "E5", time: "6:3:0", duration: "4n", velocity: 0.6 },
      ],
      harmony: [
        { pitch: "G3", time: "6:0:0", duration: "2n", velocity: 0.35 },
        { pitch: "B3", time: "6:0:0", duration: "2n", velocity: 0.35 },
        { pitch: "D4", time: "6:2:0", duration: "2n", velocity: 0.38 },
      ],
      bass: [
        { pitch: "G2", time: "6:0:0", duration: "1m", velocity: 0.4 },
      ],
    },
    // ── BAR 8  (mf) — momentum, leading into climax ──
    {
      bar: 8,
      dynamic: "mf",
      melody: [
        { pitch: "E5", time: "7:0:0", duration: "4n", velocity: 0.58 },
        { pitch: "D5", time: "7:1:0", duration: "4n", velocity: 0.55 },
        { pitch: "C5", time: "7:2:0", duration: "4n", velocity: 0.58 },
        { pitch: "D5", time: "7:3:0", duration: "4n", velocity: 0.6 },
      ],
      harmony: [
        { pitch: "C4", time: "7:0:0", duration: "2n", velocity: 0.38 },
        { pitch: "E4", time: "7:0:0", duration: "2n", velocity: 0.38 },
        { pitch: "G3", time: "7:2:0", duration: "2n", velocity: 0.38 },
        { pitch: "B3", time: "7:2:0", duration: "2n", velocity: 0.38 },
      ],
      bass: [
        { pitch: "C3", time: "7:0:0", duration: "2n", velocity: 0.4 },
        { pitch: "G2", time: "7:2:0", duration: "2n", velocity: 0.42 },
      ],
    },
    // ── BAR 9  (mf) — climax begins, fuller chords ──
    {
      bar: 9,
      dynamic: "mf",
      melody: [
        { pitch: "E5", time: "8:0:0", duration: "2n", velocity: 0.65 },
        { pitch: "G5", time: "8:2:0", duration: "4n", velocity: 0.7 },
        { pitch: "F5", time: "8:3:0", duration: "4n", velocity: 0.65 },
      ],
      harmony: [
        { pitch: "C4", time: "8:0:0", duration: "2n", velocity: 0.45 },
        { pitch: "E4", time: "8:0:0", duration: "2n", velocity: 0.45 },
        { pitch: "G4", time: "8:0:0", duration: "2n", velocity: 0.45 },
        { pitch: "F4", time: "8:2:0", duration: "2n", velocity: 0.42 },
        { pitch: "A4", time: "8:2:0", duration: "2n", velocity: 0.42 },
      ],
      bass: [
        { pitch: "C3", time: "8:0:0", duration: "2n", velocity: 0.48 },
        { pitch: "F2", time: "8:2:0", duration: "2n", velocity: 0.48 },
      ],
    },
    // ── BAR 10  (f) — peak intensity ──
    {
      bar: 10,
      dynamic: "f",
      melody: [
        { pitch: "G5", time: "9:0:0", duration: "4n", velocity: 0.78 },
        { pitch: "A5", time: "9:1:0", duration: "4n", velocity: 0.8 },
        { pitch: "G5", time: "9:2:0", duration: "4n", velocity: 0.78 },
        { pitch: "E5", time: "9:3:0", duration: "4n", velocity: 0.72 },
      ],
      harmony: [
        { pitch: "C4", time: "9:0:0", duration: "1m", velocity: 0.5 },
        { pitch: "E4", time: "9:0:0", duration: "1m", velocity: 0.5 },
        { pitch: "G4", time: "9:0:0", duration: "1m", velocity: 0.5 },
      ],
      bass: [
        { pitch: "C3", time: "9:0:0", duration: "2n", velocity: 0.52 },
        { pitch: "G2", time: "9:2:0", duration: "2n", velocity: 0.52 },
      ],
    },
    // ── BAR 11  (f) — sustained peak, Am-G motion ──
    {
      bar: 11,
      dynamic: "f",
      melody: [
        { pitch: "A5", time: "10:0:0", duration: "2n", velocity: 0.8 },
        { pitch: "G5", time: "10:2:0", duration: "2n", velocity: 0.75 },
      ],
      harmony: [
        { pitch: "A3", time: "10:0:0", duration: "2n", velocity: 0.48 },
        { pitch: "C4", time: "10:0:0", duration: "2n", velocity: 0.48 },
        { pitch: "E4", time: "10:0:0", duration: "2n", velocity: 0.48 },
        { pitch: "G3", time: "10:2:0", duration: "2n", velocity: 0.48 },
        { pitch: "B3", time: "10:2:0", duration: "2n", velocity: 0.48 },
        { pitch: "D4", time: "10:2:0", duration: "2n", velocity: 0.48 },
      ],
      bass: [
        { pitch: "A2", time: "10:0:0", duration: "2n", velocity: 0.52 },
        { pitch: "G2", time: "10:2:0", duration: "2n", velocity: 0.5 },
      ],
    },
    // ── BAR 12  (mf) — beginning descent ──
    {
      bar: 12,
      dynamic: "mf",
      melody: [
        { pitch: "F5", time: "11:0:0", duration: "4n", velocity: 0.65 },
        { pitch: "E5", time: "11:1:0", duration: "4n", velocity: 0.62 },
        { pitch: "D5", time: "11:2:0", duration: "4n", velocity: 0.58 },
        { pitch: "C5", time: "11:3:0", duration: "4n", velocity: 0.55 },
      ],
      harmony: [
        { pitch: "F3", time: "11:0:0", duration: "2n", velocity: 0.4 },
        { pitch: "A3", time: "11:0:0", duration: "2n", velocity: 0.4 },
        { pitch: "G3", time: "11:2:0", duration: "2n", velocity: 0.38 },
        { pitch: "B3", time: "11:2:0", duration: "2n", velocity: 0.38 },
      ],
      bass: [
        { pitch: "F2", time: "11:0:0", duration: "2n", velocity: 0.45 },
        { pitch: "G2", time: "11:2:0", duration: "2n", velocity: 0.42 },
      ],
    },
    // ── BAR 13  (mf) — gentle return, descending melody ──
    {
      bar: 13,
      dynamic: "mf",
      melody: [
        { pitch: "C5", time: "12:0:0", duration: "4n.", velocity: 0.52 },
        { pitch: "B4", time: "12:1:2", duration: "8n", velocity: 0.48 },
        { pitch: "A4", time: "12:2:0", duration: "4n", velocity: 0.45 },
        { pitch: "G4", time: "12:3:0", duration: "4n", velocity: 0.42 },
      ],
      harmony: [
        { pitch: "C4", time: "12:0:0", duration: "1m", velocity: 0.32 },
        { pitch: "E4", time: "12:0:0", duration: "1m", velocity: 0.32 },
      ],
      bass: [
        { pitch: "C3", time: "12:0:0", duration: "1m", velocity: 0.38 },
      ],
    },
    // ── BAR 14  (mp) — winding down ──
    {
      bar: 14,
      dynamic: "mp",
      melody: [
        { pitch: "F4", time: "13:0:0", duration: "2n", velocity: 0.4 },
        { pitch: "E4", time: "13:2:0", duration: "2n", velocity: 0.38 },
      ],
      harmony: [
        { pitch: "F3", time: "13:0:0", duration: "2n", velocity: 0.28 },
        { pitch: "A3", time: "13:0:0", duration: "2n", velocity: 0.28 },
        { pitch: "C4", time: "13:2:0", duration: "2n", velocity: 0.28 },
      ],
      bass: [
        { pitch: "F2", time: "13:0:0", duration: "2n", velocity: 0.32 },
        { pitch: "C3", time: "13:2:0", duration: "2n", velocity: 0.3 },
      ],
    },
    // ── BAR 15  (p) — almost silent, G → C resolution ──
    {
      bar: 15,
      dynamic: "p",
      melody: [
        { pitch: "D4", time: "14:0:0", duration: "4n", velocity: 0.3 },
        { pitch: "E4", time: "14:1:0", duration: "4n", velocity: 0.28 },
        { pitch: "C4", time: "14:2:0", duration: "2n", velocity: 0.32 },
      ],
      harmony: [
        { pitch: "G3", time: "14:0:0", duration: "2n", velocity: 0.22 },
        { pitch: "B3", time: "14:0:0", duration: "2n", velocity: 0.22 },
      ],
      bass: [
        { pitch: "G2", time: "14:0:0", duration: "2n", velocity: 0.25 },
        { pitch: "C3", time: "14:2:0", duration: "2n", velocity: 0.25 },
      ],
    },
    // ── BAR 16  (pp) — final breath, single C chord fading ──
    {
      bar: 16,
      dynamic: "pp",
      melody: [
        { pitch: "C4", time: "15:0:0", duration: "1m", velocity: 0.2 },
      ],
      harmony: [
        { pitch: "E4", time: "15:0:0", duration: "1m", velocity: 0.15 },
        { pitch: "G4", time: "15:0:0", duration: "1m", velocity: 0.15 },
      ],
      bass: [
        { pitch: "C3", time: "15:0:0", duration: "1m", velocity: 0.18 },
      ],
    },
  ],
};
