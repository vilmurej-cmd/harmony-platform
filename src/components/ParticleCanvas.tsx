"use client";

import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
}

interface ParticleCanvasProps {
  isPlaying: boolean;
  emotionColor: string;
  onNoteRef: React.MutableRefObject<(() => void) | null>;
}

function hueShift(hex: string, shift: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;

  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  h = (h + shift + 360) % 360;
  const s = max === 0 ? 0 : d / max;
  const v = max / 255;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) { r1 = c; g1 = x; }
  else if (h < 120) { r1 = x; g1 = c; }
  else if (h < 180) { g1 = c; b1 = x; }
  else if (h < 240) { g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; b1 = c; }
  else { r1 = c; b1 = x; }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r1)}${toHex(g1)}${toHex(b1)}`;
}

const MAX_PARTICLES = 200;

export default function ParticleCanvas({
  isPlaying,
  emotionColor,
  onNoteRef,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const isPlayingRef = useRef(isPlaying);
  const colorRef = useRef(emotionColor);

  isPlayingRef.current = isPlaying;
  colorRef.current = emotionColor;

  const spawnParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const count = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      if (particlesRef.current.length >= MAX_PARTICLES) break;
      const shift = (Math.random() - 0.5) * 40;
      const maxLife = 60 + Math.random() * 60;
      particlesRef.current.push({
        x: canvas.width * (0.3 + Math.random() * 0.4),
        y: canvas.height * 0.8,
        size: 3 + Math.random() * 5,
        color: hueShift(colorRef.current, shift),
        opacity: 0.8 + Math.random() * 0.2,
        velocityX: (Math.random() - 0.5) * 1.5,
        velocityY: -(0.5 + Math.random() * 1.5),
        life: 0,
        maxLife,
      });
    }
  }, []);

  // Expose spawn function to parent
  useEffect(() => {
    onNoteRef.current = spawnParticles;
    return () => {
      onNoteRef.current = null;
    };
  }, [onNoteRef, spawnParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    });
    resizeObserver.observe(canvas);

    const animate = () => {
      if (!canvas || !ctx) return;
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.velocityX += (Math.random() - 0.5) * 0.1; // wander
        p.opacity = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife * 0.3), 0, Math.PI * 2);
        ctx.fill();

        // Soft glow
        ctx.globalAlpha = p.opacity * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
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
