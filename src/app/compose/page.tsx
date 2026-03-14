"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Save, Share2, RotateCcw, Music } from "lucide-react";
import EmotionOrbs from "@/components/EmotionOrbs";
import InstrumentCards from "@/components/InstrumentCards";
import DurationSelector from "@/components/DurationSelector";
import ComposingLoader from "@/components/ComposingLoader";
import PianoVisualization from "@/components/PianoVisualization";
import ParticleCanvas from "@/components/ParticleCanvas";
import TransportControls from "@/components/TransportControls";
import { emotionColors } from "@/lib/emotion-colors";
import { saveComposition } from "@/lib/music-storage";
import { encodeComposition, generateShareText } from "@/lib/share";
import type { Composition, Note } from "@/lib/audio-engine";

type Step = "input" | "mood" | "sound" | "composing" | "playback";

const placeholders = [
  "The morning light through my kitchen window on a Sunday...",
  "That last phone call with my grandmother before she passed...",
  "The moment I realized I was falling in love...",
  "Standing on a mountain peak, the world below me silent...",
  "The sound of rain on our tin roof when I was a child...",
];

function ComposeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---------- State ----------
  const [step, setStep] = useState<Step>("input");
  const [moment, setMoment] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [instrument, setInstrument] = useState("piano");
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState("");

  // Playback state
  const [composition, setComposition] = useState<Composition | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  // Refs
  const toneRef = useRef<any>(null);
  const synthRef = useRef<any>(null);
  const effectsRef = useRef<any[]>([]);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const noteSpawnRef = useRef<(() => void) | null>(null);
  const noteTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Pre-select emotion from URL
  useEffect(() => {
    const urlEmotion = searchParams.get("emotion");
    if (urlEmotion && !selectedEmotions.includes(urlEmotion)) {
      setSelectedEmotions([urlEmotion]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle placeholders
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ---------- Emotion toggle ----------
  const toggleEmotion = useCallback((emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : prev.length < 3
        ? [...prev, emotion]
        : prev,
    );
  }, []);

  // ---------- Format time ----------
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ---------- Compose ----------
  const handleCompose = async () => {
    setStep("composing");
    setError("");

    try {
      const res = await fetch("/api/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moment,
          emotions: selectedEmotions,
          instrument,
          durationSeconds: duration,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Composition failed");
      }

      setComposition(data.composition);
      setStep("playback");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setStep("input");
    }
  };

  // ---------- Audio engine ----------
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

    const preset = instruments[instrument] || instruments.piano;
    const { synth, effects } = preset.create(Tone);
    synthRef.current = synth;
    effectsRef.current = effects;

    // Set volume
    Tone.Destination.volume.value = volume > 0 ? 20 * Math.log10(volume) : -Infinity;

    const dur = getTotalDuration(composition);
    setTotalDuration(dur);

    // Schedule notes with onNote callback
    scheduleComposition(Tone, synth, composition, (note: Note) => {
      // Update active notes
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.add(note.pitch);
        return next;
      });

      // Clear after 300ms
      const timeout = setTimeout(() => {
        setActiveNotes((prev) => {
          const next = new Set(prev);
          next.delete(note.pitch);
          return next;
        });
      }, 300);
      noteTimeoutsRef.current.push(timeout);

      // Trigger particle spawn
      noteSpawnRef.current?.();
    });

    // Schedule stop at end
    Tone.Transport.schedule(() => {
      setIsPlaying(false);
      Tone.Transport.stop();
    }, `+${dur}`);
  }, [composition, instrument, volume]);

  // Initialize audio when composition arrives
  useEffect(() => {
    if (step === "playback" && composition) {
      initializeAudio();
    }

    return () => {
      // Cleanup on unmount
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
  }, [step, composition]);

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

    // Re-schedule and start
    await initializeAudio();
    await Tone.start();
    Tone.Transport.start();
    setIsPlaying(true);
  }, [initializeAudio]);

  // ---------- Save ----------
  const handleSave = () => {
    if (!composition) return;
    saveComposition({
      id: crypto.randomUUID(),
      moment,
      title: composition.title,
      emotions: selectedEmotions,
      instrument,
      composition,
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // ---------- Share ----------
  const handleShare = () => {
    if (!composition) return;
    const encoded = encodeComposition(composition, moment, composition.title, selectedEmotions);
    const url = `${window.location.origin}/play?c=${encoded}`;
    const text = generateShareText(composition.title, moment);
    navigator.clipboard.writeText(`${text}\n\n${url}`);
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  };

  // ---------- Reset ----------
  const handleReset = () => {
    // Cleanup audio
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

    setComposition(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setActiveNotes(new Set());
    setSaved(false);
    setShared(false);
    setStep("input");
  };

  // ---------- Primary emotion color ----------
  const primaryColor =
    selectedEmotions.length > 0
      ? emotionColors[selectedEmotions[0]] || "#F59E0B"
      : "#F59E0B";

  // ---------- Render ----------
  return (
    <div className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {/* ============================================================
            STEP 1: INPUT
            ============================================================ */}
        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="font-serif text-4xl sm:text-5xl text-[#FFF7ED] mb-3">
                Describe your moment
              </h1>
              <p className="text-[#8B7E6A]">
                A feeling, a memory, a place, a person. Any words at all.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <div className="relative">
              <textarea
                value={moment}
                onChange={(e) => setMoment(e.target.value)}
                placeholder={placeholders[placeholderIndex]}
                rows={5}
                maxLength={500}
                className="w-full p-6 rounded-2xl bg-[#1A1533] border border-white/10 text-[#FFF7ED] text-lg leading-relaxed placeholder:text-[#8B7E6A]/50 focus:border-[#F59E0B]/40 focus:outline-none focus:ring-0 transition-colors duration-300 resize-none"
              />
              <div className="flex justify-between mt-2 px-1">
                <p className="text-xs text-[#8B7E6A]">
                  The more you describe, the more personal your music becomes.
                </p>
                <span className="text-xs text-[#8B7E6A] tabular-nums">
                  {moment.length}/500
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setStep("mood")}
                disabled={moment.trim().length < 5}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#F59E0B] text-[#0F0B1E] rounded-full font-semibold tracking-wide transition-all duration-300 hover:bg-[#FBBF24] hover:shadow-[0_0_24px_rgba(245,158,11,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-[#F59E0B]"
              >
                Next
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ============================================================
            STEP 2: MOOD
            ============================================================ */}
        {step === "mood" && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h1 className="font-serif text-4xl sm:text-5xl text-[#FFF7ED] mb-3">
                Does your moment have a color?
              </h1>
              <p className="text-[#8B7E6A]">
                Select up to 3 emotions. These shape the harmonic language of your piece.
              </p>
            </div>

            <EmotionOrbs
              selected={selectedEmotions}
              onToggle={toggleEmotion}
              size="lg"
            />

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setStep("input")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[#8B7E6A] hover:text-[#D4C5A9] transition-colors duration-300"
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <button
                onClick={() => setStep("sound")}
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#F59E0B] text-[#0F0B1E] rounded-full font-semibold tracking-wide transition-all duration-300 hover:bg-[#FBBF24] hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]"
              >
                Next
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setSelectedEmotions([]);
                  setStep("sound");
                }}
                className="text-sm text-[#8B7E6A] hover:text-[#D4C5A9] transition-colors duration-300 underline underline-offset-4 decoration-[#8B7E6A]/30"
              >
                Skip — let the AI decide
              </button>
            </div>
          </motion.div>
        )}

        {/* ============================================================
            STEP 3: SOUND
            ============================================================ */}
        {step === "sound" && (
          <motion.div
            key="sound"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
          >
            <div className="text-center">
              <h1 className="font-serif text-4xl sm:text-5xl text-[#FFF7ED] mb-3">
                Choose your sound
              </h1>
              <p className="text-[#8B7E6A]">
                Each instrument tells your story differently.
              </p>
            </div>

            <InstrumentCards selected={instrument} onSelect={setInstrument} />

            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-[#8B7E6A] uppercase tracking-widest mb-2">
                Duration
              </p>
              <DurationSelector selected={duration} onSelect={setDuration} />
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setStep("mood")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[#8B7E6A] hover:text-[#D4C5A9] transition-colors duration-300"
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <button
                onClick={handleCompose}
                className="inline-flex items-center gap-2 px-10 py-4 bg-[#F59E0B] text-[#0F0B1E] rounded-full text-lg font-semibold tracking-wide transition-all duration-300 hover:bg-[#FBBF24] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-[0.98] animate-gold-glow"
              >
                Compose
                <Sparkles size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ============================================================
            STEP 4: COMPOSING
            ============================================================ */}
        {step === "composing" && (
          <motion.div
            key="composing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-[60vh] flex flex-col items-center justify-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-lg italic text-[#D4C5A9] text-center mb-8 max-w-md"
            >
              &ldquo;{moment.length > 120 ? moment.slice(0, 117) + "..." : moment}&rdquo;
            </motion.p>

            <ComposingLoader emotions={selectedEmotions} />
          </motion.div>
        )}

        {/* ============================================================
            STEP 5: PLAYBACK
            ============================================================ */}
        {step === "playback" && composition && (
          <motion.div
            key="playback"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* User's moment */}
            <p className="font-serif text-base italic text-[#8B7E6A] text-center max-w-md mx-auto">
              &ldquo;{moment.length > 120 ? moment.slice(0, 117) + "..." : moment}&rdquo;
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

            {/* Meta badges */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-[#D4C5A9] border border-white/10">
                {composition.key}
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-[#D4C5A9] border border-white/10">
                {composition.tempo} BPM
              </span>
              {selectedEmotions.map((em) => (
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

            {/* Visualization area */}
            <div className="relative rounded-2xl overflow-hidden bg-[#1A1533]/50 p-6">
              {/* Particle canvas overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <ParticleCanvas
                  isPlaying={isPlaying}
                  emotionColor={primaryColor}
                  onNoteRef={noteSpawnRef}
                />
              </div>

              {/* Piano visualization (shown for piano, jazz; placeholder for others) */}
              {(instrument === "piano" || instrument === "jazz") ? (
                <div className="relative z-10">
                  <PianoVisualization
                    activeNotes={activeNotes}
                    emotionColor={primaryColor}
                  />
                </div>
              ) : (
                <div className="relative z-10 flex items-center justify-center h-40">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isPlaying ? "animate-breathe" : ""
                    }`}
                    style={{
                      background: `radial-gradient(circle, ${primaryColor}88, ${primaryColor}33, transparent)`,
                      boxShadow: isPlaying
                        ? `0 0 40px ${primaryColor}44, 0 0 80px ${primaryColor}22`
                        : "none",
                    }}
                  >
                    <Music size={32} style={{ color: primaryColor }} />
                  </div>
                </div>
              )}
            </div>

            {/* Transport controls */}
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

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-4 flex-wrap pt-4">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 text-[#D4C5A9] hover:border-[#F59E0B]/30 hover:text-[#FFF7ED] transition-all duration-300"
              >
                <RotateCcw size={16} />
                Compose Another
              </button>

              <button
                onClick={handleSave}
                disabled={saved}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 ${
                  saved
                    ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                    : "border-white/10 text-[#D4C5A9] hover:border-[#F59E0B]/30 hover:text-[#FFF7ED]"
                }`}
              >
                <Save size={16} />
                {saved ? "Saved!" : "Save to My Music"}
              </button>

              <button
                onClick={handleShare}
                disabled={shared}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 ${
                  shared
                    ? "border-[#F59E0B]/30 text-[#F59E0B] bg-[#F59E0B]/10"
                    : "border-white/10 text-[#D4C5A9] hover:border-[#F59E0B]/30 hover:text-[#FFF7ED]"
                }`}
              >
                <Share2 size={16} />
                {shared ? "Copied!" : "Share This Moment"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sparkles icon used in sound step
function Sparkles({ size, ...props }: { size: number } & React.SVGAttributes<SVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#F59E0B] border-t-transparent animate-spin" />
        </div>
      }
    >
      <ComposeInner />
    </Suspense>
  );
}
