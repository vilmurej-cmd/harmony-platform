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
        viewBox={`0 0 ${totalWidth + padding * 2} ${keyHeight + padding * 2}`}
        className="w-full max-w-2xl mx-auto"
        role="img"
        aria-label="Piano visualization"
      >
        <defs>
          <filter id="piano-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor={emotionColor} floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* White keys */}
        {whiteNotes.map((note, i) => {
          const isActive = activeNotes.has(note);
          const x = padding + i * keyWidth;
          const y = padding;

          return (
            <g key={note}>
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
                  transition: "fill 100ms ease, y 100ms ease",
                }}
              />
              {/* Note label */}
              <text
                x={x + keyWidth / 2}
                y={y + keyHeight - 10}
                textAnchor="middle"
                fontSize="8"
                fill={isActive ? "#FFF7ED" : "#8B7E6A"}
                opacity={0.6}
                style={{ transition: "fill 100ms ease" }}
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
            <rect
              key={note}
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
                transition: "fill 100ms ease, y 100ms ease",
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
