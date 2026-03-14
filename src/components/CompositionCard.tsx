import { Play, Square, Trash2 } from "lucide-react";
import type { SavedComposition } from "@/lib/music-storage";
import { emotionColors, emotionEmojis } from "@/lib/emotion-colors";

const instrumentEmojis: Record<string, string> = {
  piano: "\uD83C\uDFB9",
  strings: "\uD83C\uDFBB",
  ambient: "\uD83C\uDF0A",
  jazz: "\uD83C\uDFB7",
  cinematic: "\uD83C\uDFAC",
};

interface CompositionCardProps {
  composition: SavedComposition;
  onPlay: () => void;
  onDelete: () => void;
  isPlaying: boolean;
}

export default function CompositionCard({
  composition,
  onPlay,
  onDelete,
  isPlaying,
}: CompositionCardProps) {
  const date = new Date(composition.createdAt);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`relative rounded-2xl border p-5 transition-all duration-500 ease-out group ${
        isPlaying
          ? "border-[#F59E0B]/40 shadow-[0_0_24px_rgba(245,158,11,0.15)]"
          : "border-white/8 hover:border-white/15"
      }`}
      style={{ backgroundColor: "rgba(26, 21, 51, 0.8)" }}
    >
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute top-4 right-4 p-1.5 text-[#8B7E6A] opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all duration-300"
        aria-label={`Delete ${composition.title}`}
      >
        <Trash2 size={14} />
      </button>

      {/* Title */}
      <h3 className="font-serif text-lg text-[#F59E0B] mb-2 pr-8">
        {composition.title}
      </h3>

      {/* Moment text */}
      <p className="text-sm text-[#8B7E6A] leading-relaxed line-clamp-2 mb-4">
        {composition.moment}
      </p>

      {/* Emotion badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {composition.emotions.map((emotion) => (
          <span
            key={emotion}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] capitalize tracking-wide"
            style={{
              backgroundColor: `${emotionColors[emotion] || "#F59E0B"}22`,
              color: emotionColors[emotion] || "#F59E0B",
            }}
          >
            {emotionEmojis[emotion]} {emotion}
          </span>
        ))}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-[#8B7E6A]">
          <span>{instrumentEmojis[composition.instrument] || ""}</span>
          <span>{dateStr}</span>
        </div>

        {/* Play button */}
        <button
          onClick={onPlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
            isPlaying
              ? "bg-[#F59E0B] shadow-md shadow-[#F59E0B]/25"
              : "bg-white/10 hover:bg-[#F59E0B] hover:shadow-md hover:shadow-[#F59E0B]/25"
          }`}
          aria-label={isPlaying ? "Stop" : "Play"}
        >
          {isPlaying ? (
            <Square size={12} fill="#0F0B1E" className="text-[#0F0B1E]" />
          ) : (
            <Play size={14} fill="#0F0B1E" className="text-[#0F0B1E] ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
