"use client";

import { motion } from "framer-motion";
import { Play, Square } from "lucide-react";
import type { SavedComposition } from "@/lib/music-storage";
import { emotionColors, emotionEmojis } from "@/lib/emotion-colors";

interface TimelineViewProps {
  compositions: SavedComposition[];
  onPlay: (id: string) => void;
  playingId: string | null;
}

export default function TimelineView({
  compositions,
  onPlay,
  playingId,
}: TimelineViewProps) {
  if (compositions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-6 animate-float">🎵</div>
        <p className="font-serif text-xl text-[#D4C5A9] mb-2">
          Your life&apos;s soundtrack starts with one moment.
        </p>
        <p className="text-sm text-[#8B7E6A]">
          Compose your first piece to begin the timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-5 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#F59E0B]/40 via-[#F59E0B]/20 to-transparent md:-translate-x-px" />

      <div className="space-y-12">
        {compositions.map((comp, index) => {
          const isLeft = index % 2 === 0;
          const isPlaying = playingId === comp.id;
          const primaryColor =
            emotionColors[comp.emotions[0]] || "#F59E0B";
          const date = new Date(comp.createdAt);
          const dateStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className={`relative flex items-start gap-4 md:gap-0 ${
                isLeft ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Timeline dot */}
              <div
                className="absolute left-5 md:left-1/2 w-3 h-3 rounded-full -translate-x-1/2 mt-6 z-10 ring-4 ring-[#0F0B1E]"
                style={{
                  backgroundColor: primaryColor,
                  boxShadow: `0 0 12px ${primaryColor}66`,
                }}
              />

              {/* Spacer for mobile left offset */}
              <div className="w-10 flex-shrink-0 md:hidden" />

              {/* Card */}
              <div
                className={`flex-1 md:w-[calc(50%-2rem)] ${
                  isLeft ? "md:pr-10" : "md:pl-10"
                }`}
              >
                <div
                  className={`rounded-2xl border p-5 transition-all duration-500 ${
                    isPlaying
                      ? "border-[#F59E0B]/40 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
                      : "border-white/8 hover:border-white/15"
                  }`}
                  style={{ backgroundColor: "rgba(26, 21, 51, 0.8)" }}
                >
                  {/* Date */}
                  <p className="text-[10px] text-[#8B7E6A] uppercase tracking-widest mb-2">
                    {dateStr}
                  </p>

                  {/* Title */}
                  <h3 className="font-serif text-lg text-[#F59E0B] mb-2">
                    {comp.title}
                  </h3>

                  {/* Moment excerpt */}
                  <p className="text-sm text-[#8B7E6A] leading-relaxed line-clamp-2 mb-3">
                    {comp.moment}
                  </p>

                  {/* Emotion badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {comp.emotions.map((emotion) => (
                      <span
                        key={emotion}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] capitalize tracking-wide"
                        style={{
                          backgroundColor: `${
                            emotionColors[emotion] || "#F59E0B"
                          }22`,
                          color: emotionColors[emotion] || "#F59E0B",
                        }}
                      >
                        {emotionEmojis[emotion]} {emotion}
                      </span>
                    ))}
                  </div>

                  {/* Play button */}
                  <button
                    onClick={() => onPlay(comp.id)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isPlaying
                        ? "bg-[#F59E0B] shadow-md shadow-[#F59E0B]/25"
                        : "bg-white/10 hover:bg-[#F59E0B] hover:shadow-md hover:shadow-[#F59E0B]/25"
                    }`}
                    aria-label={isPlaying ? "Stop" : "Play"}
                  >
                    {isPlaying ? (
                      <Square
                        size={12}
                        fill="#0F0B1E"
                        className="text-[#0F0B1E]"
                      />
                    ) : (
                      <Play
                        size={14}
                        fill="#0F0B1E"
                        className="text-[#0F0B1E] ml-0.5"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Opposite spacer for desktop centering */}
              <div className="hidden md:block md:w-[calc(50%-2rem)]" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
