"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { emotionColors } from "@/lib/emotion-colors";

const defaultMessages = [
  "Feeling your moment...",
  "Finding the key...",
  "Shaping the melody...",
  "Building the harmony...",
  "Adding soul...",
  "Almost there...",
];

interface ComposingLoaderProps {
  emotions: string[];
  messages?: string[];
}

export default function ComposingLoader({
  emotions,
  messages = defaultMessages,
}: ComposingLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [colorIndex, setColorIndex] = useState(0);

  const colors = useMemo(
    () =>
      emotions.length > 0
        ? emotions.map((e) => emotionColors[e] || "#F59E0B")
        : ["#F59E0B"],
    [emotions]
  );

  const currentColor = colors[colorIndex % colors.length];

  // Cycle messages every 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages.length]);

  // Cycle colors every 3s (if multiple)
  useEffect(() => {
    if (colors.length <= 1) return;
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [colors.length]);

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-16">
      {/* Glowing Orb */}
      <div className="relative w-[120px] h-[120px]">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full animate-breathe"
          style={{
            backgroundColor: `${currentColor}1A`,
            animationDelay: "0.8s",
            transition: "background-color 1.5s ease",
          }}
        />
        {/* Middle ring */}
        <div
          className="absolute inset-4 rounded-full animate-breathe"
          style={{
            backgroundColor: `${currentColor}4D`,
            animationDelay: "0.4s",
            transition: "background-color 1.5s ease",
          }}
        />
        {/* Inner core */}
        <div
          className="absolute inset-8 rounded-full animate-breathe"
          style={{
            backgroundColor: currentColor,
            boxShadow: `0 0 40px ${currentColor}88, 0 0 80px ${currentColor}44`,
            transition: "background-color 1.5s ease, box-shadow 1.5s ease",
          }}
        />
      </div>

      {/* Message cycling */}
      <div className="h-8 relative flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-[#D4C5A9] text-base tracking-wide absolute"
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Timing hint */}
      <p className="text-[#8B7E6A] text-xs">
        This usually takes about 10 seconds
      </p>
    </div>
  );
}
