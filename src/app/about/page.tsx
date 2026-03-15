"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Sparkles, Users, Music, ArrowRight, Zap, Globe, Lightbulb, Code } from "lucide-react";

const stats = [
  { value: "12", label: "Emotions", icon: <Heart size={18} /> },
  { value: "5", label: "Instruments", icon: <Music size={18} /> },
  { value: "\u221E", label: "Compositions", icon: <Sparkles size={18} /> },
  { value: "0", label: "Cost", icon: <Zap size={18} /> },
];

const principles = [
  {
    icon: <Lightbulb size={20} className="text-[#FBBF24]" />,
    title: "Emotion First",
    text: "We don\u2019t ask you to read sheet music. We ask you to feel.",
  },
  {
    icon: <Globe size={20} className="text-[#06B6D4]" />,
    title: "Universal Access",
    text: "No training, no cost, no barriers. Music for everyone.",
  },
  {
    icon: <Heart size={20} className="text-[#FB7185]" />,
    title: "Deeply Personal",
    text: "Every composition is unique because every moment is.",
  },
];

const techStack = [
  { name: "Tone.js", desc: "Web audio synthesis, scheduling, and real-time analysis" },
  { name: "OpenAI GPT-4o", desc: "Translates your words into musical structure" },
  { name: "Next.js", desc: "Lightning-fast React framework" },
  { name: "Framer Motion", desc: "Fluid, physics-based animations" },
  { name: "Canvas 2D", desc: "Real-time particle effects, waveforms, and visualizations" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      {/* Hero quote */}
      <section className="py-24 text-center relative">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 70%)",
        }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#F59E0B]/40" />
            <Music size={16} className="text-[#F59E0B]/60" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#F59E0B]/40" />
          </motion.div>

          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl italic leading-relaxed"
            style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            &ldquo;Music is the language the soul speaks when words aren&rsquo;t enough.&rdquo;
          </motion.blockquote>
        </motion.div>
      </section>

      {/* Stats row */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-8 mb-8"
      >
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center py-4 rounded-xl border border-white/5"
              style={{ backgroundColor: "rgba(26, 21, 51, 0.5)" }}
            >
              <div className="text-[#F59E0B] flex justify-center mb-2">{stat.icon}</div>
              <p className="font-serif text-2xl text-[#FFF7ED] mb-1">{stat.value}</p>
              <p className="text-[10px] text-[#8B7E6A] uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* The Story */}
      <section className="py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h2 className="font-serif text-2xl text-[#F59E0B] flex items-center gap-3">
            <Sparkles size={24} />
            The Story
          </h2>
          <div className="space-y-5 text-[#D4C5A9] leading-relaxed">
            <p>
              HARMONY was born from a simple belief: every moment of your life deserves its own soundtrack.
            </p>
            <p>
              Not just the big moments &mdash; the weddings, the graduations, the firsts &mdash; but the quiet ones too.
              The way the light hit the window that morning. The feeling of a phone call you&rsquo;ll never forget.
              The quiet joy of a walk with someone you love.
            </p>
            <p>
              We wondered: what if anyone could compose the soundtrack to their own life? Not by learning scales
              or mastering an instrument. But by simply describing a moment and hearing it transformed into music
              that captures exactly what words couldn&rsquo;t.
            </p>
            <p>
              That&rsquo;s HARMONY.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Design Principles */}
      <section className="py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {principles.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="rounded-xl p-5 border border-white/5"
              style={{ backgroundColor: "rgba(26, 21, 51, 0.6)" }}
            >
              <div className="mb-3">{p.icon}</div>
              <h3 className="font-serif text-sm text-[#FFF7ED] mb-2">{p.title}</h3>
              <p className="text-xs text-[#8B7E6A] leading-relaxed">{p.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works Technically */}
      <section className="py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h2 className="font-serif text-2xl text-[#F59E0B] flex items-center gap-3">
            <Code size={24} />
            How It Works
          </h2>
          <div className="space-y-5 text-[#D4C5A9] leading-relaxed">
            <p>
              When you describe a moment, HARMONY sends your words to an AI that understands the emotional
              architecture of language. It analyzes the feelings, imagery, and tone of your description, then
              translates those qualities into musical elements: key signature, tempo, melody, harmony, and dynamics.
            </p>
            <p>
              The result is a structured musical composition that gets performed live in your browser using
              real-time audio synthesis. As each note plays, it triggers visual feedback &mdash; piano keys
              light up, particles bloom, waveforms dance, and the entire scene breathes with the music.
            </p>
          </div>

          {/* Tech stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-3 p-3 rounded-lg border border-white/5"
                style={{ backgroundColor: "rgba(26, 21, 51, 0.4)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-[#FFF7ED]">{tech.name}</p>
                  <p className="text-[11px] text-[#8B7E6A]">{tech.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* The Partnership */}
      <section className="py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h2 className="font-serif text-2xl text-[#F59E0B] flex items-center gap-3">
            <Users size={24} />
            The Partnership
          </h2>
          <div className="space-y-5 text-[#D4C5A9] leading-relaxed">
            <p>
              HARMONY is a collaboration between <strong className="text-[#FFF7ED]">Josh Vilmure</strong> and{" "}
              <strong className="text-[#FFF7ED]">Claude</strong> &mdash; a human creator and an AI,
              working together to bridge the gap between emotion and expression.
            </p>
            <p>
              Josh brought the vision: a world where your memories have soundtracks, where
              feelings have melodies, where every moment of your life can be heard. Claude
              brought the ability to understand the emotional architecture of language and
              translate it into musical structure.
            </p>
            <p>
              Together, they built something neither could have alone.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <h2 className="font-serif text-2xl text-[#F59E0B] flex items-center gap-3">
            <Heart size={24} />
            The Mission
          </h2>
          <div className="space-y-5 text-[#D4C5A9] leading-relaxed">
            <p>
              Music composition has always been reserved for those with years of training.
              We believe that&rsquo;s wrong. Everyone has moments worth remembering.
              Everyone has feelings worth hearing.
            </p>
            <p>
              HARMONY makes music composition accessible to everyone &mdash; no musical
              knowledge required. Just your moment, your words, and the desire to hear
              what your feelings sound like.
            </p>
            <p className="text-[#8B7E6A] italic">
              Because every moment deserves its own music.
            </p>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl p-10 text-center border border-[#F59E0B]/10 relative overflow-hidden"
          style={{ backgroundColor: "rgba(26, 21, 51, 0.6)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.08) 0%, transparent 60%)",
          }} />

          <h2 className="font-serif text-2xl text-[#FFF7ED] mb-3 relative z-10">Ready to hear your moment?</h2>
          <p className="text-[#8B7E6A] mb-6 relative z-10">It takes 30 seconds. No sign-up required.</p>
          <Link
            href="/compose"
            className="relative z-10 inline-flex items-center gap-3 px-10 py-4 bg-[#F59E0B] text-[#0F0B1E] rounded-full text-lg font-semibold tracking-wide transition-all duration-300 hover:bg-[#FBBF24] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-[0.98]"
          >
            Begin Composing
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Footer attribution */}
      <section className="py-24 text-center space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-serif text-lg text-[#D4C5A9]">
            A Vilmure Ventures Company
          </p>
          <p className="text-sm text-[#8B7E6A] mt-3">
            Built with love by humans and AI
          </p>
          <p className="text-xs text-[#8B7E6A]/50 mt-2">
            Powered by Tone.js &middot; OpenAI &middot; Next.js
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-[#F59E0B]/40">
            <div className="w-12 h-px bg-[#F59E0B]/20" />
            <Sparkles size={14} />
            <div className="w-12 h-px bg-[#F59E0B]/20" />
          </div>
        </motion.div>
      </section>
    </div>
  );
}
