"use client";

const whiteNotes = [
  "C3", "D3", "E3", "F3", "G3", "A3", "B3",
  "C4", "D4", "E4", "F4", "G4", "A4", "B4",
];

const blackNotes: { note: string; position: number }[] = [
  { note: "C#3", position: 0 },
  { note: "D#3", position: 1 },
  { note: "F#3", position: 3 },
  { note: "G#3", position: 4 },
  { note: "A#3", position: 5 },
  { note: "C#4", position: 7 },
  { note: "D#4", position: 8 },
  { note: "F#4", position: 10 },
  { note: "G#4", position: 11 },
  { note: "A#4", position: 12 },
];

interface PianoVisualizationProps {
  activeNotes: Set<string>;
  emotionColor?: string;
}

export default function PianoVisualization({
  activeNotes,
  emotionColor = "#F59E0B",
}: PianoVisualizationProps) {
  const keyWidth = 40;
  const keyHeight = 140;
  const blackKeyWidth = 24;
  const blackKeyHeight = 88;
  const totalWidth = whiteNotes.length * keyWidth;
  const padding = 4;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${totalWidth + padding * 2} ${keyHeight + padding * 2 + 20}`}
        className="w-full max-w-2xl mx-auto"
        role="img"
        aria-label="Piano visualization"
      >
        <defs>
          {/* Enhanced glow filter with golden bloom */}
          <filter id="piano-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor={emotionColor} floodOpacity="0.7" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Upward light beam for active keys */}
          <linearGradient id="key-beam" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={emotionColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={emotionColor} stopOpacity="0" />
          </linearGradient>

          {/* Reflection gradient for white keys */}
          <linearGradient id="white-key-sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="90%" stopColor="#000000" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* White keys */}
        {whiteNotes.map((note, i) => {
          const isActive = activeNotes.has(note);
          const x = padding + i * keyWidth;
          const y = padding;

          return (
            <g key={note}>
              {/* Light beam shooting up from active key */}
              {isActive && (
                <rect
                  x={x + keyWidth * 0.2}
                  y={y - 15}
                  width={keyWidth * 0.6}
                  height={20}
                  fill="url(#key-beam)"
                  rx={2}
                >
                  <animate
                    attributeName="opacity"
                    values="0;0.8;0.5"
                    dur="0.3s"
                    fill="freeze"
                  />
                </rect>
              )}

              {/* Key body */}
              <rect
                x={x + 1}
                y={isActive ? y + 2 : y}
                width={keyWidth - 2}
                height={keyHeight}
                rx={4}
                fill={isActive ? emotionColor : "#F5F0E8"}
                stroke={isActive ? emotionColor : "#D4C5A9"}
                strokeWidth={0.5}
                filter={isActive ? "url(#piano-glow)" : undefined}
                style={{
                  transition: "fill 80ms ease, y 80ms ease",
                }}
              />

              {/* Sheen overlay on inactive keys */}
              {!isActive && (
                <rect
                  x={x + 1}
                  y={y}
                  width={keyWidth - 2}
                  height={keyHeight}
                  rx={4}
                  fill="url(#white-key-sheen)"
                  style={{ pointerEvents: "none" }}
                />
              )}

              {/* Note label */}
              <text
                x={x + keyWidth / 2}
                y={y + keyHeight - 10}
                textAnchor="middle"
                fontSize="8"
                fill={isActive ? "#FFF7ED" : "#8B7E6A"}
                opacity={isActive ? 0.9 : 0.4}
                style={{ transition: "fill 80ms ease, opacity 80ms ease" }}
              >
                {note}
              </text>
            </g>
          );
        })}

        {/* Black keys */}
        {blackNotes.map(({ note, position }) => {
          const isActive = activeNotes.has(note);
          const x = padding + (position + 1) * keyWidth - blackKeyWidth / 2;
          const y = padding;

          return (
            <g key={note}>
              {/* Light beam for active black key */}
              {isActive && (
                <rect
                  x={x + blackKeyWidth * 0.15}
                  y={y - 12}
                  width={blackKeyWidth * 0.7}
                  height={16}
                  fill="url(#key-beam)"
                  rx={2}
                >
                  <animate
                    attributeName="opacity"
                    values="0;0.6;0.4"
                    dur="0.3s"
                    fill="freeze"
                  />
                </rect>
              )}

              <rect
                x={x}
                y={isActive ? y + 2 : y}
                width={blackKeyWidth}
                height={blackKeyHeight}
                rx={3}
                fill={isActive ? emotionColor : "#1A1533"}
                stroke={isActive ? emotionColor : "#0F0B1E"}
                strokeWidth={0.5}
                filter={isActive ? "url(#piano-glow)" : undefined}
                style={{
                  transition: "fill 80ms ease, y 80ms ease",
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
