"use client";

const options = [
  { seconds: 15, label: "\u26A1 A moment" },
  { seconds: 30, label: "\uD83C\uDFB5 A vignette" },
  { seconds: 60, label: "\uD83C\uDFB6 A full piece" },
  { seconds: 120, label: "\uD83C\uDFBC A journey" },
];

interface DurationSelectorProps {
  selected: number;
  onSelect: (seconds: number) => void;
}

export default function DurationSelector({
  selected,
  onSelect,
}: DurationSelectorProps) {
  return (
    <div
      className="inline-flex rounded-full p-1 gap-1"
      style={{ backgroundColor: "rgba(26, 21, 51, 0.8)" }}
      role="radiogroup"
      aria-label="Composition duration"
    >
      {options.map((opt) => {
        const isSelected = selected === opt.seconds;

        return (
          <button
            key={opt.seconds}
            onClick={() => onSelect(opt.seconds)}
            role="radio"
            aria-checked={isSelected}
            className={`px-5 py-2.5 rounded-full text-sm tracking-wide transition-all duration-300 ease-out whitespace-nowrap ${
              isSelected
                ? "bg-[#F59E0B] text-white shadow-lg shadow-[#F59E0B]/25"
                : "text-[#8B7E6A] hover:text-[#D4C5A9] hover:bg-white/5"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
