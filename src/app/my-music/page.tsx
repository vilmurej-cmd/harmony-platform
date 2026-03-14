"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, AlignJustify, ArrowUpDown, Music } from "lucide-react";
import CompositionCard from "@/components/CompositionCard";
import TimelineView from "@/components/TimelineView";
import { getCompositions, deleteComposition } from "@/lib/music-storage";
import type { SavedComposition } from "@/lib/music-storage";
import type { Composition, Note } from "@/lib/audio-engine";

type ViewMode = "grid" | "timeline";
type SortOrder = "newest" | "oldest";

export default function MyMusicPage() {
  const [compositions, setCompositions] = useState<SavedComposition[]>([]);
  const [view, setView] = useState<ViewMode>("grid");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Audio refs
  const toneRef = useRef<any>(null);
  const synthRef = useRef<any>(null);
  const effectsRef = useRef<any[]>([]);

  // Load compositions
  useEffect(() => {
    setCompositions(getCompositions());
  }, []);

  // Sort
  const sorted = [...compositions].sort((a, b) => {
    const aDate = new Date(a.createdAt).getTime();
    const bDate = new Date(b.createdAt).getTime();
    return sort === "newest" ? bDate - aDate : aDate - bDate;
  });

  // ---------- Cleanup audio ----------
  const stopAudio = useCallback(() => {
    if (toneRef.current) {
      try {
        toneRef.current.Transport.stop();
        toneRef.current.Transport.cancel();
      } catch {}
    }
    if (synthRef.current) {
      try {
        synthRef.current.dispose();
        effectsRef.current.forEach((fx: any) => fx?.dispose());
      } catch {}
    }
    synthRef.current = null;
    effectsRef.current = [];
    setPlayingId(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  // ---------- Play composition ----------
  const handlePlay = useCallback(
    async (id: string) => {
      // If already playing this one, stop
      if (playingId === id) {
        stopAudio();
        return;
      }

      // Stop any current playback
      stopAudio();

      const comp = compositions.find((c) => c.id === id);
      if (!comp) return;

      const { initAudio, instruments, scheduleComposition, getTotalDuration } =
        await import("@/lib/audio-engine");

      const Tone = await initAudio();
      toneRef.current = Tone;

      const preset = instruments[comp.instrument] || instruments.piano;
      const { synth, effects } = preset.create(Tone);
      synthRef.current = synth;
      effectsRef.current = effects;

      const composition = comp.composition as Composition;
      const dur = getTotalDuration(composition);

      scheduleComposition(Tone, synth, composition);

      // Stop at end
      Tone.Transport.schedule(() => {
        stopAudio();
      }, `+${dur}`);

      await Tone.start();
      Tone.Transport.start();
      setPlayingId(id);
    },
    [compositions, playingId, stopAudio],
  );

  // ---------- Delete ----------
  const handleDelete = useCallback(
    (id: string) => {
      if (confirmDeleteId === id) {
        // If playing, stop
        if (playingId === id) stopAudio();
        deleteComposition(id);
        setCompositions(getCompositions());
        setConfirmDeleteId(null);
      } else {
        setConfirmDeleteId(id);
        // Auto-clear confirm after 3s
        setTimeout(() => setConfirmDeleteId(null), 3000);
      }
    },
    [confirmDeleteId, playingId, stopAudio],
  );

  // ---------- Render ----------
  return (
    <div className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl sm:text-5xl mb-3"
          style={{
            background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          My Music
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[#8B7E6A]"
        >
          Your life&apos;s soundtrack
        </motion.p>
      </div>

      {compositions.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="text-6xl mb-8 animate-float">
            <Music size={64} className="text-[#F59E0B]/30" />
          </div>
          <p className="font-serif text-xl text-[#D4C5A9] mb-3 max-w-md">
            Your life&apos;s soundtrack starts with one moment.
          </p>
          <p className="text-sm text-[#8B7E6A] mb-8">
            Compose your first piece and it will appear here.
          </p>
          <Link
            href="/compose"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#F59E0B] text-[#0F0B1E] rounded-full font-semibold tracking-wide transition-all duration-300 hover:bg-[#FBBF24] hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]"
          >
            Compose Your First Piece
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mb-8"
          >
            {/* View toggle */}
            <div
              className="inline-flex rounded-full p-1 gap-1"
              style={{ backgroundColor: "rgba(26, 21, 51, 0.8)" }}
            >
              <button
                onClick={() => setView("grid")}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  view === "grid"
                    ? "bg-[#F59E0B] text-[#0F0B1E]"
                    : "text-[#8B7E6A] hover:text-[#D4C5A9]"
                }`}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setView("timeline")}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  view === "timeline"
                    ? "bg-[#F59E0B] text-[#0F0B1E]"
                    : "text-[#8B7E6A] hover:text-[#D4C5A9]"
                }`}
                aria-label="Timeline view"
              >
                <AlignJustify size={16} />
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-[#8B7E6A]" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOrder)}
                className="bg-transparent text-sm text-[#8B7E6A] border-none cursor-pointer focus:outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {view === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {sorted.map((comp, i) => (
                  <motion.div
                    key={comp.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <CompositionCard
                      composition={comp}
                      onPlay={() => handlePlay(comp.id)}
                      onDelete={() => handleDelete(comp.id)}
                      isPlaying={playingId === comp.id}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TimelineView
                  compositions={sorted}
                  onPlay={(id) => handlePlay(id)}
                  playingId={playingId}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
