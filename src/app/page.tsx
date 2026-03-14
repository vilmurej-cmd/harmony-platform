"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Music, Sparkles, Headphones } from "lucide-react";
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
  },
  {
    icon: <Music size={28} className="text-[#F59E0B]" />,
    title: "Choose your sound",
    description: "Piano. Strings. Orchestra. Jazz. Ambient.",
  },
  {
    icon: <Headphones size={28} className="text-[#F59E0B]" />,
    title: "Listen to your moment become music",
    description: "A composition that\u2019s uniquely yours.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-24">
        {/* Animated sine wave background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <svg
            viewBox="0 0 1200 200"
            className="w-full max-w-5xl"
            preserveAspectRatio="none"
          >
            <path
              d="M 0 100 Q 150 40, 300 100 T 600 100 T 900 100 T 1200 100"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2"
              className="animate-sine-wave"
            />
            <path
              d="M 0 100 Q 150 160, 300 100 T 600 100 T 900 100 T 1200 100"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.5"
              opacity="0.5"
              className="animate-sine-wave"
              style={{ animationDelay: "0.5s" }}
            />
            <path
              d="M 0 100 Q 150 20, 300 100 T 600 100 T 900 100 T 1200 100"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1"
              opacity="0.3"
              className="animate-sine-wave"
              style={{ animationDelay: "1s" }}
            />
          </svg>
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
            className="text-xl sm:text-2xl text-[#D4C5A9] mb-10 font-light tracking-wide"
          >
            Describe a moment. Hear it become music.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Link
              href="/compose"
              className="inline-flex items-center gap-3 px-10 py-4 bg-[#F59E0B] text-[#0F0B1E] rounded-full text-lg font-semibold tracking-wide transition-all duration-300 hover:bg-[#FBBF24] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-[0.98]"
            >
              Begin Composing
              <ArrowRight size={20} />
            </Link>
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
          {/* Connecting gold line */}
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
                {/* Dot on the line */}
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-[#1A1533] border border-[#F59E0B]/30 flex items-center justify-center">
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#F59E0B] mb-2">{step.title}</h3>
                  <p className="text-[#8B7E6A] leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
          QUOTE SECTION
          ================================================================ */}
      <section className="px-6 py-32 max-w-3xl mx-auto text-center">
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-serif text-2xl sm:text-3xl italic text-[#F59E0B] leading-relaxed mb-8"
        >
          &ldquo;Music is the language the soul speaks when words aren&rsquo;t enough.&rdquo;
        </motion.blockquote>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm text-[#8B7E6A]"
        >
          Coming soon: Memory Timeline, Gifts, and Collaborative Compositions
        </motion.p>
      </section>
    </div>
  );
}
