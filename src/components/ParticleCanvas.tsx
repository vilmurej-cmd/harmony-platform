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
  shape: "circle" | "star" | "drop" | "diamond" | "heart";
  rotation: number;
  rotationSpeed: number;
  pairedWith?: number; // index of pair partner (for love emotion)
}

interface ParticleCanvasProps {
  isPlaying: boolean;
  emotionColor: string;
  onNoteRef: React.MutableRefObject<(() => void) | null>;
  emotion?: string;
  constellation?: boolean;
  instrumentColor?: string;
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

// Instrument-based particle colors
function getInstrumentColor(instrument?: string, baseColor?: string): string {
  const base = baseColor || "#F59E0B";
  switch (instrument) {
    case "piano": return base; // warm gold
    case "strings": return hueShift(base, -15); // rich amber/copper
    case "ambient": return "#38BDF8"; // cool blue/teal
    case "jazz": return "#A78BFA"; // smoky purple
    case "cinematic": return "#E2E8F0"; // white/silver
    default: return base;
  }
}

// Emotion-specific particle behavior
function getEmotionBehavior(emotion?: string) {
  switch (emotion) {
    case "joy":
    case "triumph":
      return { shape: "star" as const, count: 4, speed: 2.5, spread: 3.5, maxLife: 50, burstOnSpawn: true };
    case "grief":
    case "longing":
      return { shape: "drop" as const, count: 1, speed: 0.6, spread: 0.4, maxLife: 120, burstOnSpawn: false };
    case "serenity":
    case "peace":
      return { shape: "circle" as const, count: 2, speed: 0.4, spread: 0.8, maxLife: 100, burstOnSpawn: false };
    case "power":
      return { shape: "diamond" as const, count: 5, speed: 3, spread: 4, maxLife: 35, burstOnSpawn: true };
    case "love":
      return { shape: "heart" as const, count: 2, speed: 1, spread: 1.5, maxLife: 80, burstOnSpawn: false };
    case "bittersweet":
      return { shape: "circle" as const, count: 2, speed: 1, spread: 1.5, maxLife: 70, burstOnSpawn: false };
    case "wonder":
      return { shape: "star" as const, count: 3, speed: 1.5, spread: 2, maxLife: 60, burstOnSpawn: false };
    case "nostalgia":
      return { shape: "circle" as const, count: 2, speed: 0.8, spread: 1, maxLife: 90, burstOnSpawn: false };
    case "hope":
      return { shape: "star" as const, count: 3, speed: 1.8, spread: 2, maxLife: 55, burstOnSpawn: false };
    default:
      return { shape: "circle" as const, count: 2, speed: 1.2, spread: 1.5, maxLife: 70, burstOnSpawn: false };
  }
}

const MAX_PARTICLES = 250;
const CONSTELLATION_DISTANCE = 80;

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const method = i === 0 ? "moveTo" : "lineTo";
    ctx[method](Math.cos(angle) * size, Math.sin(angle) * size);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.6, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawDrop(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  ctx.arc(x, y + size * 0.3, size * 0.7, 0, Math.PI * 2);
  ctx.moveTo(x, y - size);
  ctx.quadraticCurveTo(x + size * 0.7, y, x, y + size * 0.3);
  ctx.quadraticCurveTo(x - size * 0.7, y, x, y - size);
  ctx.fill();
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  const s = size * 0.6;
  ctx.moveTo(0, s * 0.4);
  ctx.bezierCurveTo(-s, -s * 0.5, -s * 0.5, -s * 1.2, 0, -s * 0.4);
  ctx.bezierCurveTo(s * 0.5, -s * 1.2, s, -s * 0.5, 0, s * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export default function ParticleCanvas({
  isPlaying,
  emotionColor,
  onNoteRef,
  emotion,
  constellation = true,
  instrumentColor,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const isPlayingRef = useRef(isPlaying);
  const colorRef = useRef(emotionColor);
  const emotionRef = useRef(emotion);
  const instrumentColorRef = useRef(instrumentColor);

  isPlayingRef.current = isPlaying;
  colorRef.current = emotionColor;
  emotionRef.current = emotion;
  instrumentColorRef.current = instrumentColor;

  const spawnParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const behavior = getEmotionBehavior(emotionRef.current);
    const count = behavior.count;
    const baseColor = instrumentColorRef.current
      ? getInstrumentColor(instrumentColorRef.current, colorRef.current)
      : colorRef.current;

    for (let i = 0; i < count; i++) {
      if (particlesRef.current.length >= MAX_PARTICLES) break;
      const shift = (Math.random() - 0.5) * 40;
      const maxLife = behavior.maxLife + Math.random() * 30;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      const p: Particle = {
        x: w * (0.15 + Math.random() * 0.7),
        y: h * 0.85,
        size: 2 + Math.random() * 4,
        color: hueShift(baseColor, shift),
        opacity: 0.7 + Math.random() * 0.3,
        velocityX: (Math.random() - 0.5) * behavior.spread,
        velocityY: -(0.3 + Math.random() * behavior.speed),
        life: 0,
        maxLife,
        shape: behavior.shape,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
      };

      particlesRef.current.push(p);

      // Burst: spawn extra tiny particles nearby
      if (behavior.burstOnSpawn && particlesRef.current.length < MAX_PARTICLES - 3) {
        for (let j = 0; j < 3; j++) {
          particlesRef.current.push({
            ...p,
            x: p.x + (Math.random() - 0.5) * 10,
            y: p.y + (Math.random() - 0.5) * 5,
            size: 1 + Math.random() * 1.5,
            velocityX: (Math.random() - 0.5) * behavior.spread * 1.5,
            velocityY: -(0.5 + Math.random() * behavior.speed * 1.2),
            maxLife: maxLife * 0.5,
            opacity: 0.5 + Math.random() * 0.3,
            color: hueShift(baseColor, shift + (Math.random() - 0.5) * 20),
          });
        }
      }
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
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    });
    resizeObserver.observe(canvas);

    const animate = () => {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.velocityX += (Math.random() - 0.5) * 0.06;
        p.rotation += p.rotationSpeed;

        // Grief/longing: particles slow down and start falling
        if (emotionRef.current === "grief" || emotionRef.current === "longing") {
          if (p.life > p.maxLife * 0.4) {
            p.velocityY += 0.02; // gravity effect
          }
        }

        // Love: spiral motion for paired particles
        if (p.shape === "heart") {
          p.velocityX += Math.sin(p.life * 0.08) * 0.15;
        }

        p.opacity = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const currentSize = p.size * (1 - p.life / p.maxLife * 0.3);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        // Draw particle based on shape
        switch (p.shape) {
          case "star":
            drawStar(ctx, p.x, p.y, currentSize, p.rotation);
            break;
          case "diamond":
            drawDiamond(ctx, p.x, p.y, currentSize, p.rotation);
            break;
          case "drop":
            drawDrop(ctx, p.x, p.y, currentSize);
            break;
          case "heart":
            drawHeart(ctx, p.x, p.y, currentSize * 1.5, p.rotation);
            break;
          default:
            ctx.beginPath();
            ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
            ctx.fill();
            break;
        }

        // Soft glow
        ctx.globalAlpha = p.opacity * 0.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Constellation mode: draw lines between nearby particles
      if (constellation && particles.length > 1 && particles.length < 150) {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const a = particles[i];
            const b = particles[j];
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONSTELLATION_DISTANCE) {
              const lineOpacity = (1 - dist / CONSTELLATION_DISTANCE) * Math.min(a.opacity, b.opacity) * 0.3;
              ctx.beginPath();
              ctx.strokeStyle = `${a.color}`;
              ctx.globalAlpha = lineOpacity;
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }
        ctx.globalAlpha = 1;
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [constellation]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}
