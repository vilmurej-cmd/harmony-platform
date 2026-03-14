"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Music } from "lucide-react";
import PianoVisualization from "@/components/PianoVisualization";
import ParticleCanvas from "@/components/ParticleCanvas";
import TransportControls from "@/components/TransportControls";
import { decodeComposition } from "@/lib/share";
import type { SharePayload } from "@/lib/share";
import { emotionColors } from "@/lib/emotion-colors";
import type { Composition, Note } from "@/lib/audio-engine";

function PlayInner() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("c");

  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [invalid, setInvalid] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [audioReady, setAudioReady] = useState(false);

  // Refs
  const toneRef = useRef<any>(null);
  const synthRef = useRef<any>(null);
  const effectsRef = useRef<any[]>([]);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const noteSpawnRef = useRef<(() => void) | null>(null);
  const noteTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Decode on mount
  useEffect(() => {
    if (!encoded) {
      setInvalid(true);
      return;
    }
    const decoded = decodeComposition(encoded);
    if (!decoded || !decoded.composition) {
      setInvalid(true);
      return;
    }
    setPayload(decoded);
  }, [encoded]);

  const composition = payload?.composition as Composition | undefined;
  const primaryColor =
    payload?.emotions?.[0]
      ? emotionColors[payload.emotions[0]] || "#F59E0B"
      : "#F59E0B";

  // ---------- Format time ----------
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ---------- Initialize audio ----------
  const initializeAudio = useCallback(async () => {
    if (!composition) return;

    const { initAudio, instruments, scheduleComposition, getTotalDuration } =
      await import("@/lib/audio-engine");

    const Tone = await initAudio();
    toneRef.current = Tone;

    // Cleanup previous
    if (synthRef.current) {
      try {
        synthRef.current.dispose();
        effectsRef.current.forEach((fx: any) => fx?.dispose());
      } catch {}
    }

    // Default to piano for shared compositions
    const preset = instruments.piano;
    const { synth, effects } = preset.create(Tone);
    synthRef.current = synth;
    effectsRef.current = effects;

    Tone.Destination.volume.value = volume > 0 ? 20 * Math.log10(volume) : -Infinity;

    const dur = getTotalDuration(composition);
    setTotalDuration(dur);

    scheduleComposition(Tone, synth, composition, (note: Note) => {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.add(note.pitch);
        return next;
      });

      const timeout = setTimeout(() => {
        setActiveNotes((prev) => {
          const next = new Set(prev);
          next.delete(note.pitch);
          return next;
        });
      }, 300);
      noteTimeoutsRef.current.push(timeout);

      noteSpawnRef.current?.();
    });

    Tone.Transport.schedule(() => {
      setIsPlaying(false);
      Tone.Transport.stop();
    }, `+${dur}`);

    setAudioReady(true);
  }, [composition, volume]);

  // Initialize on composition load
  useEffect(() => {
    if (composition) {
      initializeAudio();
    }

    return () => {
      noteTimeoutsRef.current.forEach(clearTimeout);
      noteTimeoutsRef.current = [];
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composition]);

  // Volume sync
  useEffect(() => {
    if (toneRef.current) {
      toneRef.current.Destination.volume.value =
        volume > 0 ? 20 * Math.log10(volume) : -Infinity;
    }
  }, [volume]);

  // Progress tracking
  useEffect(() => {
    if (isPlaying && toneRef.current && totalDuration > 0) {
      progressIntervalRef.current = setInterval(() => {
        const secs = toneRef.current.Transport.seconds;
        setCurrentTime(secs);
        setProgress(secs / totalDuration);
      }, 50);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying, totalDuration]);

  // ---------- Transport handlers ----------
  const handlePlayPause = useCallback(async () => {
    if (!toneRef.current) {
      await initializeAudio();
    }
    const Tone = toneRef.current;
    if (!Tone) return;

    if (isPlaying) {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      await Tone.start();
      Tone.Transport.start();
      setIsPlaying(true);
    }
  }, [isPlaying, initializeAudio]);

  const handleRestart = useCallback(async () => {
    if (!toneRef.current) return;
    const Tone = toneRef.current;
    Tone.Transport.stop();
    setProgress(0);
    setCurrentTime(0);
    setActiveNotes(new Set());
    noteTimeoutsRef.current.forEach(clearTimeout);
    noteTimeoutsRef.current = [];

    await initializeAudio();
    await Tone.start();
    Tone.Transport.start();
    setIsPlaying(true);
  }, [initializeAudio]);

  // ---------- Invalid state ----------
  if (invalid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-5xl mb-4">
            <Music size={48} className="text-[#8B7E6A] mx-auto" />
          </div>
          <h1 className="font-serif text-2xl text-[#D4C5A9]">
            This composition link appears to be invalid
          </h1>
          <p className="text-sm text-[#8B7E6A] max-w-sm">
            The link may have been shortened or modified. Try asking the person who shared it to send a new one.
          </p>
          <Link
            href="/compose"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#F59E0B] text-[#0F0B1E] rounded-full font-semibold tracking-wide transition-all duration-300 hover:bg-[#FBBF24] hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]"
          >
            Compose Your Own
          </Link>
        </motion.div>
      </div>
    );
  }

  // ---------- Loading state ----------
  if (!payload || !composition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#F59E0B] border-t-transparent animate-spin" />
      </div>
    );
  }

  // ---------- Main playback ----------
  return (
    <div className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8"
      >
        {/* Moment text */}
        <p className="font-serif text-base italic text-[#8B7E6A] text-center max-w-md mx-auto">
          &ldquo;{payload.moment.length > 150 ? payload.moment.slice(0, 147) + "..." : payload.moment}&rdquo;
        </p>

        {/* Title */}
        <h1
          className="font-serif text-4xl sm:text-5xl text-center"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #FBBF24 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {composition.title}
        </h1>

        {/* Emotion badges */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-[#D4C5A9] border border-white/10">
            {composition.key}
          </span>
          <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-[#D4C5A9] border border-white/10">
            {composition.tempo} BPM
          </span>
          {payload.emotions.map((em) => (
            <span
              key={em}
              className="px-3 py-1 rounded-full text-xs capitalize"
              style={{
                backgroundColor: `${emotionColors[em] || "#F59E0B"}22`,
                color: emotionColors[em] || "#F59E0B",
              }}
            >
              {em}
            </span>
          ))}
        </div>

        {/* Visualization */}
        <div className="relative rounded-2xl overflow-hidden bg-[#1A1533]/50 p-6">
          <div className="absolute inset-0 pointer-events-none">
            <ParticleCanvas
              isPlaying={isPlaying}
              emotionColor={primaryColor}
              onNoteRef={noteSpawnRef}
            />
          </div>

          <div className="relative z-10">
            <PianoVisualization
              activeNotes={activeNotes}
              emotionColor={primaryColor}
            />
          </div>
        </div>

        {/* Transport */}
        <TransportControls
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onRestart={handleRestart}
          progress={progress}
          currentTime={formatTime(currentTime)}
          totalTime={formatTime(totalDuration)}
          volume={volume}
          onVolumeChange={setVolume}
        />

        {/* CTA */}
        <div className="text-center pt-8">
          <p className="text-sm text-[#8B7E6A] mb-4">Every moment deserves its own music.</p>
          <Link
            href="/compose"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#F59E0B] text-[#0F0B1E] rounded-full font-semibold tracking-wide transition-all duration-300 hover:bg-[#FBBF24] hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]"
          >
            Compose Your Own
          </Link>
        </div>

        {/* Branding */}
        <p className="text-center text-xs text-[#8B7E6A]/50 pt-4">
          Composed with HARMONY
        </p>
      </motion.div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#F59E0B] border-t-transparent animate-spin" />
        </div>
      }
    >
      <PlayInner />
    </Suspense>
  );
}
