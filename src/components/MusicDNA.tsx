"use client";

import { useRef, useEffect } from "react";
import type { Composition } from "@/lib/audio-engine";

interface MusicDNAProps {
  composition: Composition;
  emotionColor: string;
  isPlaying: boolean;
  progress: number; // 0-1
  height?: number;
}

/**
 * Music DNA — a unique double-helix visual fingerprint for each composition.
 * Each note becomes a point on the helix, creating a pattern as unique as DNA.
 */
export default function MusicDNA({
  composition,
  emotionColor,
  isPlaying,
  progress,
  height = 60,
}: MusicDNAProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const progressRef = useRef(progress);
  const isPlayingRef = useRef(isPlaying);

  progressRef.current = progress;
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Extract note positions from composition for the DNA pattern
    const notePositions: { x: number; pitch: number; velocity: number }[] = [];
    const totalBars = composition.measures.length;

    for (const measure of composition.measures) {
      const allNotes = [...measure.melody, ...measure.harmony, ...measure.bass];
      for (const note of allNotes) {
        // Parse time "bar:beat:sub"
        const parts = note.time.split(":").map(Number);
        const barPos = (parts[0] + parts[1] / 4 + parts[2] / 16) / totalBars;

        // Convert pitch to numeric (C0 = 0, C8 = 96)
        const pitchMatch = note.pitch.match(/([A-G]#?)(\d)/);
        let pitchNum = 60; // default middle C
        if (pitchMatch) {
          const noteNames: Record<string, number> = {
            C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5,
            "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11,
          };
          pitchNum = (parseInt(pitchMatch[2]) + 1) * 12 + (noteNames[pitchMatch[1]] || 0);
        }

        notePositions.push({
          x: barPos,
          pitch: pitchNum,
          velocity: note.velocity ?? 0.5,
        });
      }
    }

    notePositions.sort((a, b) => a.x - b.x);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height: h } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    });
    resizeObserver.observe(canvas);

    let phase = 0;

    const animate = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const playing = isPlayingRef.current;
      const prog = progressRef.current;

      phase += playing ? 0.03 : 0.008;

      const centerY = h / 2;
      const amplitude = h * 0.35;
      const helixSpacing = 3;

      // Draw the double helix strands
      for (let strand = 0; strand < 2; strand++) {
        const offset = strand * Math.PI;
        ctx.beginPath();
        ctx.lineWidth = 1.5;

        for (let x = 0; x < w; x += 1) {
          const t = x / w;
          const waveY = Math.sin(t * Math.PI * helixSpacing + phase + offset) * amplitude;
          const y = centerY + waveY;

          // Brightness based on playback progress
          const playedAlpha = t <= prog ? 0.8 : 0.2;
          ctx.strokeStyle = emotionColor;
          ctx.globalAlpha = playedAlpha;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw note markers as cross-rungs between the strands
      for (const note of notePositions) {
        const x = note.x * w;
        const t = x / w;
        const y1 = centerY + Math.sin(t * Math.PI * helixSpacing + phase) * amplitude;
        const y2 = centerY + Math.sin(t * Math.PI * helixSpacing + phase + Math.PI) * amplitude;

        const played = t <= prog;
        const dotSize = 1.5 + note.velocity * 2;

        // Connecting rung
        ctx.beginPath();
        ctx.strokeStyle = emotionColor;
        ctx.globalAlpha = played ? 0.25 : 0.06;
        ctx.lineWidth = 0.5;
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();

        // Note dot
        ctx.beginPath();
        ctx.fillStyle = emotionColor;
        ctx.globalAlpha = played ? 0.9 : 0.15;
        const dotY = note.pitch > 60 ? y1 : y2;
        ctx.arc(x, dotY, dotSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Playhead
      if (playing && prog > 0 && prog < 1) {
        const px = prog * w;
        ctx.beginPath();
        ctx.strokeStyle = "#FFF7ED";
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 1;
        ctx.moveTo(px, 2);
        ctx.lineTo(px, h - 2);
        ctx.stroke();

        // Glow at playhead
        ctx.beginPath();
        ctx.fillStyle = emotionColor;
        ctx.globalAlpha = 0.4;
        ctx.arc(px, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [composition, emotionColor, height]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      style={{ height }}
      aria-hidden="true"
    />
  );
}
