"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Music } from "lucide-react";
import PianoVisualization from "@/components/PianoVisualization";
import ParticleCanvas from "@/components/ParticleCanvas";
import TransportControls from "@/components/TransportControls";
import WaveformVisualizer from "@/components/WaveformVisualizer";
import MoodRing from "@/components/MoodRing";
import MusicDNA from "@/components/MusicDNA";
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
  const [audioIntensity, setAudioIntensity] = useState(0);
  const [compositionEnded, setCompositionEnded] = useState(false);

  // Refs
  const toneRef = useRef<any>(null);
  const synthRef = useRef<any>(null);
  const effectsRef = useRef<any[]>([]);
  const analyserRef = useRef<any>(null);
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
  const secondaryColor =
    payload?.emotions?.[1]
      ? emotionColors[payload.emotions[1]] || primaryColor
      : primaryColor;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const initializeAudio = useCallback(async () => {
    if (!composition) return;

    const { initAudio, instruments, scheduleComposition, getTotalDuration } =
      await import("@/lib/audio-engine");

    const Tone = await initAudio();
    toneRef.current = Tone;

    if (synthRef.current) {
      try {
        synthRef.current.dispose();
        effectsRef.current.forEach((fx: any) => fx?.dispose());
        if (analyserRef.current) {
          analyserRef.current.fft?.dispose();
          analyserRef.current.waveform?.dispose();
        }
      } catch {}
    }

    const preset = instruments.piano;
    const { synth, effects, analyser } = preset.create(Tone);
    synthRef.current = synth;
    effectsRef.current = effects;
    analyserRef.current = analyser || null;

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
      setCompositionEnded(true);
      Tone.Transport.stop();
    }, `+${dur}`);
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

  // Progress + intensity tracking
  useEffect(() => {
    if (isPlaying && toneRef.current && totalDuration > 0) {
      progressIntervalRef.current = setInterval(() => {
        const secs = toneRef.current.Transport.seconds;
        setCurrentTime(secs);
        setProgress(secs / totalDuration);

        if (analyserRef.current?.fft) {
          try {
            const fftData = analyserRef.current.fft.getValue();
            if (fftData) {
              let sum = 0;
              for (let i = 0; i < fftData.length; i++) {
                sum += Math.max(0, (fftData[i] as number + 100) / 100);
              }
              setAudioIntensity(Math.min(1, (sum / fftData.length) * 1.5));
            }
          } catch {}
        }
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
      setCompositionEnded(false);
    }
  }, [isPlaying, initializeAudio]);

  const handleRestart = useCallback(async () => {
    if (!toneRef.current) return;
    const Tone = toneRef.current;
    Tone.Transport.stop();
    setProgress(0);
    setCurrentTime(0);
    setActiveNotes(new Set());
    setCompositionEnded(false);
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
          <Music size={48} className="text-[#8B7E6A] mx-auto" />
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

  // ---------- Immersive playback ----------
  return (
    <div className="relative min-h-screen">
      {/* Dynamic background */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        animate={{
          background: isPlaying
            ? `radial-gradient(ellipse at 50% 70%, ${primaryColor}15 0%, transparent 60%), linear-gradient(to bottom, #0a0a1a, #0F0B1E)`
            : "linear-gradient(to bottom, #0a0a1a, #0F0B1E)",
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <ParticleCanvas
          isPlaying={isPlaying}
          emotionColor={primaryColor}
          onNoteRef={noteSpawnRef}
          emotion={payload.emotions?.[0]}
          constellation={true}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top: Info + Mood Ring */}
        <div className="flex items-start justify-between px-6 pt-8 pb-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 max-w-sm"
          >
            <p className="font-serif text-xs italic text-[#8B7E6A] mb-2 line-clamp-2">
              &ldquo;{payload.moment.length > 100 ? payload.moment.slice(0, 97) + "..." : payload.moment}&rdquo;
            </p>
            <h2
              className="font-serif text-2xl sm:text-3xl mb-3"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, #FBBF24 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {composition.title}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-[#D4C5A9] border border-white/10">
                {composition.key}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-[#D4C5A9] border border-white/10">
                {composition.tempo} BPM
              </span>
              {payload.emotions.map((em) => (
                <span
                  key={em}
                  className="px-2 py-0.5 rounded-full text-[10px] capitalize"
                  style={{
                    backgroundColor: `${emotionColors[em] || "#F59E0B"}22`,
                    color: emotionColors[em] || "#F59E0B",
                  }}
                >
                  {em}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-[#8B7E6A]/50 mt-3">Composed with HARMONY</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="hidden sm:block"
          >
            <MoodRing
              emotionColor={primaryColor}
              secondaryColor={secondaryColor}
              isPlaying={isPlaying}
              intensity={audioIntensity}
              size={90}
            />
          </motion.div>
        </div>

        <div className="flex-1" />

        {/* Bottom: Piano + Waveform + DNA */}
        <div className="relative px-4 sm:px-8 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <PianoVisualization
              activeNotes={activeNotes}
              emotionColor={primaryColor}
            />
          </motion.div>

          <div className="h-20 mt-2">
            <WaveformVisualizer
              analyserBundle={analyserRef.current}
              isPlaying={isPlaying}
              emotionColor={primaryColor}
              mode="both"
            />
          </div>

          <MusicDNA
            composition={composition}
            emotionColor={primaryColor}
            isPlaying={isPlaying}
            progress={progress}
            height={35}
          />
        </div>

        {/* Transport */}
        <div className="px-6 pb-4">
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
        </div>

        {/* CTA */}
        <div className="text-center px-6 pb-8">
          <p className="text-sm text-[#8B7E6A] mb-4">Every moment deserves its own music.</p>
          <Link
            href="/compose"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#F59E0B] text-[#0F0B1E] rounded-full font-semibold tracking-wide transition-all duration-300 hover:bg-[#FBBF24] hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]"
          >
            Compose Your Own
          </Link>
        </div>
      </div>
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
