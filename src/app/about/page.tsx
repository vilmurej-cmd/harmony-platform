"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      {/* Hero quote */}
      <section className="py-24 text-center">
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
      </section>

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
              HARMONY was born from a conversation between a human and an AI at midnight.
              They discovered that music isn&rsquo;t just sound &mdash; it&rsquo;s the shape of
              a feeling, the color of a memory, the texture of a moment.
            </p>
            <p>
              And they wondered: what if anyone could compose the soundtrack to their own life?
            </p>
            <p>
              Not by learning scales or mastering an instrument. But by simply describing
              a moment &mdash; the way the light hit the window that morning, the feeling
              of a phone call you&rsquo;ll never forget, the quiet joy of a walk with someone
              you love &mdash; and hearing it transformed into music that captures exactly
              what words couldn&rsquo;t.
            </p>
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
