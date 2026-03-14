"use client";

const instruments = [
  {
    id: "piano",
    emoji: "\uD83C\uDFB9",
    name: "Piano Solo",
    description: "Intimate. Every note intentional.",
  },
  {
    id: "strings",
    emoji: "\uD83C\uDFBB",
    name: "Strings Ensemble",
    description: "Sweeping emotion. Cinematic depth.",
  },
  {
    id: "ambient",
    emoji: "\uD83C\uDF0A",
    name: "Ambient Pads",
    description: "Floating. Atmospheric. Boundless.",
  },
  {
    id: "jazz",
    emoji: "\uD83C\uDFB7",
    name: "Jazz Trio",
    description: "Spontaneous. Soulful. Warm.",
  },
  {
    id: "cinematic",
    emoji: "\uD83C\uDFAC",
    name: "Cinematic Orchestra",
    description: "Epic. Powerful. Transformative.",
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
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible scrollbar-thin">
      {instruments.map((inst) => {
        const isSelected = selected === inst.id;

        return (
          <button
            key={inst.id}
            onClick={() => onSelect(inst.id)}
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
          </button>
        );
      })}
    </div>
  );
}
