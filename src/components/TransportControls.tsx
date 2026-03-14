"use client";

import { useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface TransportControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  progress: number;
  currentTime: string;
  totalTime: string;
  volume: number;
  onVolumeChange: (v: number) => void;
}

export default function TransportControls({
  isPlaying,
  onPlayPause,
  onRestart,
  progress,
  currentTime,
  totalTime,
  volume,
  onVolumeChange,
}: TransportControlsProps) {
  // Keyboard shortcut: space = play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        e.preventDefault();
        onPlayPause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPlayPause]);

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div className="w-full">
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#F59E0B] transition-[width] duration-200 ease-linear"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-[#8B7E6A] tabular-nums">
            {currentTime}
          </span>
          <span className="text-[10px] text-[#8B7E6A] tabular-nums">
            {totalTime}
          </span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-center gap-6">
        {/* Restart */}
        <button
          onClick={onRestart}
          className="p-2 text-[#8B7E6A] hover:text-[#D4C5A9] transition-colors duration-300"
          aria-label="Restart"
        >
          <RotateCcw size={20} />
        </button>

        {/* Play / Pause */}
        <button
          onClick={onPlayPause}
          className="w-14 h-14 rounded-full bg-[#F59E0B] hover:bg-[#FBBF24] flex items-center justify-center transition-all duration-300 shadow-lg shadow-[#F59E0B]/25 hover:shadow-[#F59E0B]/40 hover:scale-105 active:scale-95"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause size={22} fill="#0F0B1E" className="text-[#0F0B1E]" />
          ) : (
            <Play
              size={22}
              fill="#0F0B1E"
              className="text-[#0F0B1E] ml-0.5"
            />
          )}
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-[#8B7E6A]" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-1 appearance-none bg-white/10 rounded-full cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[#F59E0B]
              [&::-webkit-slider-thumb]:shadow-sm
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-[#F59E0B]
              [&::-moz-range-thumb]:border-0"
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
