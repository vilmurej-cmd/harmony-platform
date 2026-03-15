"use client";

import { useRef, useCallback } from "react";

const instruments = [
  {
    id: "piano",
    emoji: "\uD83C\uDFB9",
    name: "Piano Solo",
    description: "Intimate. Every note intentional.",
    previewNotes: [
      { pitch: "C4", delay: 0 },
      { pitch: "E4", delay: 0.2 },
      { pitch: "G4", delay: 0.4 },
      { pitch: "C5", delay: 0.6 },
    ],
  },
  {
    id: "strings",
    emoji: "\uD83C\uDFBB",
    name: "Strings Ensemble",
    description: "Sweeping emotion. Cinematic depth.",
    previewNotes: [
      { pitch: "A3", delay: 0 },
      { pitch: "E4", delay: 0 },
      { pitch: "A4", delay: 0.3 },
    ],
  },
  {
    id: "ambient",
    emoji: "\uD83C\uDF0A",
    name: "Ambient Pads",
    description: "Floating. Atmospheric. Boundless.",
    previewNotes: [
      { pitch: "C4", delay: 0 },
      { pitch: "G4", delay: 0 },
      { pitch: "E5", delay: 0 },
    ],
  },
  {
    id: "jazz",
    emoji: "\uD83C\uDFB7",
    name: "Jazz Trio",
    description: "Spontaneous. Soulful. Warm.",
    previewNotes: [
      { pitch: "Eb4", delay: 0 },
      { pitch: "G4", delay: 0.15 },
      { pitch: "Bb4", delay: 0.3 },
      { pitch: "D5", delay: 0.5 },
    ],
  },
  {
    id: "cinematic",
    emoji: "\uD83C\uDFAC",
    name: "Cinematic Orchestra",
    description: "Epic. Powerful. Transformative.",
    previewNotes: [
      { pitch: "C3", delay: 0 },
      { pitch: "G3", delay: 0 },
      { pitch: "C4", delay: 0 },
      { pitch: "E4", delay: 0.4 },
      { pitch: "G4", delay: 0.4 },
    ],
  },
];

interface InstrumentCardsProps {
  selected: string;
  onSelect: (instrument: string) => void;
}

export default function InstrumentCards({
  selected,
  onSelect,
}: InstrumentCardsProps) {
  const synthRef = useRef<any>(null);
  const effectsRef = useRef<any[]>([]);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playPreview = useCallback(async (instrumentId: string) => {
    // Debounce rapid hovers
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    hoverTimeoutRef.current = setTimeout(async () => {
      try {
        const { initAudio, instruments: audioInstruments } = await import(
          "@/lib/audio-engine"
        );
        const Tone = await initAudio();

        // Cleanup previous preview
        if (synthRef.current) {
          try {
            synthRef.current.dispose();
            effectsRef.current.forEach((fx: any) => fx?.dispose());
          } catch {}
        }

        const preset = audioInstruments[instrumentId] || audioInstruments.piano;
        const { synth, effects } = preset.create(Tone);
        synthRef.current = synth;
        effectsRef.current = effects;

        // Lower volume for previews
        Tone.Destination.volume.value = -8;

        const inst = instruments.find((i) => i.id === instrumentId);
        if (!inst) return;

        // Play the preview notes
        const now = Tone.now();
        for (const note of inst.previewNotes) {
          synth.triggerAttackRelease(note.pitch, "8n", now + note.delay, 0.4);
        }

        // Cleanup after preview
        setTimeout(() => {
          try {
            synth.dispose();
            effects.forEach((fx: any) => fx?.dispose());
          } catch {}
          if (synthRef.current === synth) {
            synthRef.current = null;
            effectsRef.current = [];
          }
        }, 2000);
      } catch {}
    }, 150);
  }, []);

  const cancelPreview = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible scrollbar-thin">
      {instruments.map((inst) => {
        const isSelected = selected === inst.id;

        return (
          <button
            key={inst.id}
            onClick={() => onSelect(inst.id)}
            onMouseEnter={() => playPreview(inst.id)}
            onMouseLeave={cancelPreview}
            className={`flex-shrink-0 w-40 md:w-auto rounded-2xl p-6 text-left transition-all duration-400 ease-out border ${
              isSelected
                ? "border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.25),0_0_40px_rgba(245,158,11,0.1)]"
                : "border-white/8 hover:border-white/20 hover:scale-[1.02]"
            }`}
            style={{ backgroundColor: "rgba(26, 21, 51, 0.8)" }}
            aria-pressed={isSelected}
          >
            <div className="text-4xl mb-4">{inst.emoji}</div>
            <h3
              className={`font-serif text-base mb-1 transition-colors duration-300 ${
                isSelected ? "text-[#F59E0B]" : "text-[#FFF7ED]"
              }`}
            >
              {inst.name}
            </h3>
            <p className="text-xs text-[#8B7E6A] leading-relaxed">
              {inst.description}
            </p>
            {/* Hover hint */}
            <p className="text-[9px] text-[#8B7E6A]/50 mt-3 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Hover to preview
            </p>
          </button>
        );
      })}
    </div>
  );
}
