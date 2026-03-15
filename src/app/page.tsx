"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Music, Sparkles, Headphones, Play, Quote } from "lucide-react";
import { emotions, emotionColors, emotionEmojis } from "@/lib/emotion-colors";

const instrumentShowcase = [
  { emoji: "\uD83C\uDFB9", name: "Piano", tagline: "Intimate. Every note intentional." },
  { emoji: "\uD83C\uDFBB", name: "Strings", tagline: "Sweeping emotion. Cinematic depth." },
  { emoji: "\uD83C\uDF0A", name: "Ambient", tagline: "Floating. Atmospheric. Boundless." },
  { emoji: "\uD83C\uDFB7", name: "Jazz", tagline: "Spontaneous. Soulful. Warm." },
  { emoji: "\uD83C\uDFAC", name: "Cinematic", tagline: "Epic. Powerful. Transformative." },
];

const steps = [
  {
    icon: <Sparkles size={28} className="text-[#F59E0B]" />,
    title: "Describe your moment",
    description: "In any words. A feeling, a memory, a place, a person.",
    detail: "No musical knowledge needed — just your words.",
  },
  {
    icon: <Music size={28} className="text-[#F59E0B]" />,
    title: "Choose your sound",
    description: "Piano. Strings. Orchestra. Jazz. Ambient.",
    detail: "Each instrument tells your story differently.",
  },
  {
    icon: <Headphones size={28} className="text-[#F59E0B]" />,
    title: "Listen to your moment become music",
    description: "A composition that's uniquely yours.",
    detail: "Save, share, or compose another.",
  },
];

const exampleMoments = [
  "The morning light through my kitchen window...",
  "That last phone call with my grandmother...",
  "The moment I realized I was falling in love...",
  "Standing on a mountain peak, the world silent...",
  "Rain on our tin roof when I was a child...",
];

const sampleCompositions = [
  { title: "First Light", emotion: "serenity", instrument: "Piano", bpm: 72, color: "#06B6D4", playable: true },
  { title: "Midnight Storm", emotion: "power", instrument: "Cinematic", bpm: 120, color: "#EF4444", playable: false },
  { title: "Paper Boats", emotion: "nostalgia", instrument: "Ambient", bpm: 66, color: "#A78BFA", playable: false },
];

const testimonials = [
  {
    quote: "I described losing my father. HARMONY composed something that made me cry in the most healing way.",
    author: "Sarah K.",
    role: "Teacher",
  },
  {
    quote: "I used it for our wedding. Now we have a song that IS our love story.",
    author: "Marcus & Elena",
    role: "Married 2025",
  },
  {
    quote: "My students describe their favorite memories and hear them as music. They've never been more engaged.",
    author: "Prof. James Liu",
    role: "Music Educator",
  },
];

const momentIdeas = [
  { text: "A wedding first dance", emotion: "love" },
  { text: "A goodbye to someone you loved", emotion: "grief" },
  { text: "The sound of a rainy Sunday morning", emotion: "peace" },
  { text: "Your child\u2019s first steps", emotion: "joy" },
  { text: "A road trip with your best friend", emotion: "wonder" },
  { text: "The night you decided to start over", emotion: "hope" },
];

// Golden particle background
function GoldenParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    interface P {
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
      wobble: number;
      wobbleSpeed: number;
    }

    const particles: P[] = [];
    const rect = canvas.getBoundingClientRect();
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: 1 + Math.random() * 2.5,
        opacity: 0.15 + Math.random() * 0.35,
        speed: 0.12 + Math.random() * 0.35,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.005 + Math.random() * 0.01,
      });
    }

    const animate = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.y -= p.speed;
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * 0.3;

        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Soft glow
        ctx.globalAlpha = p.opacity * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw faint constellation lines between nearby particles
      ctx.lineWidth = 0.3;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = "#F59E0B";
            ctx.globalAlpha = (1 - dist / 100) * 0.08;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

// Typewriter for example moments
function TypewriterMoments() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = exampleMoments[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 50);
    } else if (!isDeleting && text.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && text.length > 0) {
      timeout = setTimeout(() => setText(text.slice(0, -1)), 25);
    } else if (isDeleting && text.length === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % exampleMoments.length);
    }

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index]);

  return (
    <p className="text-[#8B7E6A] text-sm h-6 font-mono">
      <span className="text-[#D4C5A9]/60">&ldquo;</span>
      {text}
      <span className="animate-pulse text-[#F59E0B]">|</span>
      <span className="text-[#D4C5A9]/60">&rdquo;</span>
    </p>
  );
}

export default function Home() {
  const [playingDemo, setPlayingDemo] = useState<string | null>(null);
  const toneRef = useRef<any>(null);
  const synthRef = useRef<any>(null);

  const stopDemo = useCallback(() => {
    if (toneRef.current) {
      try {
        toneRef.current.Transport.stop();
        toneRef.current.Transport.cancel();
      } catch {}
    }
    if (synthRef.current) {
      try { synthRef.current.dispose(); } catch {}
    }
    synthRef.current = null;
    setPlayingDemo(null);
  }, []);

  useEffect(() => {
    return () => stopDemo();
  }, [stopDemo]);

  const playFirstLight = useCallback(async () => {
    if (playingDemo === "First Light") {
      stopDemo();
      return;
    }
    stopDemo();

    const { initAudio, instruments } = await import("@/lib/audio-engine");
    const { demoComposition } = await import("@/lib/demo-composition");

    const Tone = await initAudio();
    toneRef.current = Tone;

    const { synth, effects } = instruments.piano.create(Tone);
    synthRef.current = synth;

    Tone.Transport.cancel();
    Tone.Transport.bpm.value = demoComposition.tempo;

    // Schedule first 4 bars only
    const preview = demoComposition.measures.slice(0, 4);
    for (const measure of preview) {
      for (const note of [...measure.melody, ...measure.harmony, ...measure.bass]) {
        const vel = note.velocity ?? 0.5;
        Tone.Transport.schedule((time: number) => {
          synth.triggerAttackRelease(note.pitch, note.duration, time, vel);
        }, note.time);
      }
    }

    const previewDur = (4 * 4 * 60) / demoComposition.tempo;
    Tone.Transport.schedule(() => {
      stopDemo();
    }, `+${previewDur}`);

    await Tone.start();
    Tone.Transport.start();
    setPlayingDemo("First Light");
  }, [playingDemo, stopDemo]);

  return (
    <div className="relative overflow-hidden">
      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-24">
        <GoldenParticles />

        {/* Musical staff lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
          <div className="w-full max-w-5xl h-40 relative">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute w-full h-px bg-[#F59E0B]"
                style={{ top: `${20 + i * 15}%` }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 text-center max-w-3xl mx-auto"
        >
          <h1
            className="font-serif text-7xl sm:text-8xl md:text-[100px] font-bold mb-6 tracking-tight"
            style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            HARMONY
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl sm:text-2xl text-[#D4C5A9] mb-8 font-light tracking-wide"
          >
            Describe a moment. Hear it become music.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="space-y-5"
          >
            <Link
              href="/compose"
              className="inline-flex items-center gap-3 px-10 py-4 bg-[#F59E0B] text-[#0F0B1E] rounded-full text-lg font-semibold tracking-wide transition-all duration-300 hover:bg-[#FBBF24] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-[0.98]"
            >
              Begin Composing
              <ArrowRight size={20} />
            </Link>

            <div className="pt-2">
              <TypewriterMoments />
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-6 text-sm text-[#8B7E6A]"
          >
            Free. No account needed. Your moment, your music.
          </motion.p>
        </motion.div>
      </section>

      {/* ================================================================
          SAMPLE COMPOSITIONS
          ================================================================ */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl sm:text-4xl text-center mb-4 text-[#FFF7ED]"
        >
          Hear what HARMONY creates
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-[#8B7E6A] mb-12"
        >
          Real compositions generated from real moments
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {sampleCompositions.map((comp, i) => (
            <motion.div
              key={comp.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="rounded-2xl p-6 border border-white/8 relative overflow-hidden group"
              style={{ backgroundColor: "rgba(26, 21, 51, 0.8)" }}
            >
              {/* Accent glow */}
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-60"
                style={{ background: `linear-gradient(90deg, transparent, ${comp.color}, transparent)` }}
              />

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg text-[#FFF7ED]">{comp.title}</h3>
                  <p className="text-xs capitalize mt-1" style={{ color: comp.color }}>{comp.emotion}</p>
                </div>
                <button
                  onClick={comp.playable ? playFirstLight : undefined}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    comp.playable
                      ? "bg-[#F59E0B]/20 hover:bg-[#F59E0B]/40 cursor-pointer"
                      : "bg-white/5 cursor-default opacity-50"
                  }`}
                  disabled={!comp.playable}
                >
                  {playingDemo === comp.title ? (
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((b) => (
                        <div key={b} className="w-1 bg-[#F59E0B] rounded-full animate-pulse" style={{ height: 8 + b * 4, animationDelay: `${b * 150}ms` }} />
                      ))}
                    </div>
                  ) : (
                    <Play size={16} className={comp.playable ? "text-[#F59E0B] ml-0.5" : "text-[#8B7E6A] ml-0.5"} />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 text-[10px] text-[#8B7E6A] uppercase tracking-widest">
                <span>{comp.instrument}</span>
                <span className="w-px h-3 bg-white/10" />
                <span>{comp.bpm} BPM</span>
              </div>

              {!comp.playable && (
                <p className="text-[10px] text-[#8B7E6A] mt-3 italic">Preview coming soon</p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================
          WHAT MOMENTS WILL YOU COMPOSE?
          ================================================================ */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl sm:text-4xl text-center mb-4 text-[#FFF7ED]"
        >
          What moments will you compose?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-[#8B7E6A] mb-12"
        >
          Every life is full of music waiting to be heard
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {momentIdeas.map((idea, i) => {
            const color = emotionColors[idea.emotion] || "#F59E0B";
            return (
              <motion.div
                key={idea.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href="/compose"
                  className="block rounded-2xl p-6 border border-white/5 hover:border-white/15 transition-all duration-500 group relative overflow-hidden"
                  style={{ backgroundColor: "rgba(26, 21, 51, 0.6)" }}
                >
                  {/* Subtle accent line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-50 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                  />
                  <p className="font-serif text-sm text-[#D4C5A9] group-hover:text-[#FFF7ED] transition-colors duration-300 italic">
                    &ldquo;{idea.text}&rdquo;
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] uppercase tracking-widest capitalize" style={{ color }}>
                      {idea.emotion}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          FEATURED EMOTIONS
          ================================================================ */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl sm:text-4xl text-center mb-12 text-[#FFF7ED]"
        >
          What would you like to feel?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 justify-items-center"
        >
          {emotions.map((emotion, i) => {
            const color = emotionColors[emotion];
            const emoji = emotionEmojis[emotion];

            return (
              <Link
                key={emotion}
                href={`/compose?emotion=${emotion}`}
                className="flex flex-col items-center gap-2 group transition-all duration-300 ease-out"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${color}, ${color}88, ${color}33)`,
                  }}
                  whileHover={{
                    boxShadow: `0 0 20px ${color}66, 0 0 40px ${color}33`,
                  }}
                >
                  <span className="text-2xl">{emoji}</span>
                </motion.div>
                <span className="text-xs capitalize tracking-wide text-[#8B7E6A] group-hover:text-[#D4C5A9] transition-colors duration-300">
                  {emotion}
                </span>
              </Link>
            );
          })}
        </motion.div>
      </section>

      {/* ================================================================
          HOW IT WORKS
          ================================================================ */}
      <section className="px-6 py-24 max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl sm:text-4xl text-center mb-16 text-[#FFF7ED]"
        >
          How it works
        </motion.h2>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#F59E0B]/50 via-[#F59E0B]/20 to-transparent" />

          <div className="space-y-16">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="flex gap-8 items-start"
              >
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-[#1A1533] border border-[#F59E0B]/30 flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#F59E0B] mb-2">{step.title}</h3>
                  <p className="text-[#D4C5A9] leading-relaxed">{step.description}</p>
                  <p className="text-sm text-[#8B7E6A] mt-1">{step.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          TESTIMONIALS
          ================================================================ */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl sm:text-4xl text-center mb-12 text-[#FFF7ED]"
        >
          Moments turned to music
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="rounded-2xl p-6 border border-white/8 relative"
              style={{ backgroundColor: "rgba(26, 21, 51, 0.8)" }}
            >
              <Quote size={20} className="text-[#F59E0B]/30 mb-4" />
              <p className="text-[#D4C5A9] leading-relaxed text-sm mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-[#FFF7ED] text-sm font-medium">{t.author}</p>
                <p className="text-[10px] text-[#8B7E6A] uppercase tracking-widest">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================
          INSTRUMENT SHOWCASE
          ================================================================ */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl sm:text-4xl text-center mb-12 text-[#FFF7ED]"
        >
          Choose your instrument
        </motion.h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {instrumentShowcase.map((inst, i) => (
            <motion.div
              key={inst.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href="/compose"
                className="block rounded-2xl p-6 text-center border border-white/8 hover:border-[#F59E0B]/30 transition-all duration-400 ease-out hover:scale-[1.03]"
                style={{ backgroundColor: "rgba(26, 21, 51, 0.8)" }}
              >
                <div className="text-4xl mb-3">{inst.emoji}</div>
                <h3 className="font-serif text-sm text-[#FFF7ED] mb-1">{inst.name}</h3>
                <p className="text-[10px] text-[#8B7E6A] leading-relaxed">{inst.tagline}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================================================================
          STATS COUNTER
          ================================================================ */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-serif text-3xl text-[#F59E0B]">12</p>
            <p className="text-[10px] text-[#8B7E6A] uppercase tracking-widest mt-1">Emotions</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="font-serif text-3xl text-[#F59E0B]">5</p>
            <p className="text-[10px] text-[#8B7E6A] uppercase tracking-widest mt-1">Instruments</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="font-serif text-3xl text-[#F59E0B]">&infin;</p>
            <p className="text-[10px] text-[#8B7E6A] uppercase tracking-widest mt-1">Compositions</p>
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          CLOSING QUOTE + CTA
          ================================================================ */}
      <section className="px-6 py-32 max-w-3xl mx-auto text-center">
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-serif text-2xl sm:text-3xl italic text-[#F59E0B] leading-relaxed mb-10"
        >
          &ldquo;Music is the language the soul speaks when words aren&rsquo;t enough.&rdquo;
        </motion.blockquote>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <Link
            href="/compose"
            className="inline-flex items-center gap-3 px-10 py-4 bg-[#F59E0B] text-[#0F0B1E] rounded-full text-lg font-semibold tracking-wide transition-all duration-300 hover:bg-[#FBBF24] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-[0.98]"
          >
            Compose Your First Piece
            <ArrowRight size={20} />
          </Link>
          <p className="text-sm text-[#8B7E6A]">
            Free forever. No sign-up required.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
