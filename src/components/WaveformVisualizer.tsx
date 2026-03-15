"use client";

import { useRef, useEffect } from "react";

interface WaveformVisualizerProps {
  analyserBundle: { fft: any; waveform: any } | null;
  isPlaying: boolean;
  emotionColor: string;
  mode?: "waveform" | "spectrum" | "both";
}

export default function WaveformVisualizer({
  analyserBundle,
  isPlaying,
  emotionColor,
  mode = "both",
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isPlayingRef = useRef(isPlaying);
  const colorRef = useRef(emotionColor);

  isPlayingRef.current = isPlaying;
  colorRef.current = emotionColor;

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

      const color = colorRef.current;

      if (analyserBundle && isPlayingRef.current) {
        // Draw spectrum bars
        if (mode === "spectrum" || mode === "both") {
          const fftData = analyserBundle.fft?.getValue();
          if (fftData) {
            const barCount = Math.min(fftData.length, 64);
            const barWidth = w / barCount;

            for (let i = 0; i < barCount; i++) {
              // FFT values are in dB, typically -100 to 0
              const db = fftData[i] as number;
              const normalized = Math.max(0, (db + 100) / 100);
              const barHeight = normalized * h * 0.6;

              const x = i * barWidth;
              const y = h - barHeight;

              // Gradient bar
              const grad = ctx.createLinearGradient(x, y, x, h);
              grad.addColorStop(0, color);
              grad.addColorStop(1, `${color}22`);

              ctx.fillStyle = grad;
              ctx.fillRect(x + 1, y, barWidth - 2, barHeight);

              // Glow on top
              ctx.fillStyle = `${color}88`;
              ctx.fillRect(x + 1, y, barWidth - 2, 2);
            }
          }
        }

        // Draw waveform line
        if (mode === "waveform" || mode === "both") {
          const waveData = analyserBundle.waveform?.getValue();
          if (waveData) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;

            const sliceWidth = w / waveData.length;
            let x = 0;

            for (let i = 0; i < waveData.length; i++) {
              const v = (waveData[i] as number) * 0.5 + 0.5;
              const y = v * h;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
              x += sliceWidth;
            }

            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw a fainter mirrored line
            ctx.beginPath();
            ctx.strokeStyle = `${color}33`;
            ctx.lineWidth = 1;
            x = 0;
            for (let i = 0; i < waveData.length; i++) {
              const v = (waveData[i] as number) * -0.3 + 0.5;
              const y = v * h;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
              x += sliceWidth;
            }
            ctx.stroke();
          }
        }
      } else {
        // Idle state — draw a gentle sine wave
        ctx.beginPath();
        ctx.strokeStyle = `${color}33`;
        ctx.lineWidth = 1;
        const time = Date.now() / 2000;
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x / 30 + time) * 8 + Math.sin(x / 15 + time * 1.3) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [analyserBundle, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-hidden="true"
    />
  );
}
