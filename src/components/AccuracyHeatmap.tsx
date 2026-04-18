"use client";

import { useMemo } from "react";
import { useTest } from "@/context/TestContext";
import questionsData from "@/data/questions.json";

export default function AccuracyHeatmap() {
  const { state } = useTest();

  const topicAccuracy = useMemo(() => {
    const topics: Record<string, { total: number; correct: number }> = {};

    state.questionIds.forEach(id => {
      const q = questionsData.find(q => q.id === id);
      if (!q) return;

      if (!topics[q.topic]) {
        topics[q.topic] = { total: 0, correct: 0 };
      }

      topics[q.topic].total += 1;

      if (state.answers[id] === q.correct) {
        topics[q.topic].correct += 1;
      }
    });

    return Object.entries(topics).map(([topic, stats]) => ({
      topic,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      total: stats.total,
      correct: stats.correct
    })).sort((a, b) => b.accuracy - a.accuracy);
  }, [state.questionIds, state.answers]);

  if (topicAccuracy.length === 0) return <div>No data available</div>;

  const getColor = (accuracy: number) => {
    if (accuracy >= 80) return "var(--state-answered)"; // green
    if (accuracy >= 50) return "#FFCC00"; // high-viz yellow
    if (accuracy >= 20) return "var(--ui-accent)"; // safety orange
    return "#DD0000"; // dark red
  };

  const boxSize = 60;
  const gap = 4; // Tighter, sharper grid
  const cols = Math.floor(400 / (boxSize + gap));
  const rows = Math.ceil(topicAccuracy.length / cols);

  const width = cols * (boxSize + gap);
  const height = rows * (boxSize + gap) + 40; // extra space for legend

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative group">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {topicAccuracy.map((data, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = col * (boxSize + gap);
          const y = row * (boxSize + gap);

          return (
            <g key={data.topic} className="group/cell">
              <title>{`${data.topic}: ${data.accuracy.toFixed(1)}% (${data.correct}/${data.total})`}</title>
              <rect
                x={x}
                y={y}
                width={boxSize}
                height={boxSize}
                fill={getColor(data.accuracy)}
                stroke="var(--ui-border)"
                strokeWidth="2"
                className="transition-all hover:brightness-110 cursor-pointer origin-center"
              />
              {/* Inner tech detail */}
              <rect x={x + 4} y={y + 4} width="4" height="4" fill="rgba(0,0,0,0.2)" pointerEvents="none" />

              <text
                x={x + boxSize / 2}
                y={y + boxSize / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--ui-border)"
                fontSize="14"
                fontWeight="900"
                fontFamily="var(--font-mono)"
                pointerEvents="none"
              >
                {Math.round(data.accuracy)}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(0, ${height - 20})`} fontFamily="var(--font-mono)" fontSize="10" fontWeight="bold" fill="var(--ui-fg-muted)">
          <rect x="0" y="0" width="12" height="12" fill="var(--state-answered)" stroke="var(--ui-border)" strokeWidth="1" />
          <text x="16" y="10">&ge;80</text>

          <rect x="55" y="0" width="12" height="12" fill="#FFCC00" stroke="var(--ui-border)" strokeWidth="1" />
          <text x="71" y="10">50-79</text>

          <rect x="115" y="0" width="12" height="12" fill="var(--ui-accent)" stroke="var(--ui-border)" strokeWidth="1" />
          <text x="131" y="10">20-49</text>

          <rect x="175" y="0" width="12" height="12" fill="#DD0000" stroke="var(--ui-border)" strokeWidth="1" />
          <text x="191" y="10">&lt;20</text>
        </g>
      </svg>
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-ui-bg/80 backdrop-blur-sm text-sm font-bold uppercase tracking-widest p-4 text-center border-4 border-ui-border m-4 text-ui-fg hidden md:flex">
        Hover elements for detailed telemetry
      </div>
    </div>
  );
}
