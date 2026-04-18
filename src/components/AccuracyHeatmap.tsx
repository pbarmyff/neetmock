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
    if (accuracy >= 80) return "#22c55e"; // green-500
    if (accuracy >= 50) return "#eab308"; // yellow-500
    if (accuracy >= 20) return "#f97316"; // orange-500
    return "#ef4444"; // red-500
  };

  const boxSize = 60;
  const gap = 10;
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
            <g key={data.topic}>
              <title>{`${data.topic}: ${data.accuracy.toFixed(1)}% (${data.correct}/${data.total})`}</title>
              <rect
                x={x}
                y={y}
                width={boxSize}
                height={boxSize}
                fill={getColor(data.accuracy)}
                rx="4"
                className="transition-all hover:opacity-80 cursor-pointer"
              />
              <text
                x={x + boxSize / 2}
                y={y + boxSize / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
                pointerEvents="none"
              >
                {Math.round(data.accuracy)}%
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform={`translate(0, ${height - 20})`}>
          <rect x="0" y="0" width="15" height="15" fill="#22c55e" rx="2" />
          <text x="20" y="12" fontSize="10" fill="#666">&ge;80%</text>

          <rect x="60" y="0" width="15" height="15" fill="#eab308" rx="2" />
          <text x="80" y="12" fontSize="10" fill="#666">50-79%</text>

          <rect x="130" y="0" width="15" height="15" fill="#f97316" rx="2" />
          <text x="150" y="12" fontSize="10" fill="#666">20-49%</text>

          <rect x="200" y="0" width="15" height="15" fill="#ef4444" rx="2" />
          <text x="220" y="12" fontSize="10" fill="#666">&lt;20%</text>
        </g>
      </svg>
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-sm p-4 text-center rounded hidden md:flex">
        Hover over squares for topic details
      </div>
    </div>
  );
}
