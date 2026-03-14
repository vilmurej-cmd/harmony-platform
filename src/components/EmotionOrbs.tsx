"use client";

import { emotionColors, emotionEmojis, emotions } from "@/lib/emotion-colors";

interface EmotionOrbsProps {
  selected: string[];
  onToggle: (emotion: string) => void;
  size?: "sm" | "md" | "lg";
}

export default function EmotionOrbs({
  selected,
  onToggle,
  size = "md",
}: EmotionOrbsProps) {
  const orbSize = size === "sm" ? "w-16 h-16" : size === "lg" ? "w-24 h-24" : "w-20 h-20";
  const emojiSize = size === "sm" ? "text-xl" : size === "lg" ? "text-3xl" : "text-2xl";
  const labelSize = size === "sm" ? "text-[10px]" : "text-xs";
  const gridCols =
    size === "sm"
      ? "grid-cols-3"
      : "grid-cols-4 md:grid-cols-6";

  return (
    <div className={`grid ${gridCols} gap-4 justify-items-center`}>
      {emotions.map((emotion) => {
        const isSelected = selected.includes(emotion);
        const color = emotionColors[emotion];
        const emoji = emotionEmojis[emotion];

        return (
          <button
            key={emotion}
            onClick={() => onToggle(emotion)}
            className="flex flex-col items-center gap-2 group transition-all duration-300 ease-out"
            aria-label={`${isSelected ? "Deselect" : "Select"} ${emotion}`}
            aria-pressed={isSelected}
          >
            {/* Orb */}
            <div
              className={`${orbSize} rounded-full flex items-center justify-center transition-all duration-500 ease-out border-2 ${
                isSelected
                  ? "border-[#F59E0B] scale-110 opacity-100"
                  : "border-transparent opacity-60 group-hover:opacity-80 group-hover:scale-105"
              }`}
              style={{
                background: `radial-gradient(circle at 35% 35%, ${color}, ${color}88, ${color}33)`,
                boxShadow: isSelected
                  ? `0 0 20px ${color}66, 0 0 40px ${color}33, 0 0 4px ${color}`
                  : "none",
              }}
            >
              {/* Pulse ring on selected */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-full animate-gentle-pulse"
                  style={{
                    boxShadow: `0 0 24px ${color}55`,
                  }}
                />
              )}
              <span className={`${emojiSize} relative z-10`}>{emoji}</span>
            </div>

            {/* Label */}
            <span
              className={`${labelSize} capitalize tracking-wide transition-colors duration-300 ${
                isSelected ? "text-[#FFF7ED]" : "text-[#8B7E6A] group-hover:text-[#D4C5A9]"
              }`}
            >
              {emotion}
            </span>
          </button>
        );
      })}
    </div>
  );
}
