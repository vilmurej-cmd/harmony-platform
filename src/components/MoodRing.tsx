"use client";

import { useRef, useEffect } from "react";

interface MoodRingProps {
  emotionColor: string;
  secondaryColor?: string;
  isPlaying: boolean;
  intensity?: number; // 0-1, driven by audio level
  size?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export default function MoodRing({
  emotionColor,
  secondaryColor,
  isPlaying,
  intensity = 0.5,
  size = 120,
}: MoodRingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const colorRef = useRef(emotionColor);
  const secondaryRef = useRef(secondaryColor || emotionColor);
  const isPlayingRef = useRef(isPlaying);
  const intensityRef = useRef(intensity);

  colorRef.current = emotionColor;
  secondaryRef.current = secondaryColor || emotionColor;
  isPlayingRef.current = isPlaying;
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 4;
    const innerR = outerR * 0.55;

    let phase = 0;

    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      const playing = isPlayingRef.current;
      const inten = intensityRef.current;

      // Speed depends on playing state
      phase += playing ? 0.02 + inten * 0.03 : 0.005;

      const [r1, g1, b1] = hexToRgb(colorRef.current);
      const [r2, g2, b2] = hexToRgb(secondaryRef.current);

      // Draw multiple rotating gradient arcs
      const segments = 6;
      for (let i = 0; i < segments; i++) {
        const startAngle = (i / segments) * Math.PI * 2 + phase;
        const endAngle = startAngle + Math.PI * 2 / segments + 0.05;

        // Blend between primary and secondary colors
        const t = (Math.sin(phase * 2 + i) + 1) / 2;
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);

        // Pulsing opacity based on intensity and segment
        const segmentPulse = Math.sin(phase * 3 + i * 1.2);
        const opacity = playing
          ? 0.3 + inten * 0.5 + segmentPulse * 0.15
          : 0.15 + segmentPulse * 0.05;

        ctx.beginPath();
        ctx.arc(cx, cy, outerR - (playing ? Math.sin(phase + i) * 3 * inten : 0), startAngle, endAngle);
        ctx.arc(cx, cy, innerR + (playing ? Math.sin(phase * 1.5 + i) * 4 * inten : 0), endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();
      }

      // Inner glow
      const glowRadius = innerR * (playing ? 0.9 + inten * 0.3 : 0.9);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
      const glowOpacity = playing ? 0.1 + inten * 0.25 : 0.05;
      glow.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, ${glowOpacity})`);
      glow.addColorStop(0.7, `rgba(${r1}, ${g1}, ${b1}, ${glowOpacity * 0.3})`);
      glow.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // Outer shimmer ring
      if (playing) {
        ctx.beginPath();
        ctx.arc(cx, cy, outerR + 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r1}, ${g1}, ${b1}, ${0.1 + inten * 0.2})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="pointer-events-none"
      aria-hidden="true"
    />
  );
}
