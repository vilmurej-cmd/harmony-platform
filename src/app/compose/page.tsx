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
import WaveformVisualizer from "@/components/WaveformVisualizer";
import MoodRing from "@/components/MoodRing";
import MusicDNA from "@/components/MusicDNA";
import { emotionColors } from "@/lib/emotion-colors";
import { saveComposition } from "@/lib/music-storage";
import { encodeComposition, generateShareText } from "@/lib/share";
import type { Composition, Note } from "@/lib/audio-engine";

type Step = "input" | "mood" | "sound" | "composing" | "playback";

const STEP_LABELS = ["Describe", "Emotion", "Instrument", "Listen"];
const STEP_MAP: Record<Step, number> = { input: 0, mood: 1, sound: 2, composing: 3, playback: 3 };

const placeholders = [
  "The morning light through my kitchen window on a Sunday...",
  "That last phone call with my grandmother before she passed...",
  "The moment I realized I was falling in love...",
  "Standing on a mountain peak, the world below me silent...",
  "The sound of rain on our tin roof when I was a child...",
];

function StepIndicator({ currentStep, emotionColor }: { currentStep: Step; emotionColor: string }) {
  const activeIndex = STEP_MAP[currentStep];

  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {STEP_LABELS.map((label, i) => {
        const isActive = i === activeIndex;
        const isCompleted = i < activeIndex;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                animate={{
                  backgroundColor: isActive ? emotionColor : isCompleted ? `${emotionColor}88` : "rgba(255,255,255,0.06)",
                  color: isActive || isCompleted ? "#0F0B1E" : "#8B7E6A",
                  boxShadow: isActive ? `0 0 20px ${emotionColor}66, 0 0 40px ${emotionColor}22` : "none",
                }}
                transition={{ duration: 0.5 }}
              >
                {isCompleted ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${emotionColor}` }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <span className={`text-[10px] uppercase tracking-widest ${isActive ? "text-[#FFF7ED]" : "text-[#8B7E6A]"} transition-colors duration-500`}>
                {label}
              </span>
            </div>

            {i < STEP_LABELS.length - 1 && (
              <div className="w-12 sm:w-20 h-px mx-2 mb-6">
                <motion.div
                  className="h-full rounded-full"
                  animate={{
                    backgroundColor: i < activeIndex ? emotionColor : "rgba(255,255,255,0.08)",
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const autoPlayTriggeredRef = useRef(false);

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
    setCompositionEnded(false);
    autoPlayTriggeredRef.current = false;

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
        if (analyserRef.current) {
          analyserRef.current.fft?.dispose();
          analyserRef.current.waveform?.dispose();
        }
      } catch {}
    }

    const preset = instruments[instrument] || instruments.piano;
    const { synth, effects, analyser } = preset.create(Tone);
    synthRef.current = synth;
    effectsRef.current = effects;
    analyserRef.current = analyser || null;

    // Set volume
    Tone.Destination.volume.value = volume > 0 ? 20 * Math.log10(volume) : -Infinity;

    const dur = getTotalDuration(composition);
    setTotalDuration(dur);

    // Schedule notes with onNote callback
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

    // Schedule stop at end
    Tone.Transport.schedule(() => {
      setIsPlaying(false);
      setCompositionEnded(true);
      Tone.Transport.stop();
    }, `+${dur}`);
  }, [composition, instrument, volume]);

  // Initialize audio when composition arrives + AUTO-PLAY after a dramatic pause
  useEffect(() => {
    if (step === "playback" && composition && !autoPlayTriggeredRef.current) {
      autoPlayTriggeredRef.current = true;

      // Dramatic pause — let the title fade in, then auto-play
      const autoPlayTimeout = setTimeout(async () => {
        try {
          await initializeAudio();
          const Tone = toneRef.current;
          if (Tone) {
            await Tone.start();
            Tone.Transport.start();
            setIsPlaying(true);
          }
        } catch {
          // If auto-play fails (browser policy), user can click play
          await initializeAudio();
        }
      }, 2000);

      return () => clearTimeout(autoPlayTimeout);
    }

    return () => {
      noteTimeoutsRef.current.forEach(clearTimeout);
      noteTimeoutsRef.current = [];
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, composition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
  }, []);

  // Volume sync
  useEffect(() => {
    if (toneRef.current) {
      toneRef.current.Destination.volume.value =
        volume > 0 ? 20 * Math.log10(volume) : -Infinity;
    }
  }, [volume]);

  // Progress tracking + audio intensity
  useEffect(() => {
    if (isPlaying && toneRef.current && totalDuration > 0) {
      progressIntervalRef.current = setInterval(() => {
        const secs = toneRef.current.Transport.seconds;
        setCurrentTime(secs);
        setProgress(secs / totalDuration);

        // Calculate audio intensity from FFT for mood ring
        if (analyserRef.current?.fft) {
          try {
            const fftData = analyserRef.current.fft.getValue();
            if (fftData) {
              let sum = 0;
              for (let i = 0; i < fftData.length; i++) {
                sum += Math.max(0, (fftData[i] as number + 100) / 100);
              }
              const avg = sum / fftData.length;
              setAudioIntensity(Math.min(1, avg * 1.5));
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
    if (analyserRef.current) {
      try {
        analyserRef.current.fft?.dispose();
        analyserRef.current.waveform?.dispose();
      } catch {}
    }
    synthRef.current = null;
    effectsRef.current = [];
    analyserRef.current = null;

    setComposition(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setActiveNotes(new Set());
    setSaved(false);
    setShared(false);
    setCompositionEnded(false);
    autoPlayTriggeredRef.current = false;
    setStep("input");
  };

  // ---------- Primary emotion color ----------
  const primaryColor =
    selectedEmotions.length > 0
      ? emotionColors[selectedEmotions[0]] || "#F59E0B"
      : "#F59E0B";

  const secondaryColor =
    selectedEmotions.length > 1
      ? emotionColors[selectedEmotions[1]] || primaryColor
      : primaryColor;

  // ---------- Render ----------
  // The playback step breaks out of the container for full-screen immersion
  if (step === "playback" && composition) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative min-h-screen -mx-6 sm:-mx-0"
      >
        {/* ===== IMMERSIVE PERFORMANCE VIEW ===== */}

        {/* Dynamic background that breathes with the music */}
        <motion.div
          className="fixed inset-0 pointer-events-none z-0"
          animate={{
            background: isPlaying
              ? `radial-gradient(ellipse at 50% 70%, ${primaryColor}${Math.round(audioIntensity * 25).toString(16).padStart(2, "0")} 0%, transparent 60%), radial-gradient(ellipse at 30% 30%, ${secondaryColor}08 0%, transparent 50%), linear-gradient(to bottom, #0a0a1a, #0F0B1E)`
              : "linear-gradient(to bottom, #0a0a1a, #0F0B1E)",
          }}
          transition={{ duration: 0.8 }}
        />

        {/* Particle universe — full screen */}
        <div className="fixed inset-0 pointer-events-none z-[1]">
          <ParticleCanvas
            isPlaying={isPlaying}
            emotionColor={primaryColor}
            onNoteRef={noteSpawnRef}
            emotion={selectedEmotions[0]}
            constellation={true}
            instrumentColor={instrument}
          />
        </div>

        {/* Content layer */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Top: Composition info + Mood Ring */}
          <div className="flex items-start justify-between px-6 pt-8 pb-4">
            {/* Left: Info overlay (floating glass panel) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 max-w-sm"
            >
              <p className="font-serif text-xs italic text-[#8B7E6A] mb-2 line-clamp-2">
                &ldquo;{moment.length > 100 ? moment.slice(0, 97) + "..." : moment}&rdquo;
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
                {selectedEmotions.map((em) => (
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
              {/* Elapsed time */}
              <div className="mt-3 flex items-center gap-2 text-[10px] text-[#8B7E6A] tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </motion.div>

            {/* Right: Mood Ring */}
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
                size={100}
              />
            </motion.div>
          </div>

          {/* Middle: Spacer to push piano to bottom third */}
          <div className="flex-1" />

          {/* Bottom third: Piano / Instrument visualization + Waveform */}
          <div className="relative px-4 sm:px-8 pb-4">
            {/* Piano visualization */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
            >
              {(instrument === "piano" || instrument === "jazz") ? (
                <PianoVisualization
                  activeNotes={activeNotes}
                  emotionColor={primaryColor}
                />
              ) : (
                /* Non-piano instruments: animated orb with instrument icon */
                <div className="flex items-center justify-center py-8">
                  <div className="relative">
                    <motion.div
                      className="w-32 h-32 rounded-full flex items-center justify-center"
                      animate={{
                        scale: isPlaying ? [1, 1.08 + audioIntensity * 0.12, 1] : 1,
                        boxShadow: isPlaying
                          ? `0 0 ${40 + audioIntensity * 60}px ${primaryColor}${Math.round(audioIntensity * 80).toString(16).padStart(2, "0")}, 0 0 ${80 + audioIntensity * 120}px ${primaryColor}33`
                          : `0 0 20px ${primaryColor}22`,
                      }}
                      transition={{ duration: 1.5, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
                      style={{
                        background: `radial-gradient(circle, ${primaryColor}66, ${primaryColor}22, transparent)`,
                      }}
                    >
                      <Music size={40} style={{ color: primaryColor }} />
                    </motion.div>
                    {/* Rings */}
                    {isPlaying && [0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full"
                        style={{ border: `1px solid ${primaryColor}` }}
                        animate={{
                          scale: [1, 2 + i * 0.5],
                          opacity: [0.3, 0],
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.6,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Waveform visualizer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="h-20 mt-2"
            >
              <WaveformVisualizer
                analyserBundle={analyserRef.current}
                isPlaying={isPlaying}
                emotionColor={primaryColor}
                mode="both"
              />
            </motion.div>

            {/* Music DNA — unique fingerprint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="mt-2"
            >
              <MusicDNA
                composition={composition}
                emotionColor={primaryColor}
                isPlaying={isPlaying}
                progress={progress}
                height={40}
              />
            </motion.div>
          </div>

          {/* Transport controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="px-6 pb-4"
          >
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
          </motion.div>

          {/* Action buttons — appear after composition ends or always visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: compositionEnded ? 1 : 0.7 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 flex-wrap px-6 pb-8"
          >
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 text-[#D4C5A9] text-sm hover:border-[#F59E0B]/30 hover:text-[#FFF7ED] transition-all duration-300"
            >
              <RotateCcw size={14} />
              Compose Another
            </button>

            <button
              onClick={handleSave}
              disabled={saved}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm transition-all duration-300 ${
                saved
                  ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                  : "border-white/10 text-[#D4C5A9] hover:border-[#F59E0B]/30 hover:text-[#FFF7ED]"
              }`}
            >
              <Save size={14} />
              {saved ? "Saved!" : "Save to My Music"}
            </button>

            <button
              onClick={handleShare}
              disabled={shared}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm transition-all duration-300 ${
                shared
                  ? "border-[#F59E0B]/30 text-[#F59E0B] bg-[#F59E0B]/10"
                  : "border-white/10 text-[#D4C5A9] hover:border-[#F59E0B]/30 hover:text-[#FFF7ED]"
              }`}
            >
              <Share2 size={14} />
              {shared ? "Copied!" : "Share"}
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      {/* Step progress indicator (hidden during composing animation) */}
      {step !== "composing" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <StepIndicator currentStep={step} emotionColor={primaryColor} />
        </motion.div>
      )}

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
                Each instrument tells your story differently. Hover to preview.
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
                Compose My Moment
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
      </AnimatePresence>
    </div>
  );
}

// Sparkles icon
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
