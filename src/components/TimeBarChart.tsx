"use client";

import { useTest } from "@/context/TestContext";

export default function TimeBarChart() {
  const { state } = useTest();

  const timeData = state.questionIds.map((id, index) => ({
    questionIndex: index + 1,
    time: state.timeSpent[id] || 0
  }));

  if (timeData.length === 0) return <div>No data available</div>;

  const maxTime = Math.max(...timeData.map(d => d.time), 60); // Minimum scale of 60s

  const chartWidth = Math.max(timeData.length * 20, 800);
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const barWidth = Math.max((innerWidth / timeData.length) - 2, 2);

  return (
    <div className="w-full h-full overflow-x-auto overflow-y-hidden">
      <svg width={chartWidth} height={chartHeight} className="block">
        <g transform={`translate(${padding.left}, ${padding.top})`}>

          {/* Y-Axis scale lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(tick => {
            const y = innerHeight - (tick * innerHeight);
            const val = Math.round(tick * maxTime);
            return (
              <g key={tick}>
                <line x1={0} y1={y} x2={innerWidth} y2={y} stroke="var(--ui-border)" strokeDasharray="2, 4" opacity="0.3" />
                <text x={-5} y={y + 4} textAnchor="end" fontSize="10" fontWeight="bold" fontFamily="var(--font-mono)" fill="var(--ui-fg-muted)">{val}s</text>
              </g>
            );
          })}

          {/* Bars */}
          {timeData.map((data, index) => {
            const x = index * (innerWidth / timeData.length);
            const height = (data.time / maxTime) * innerHeight;
            const y = innerHeight - height;

            // Color based on time spent (e.g. >120s is red, <60s is green)
            let fill = "var(--state-marked)"; // blue
            if (data.time > 120) fill = "var(--state-not-answered)"; // red/orange
            else if (data.time < 60) fill = "var(--state-answered)"; // green

            return (
              <g key={data.questionIndex}>
                <title>Q{data.questionIndex}: {data.time}s</title>
                <rect
                  x={x + 1}
                  y={y}
                  width={barWidth}
                  height={height}
                  fill={fill}
                  stroke="var(--ui-border)"
                  strokeWidth="1"
                  className="transition-all hover:brightness-110 cursor-pointer"
                />
                {/* X-axis labels (only show every 5th or 10th to avoid crowding) */}
                {(data.questionIndex % Math.ceil(timeData.length / 20) === 0 || data.questionIndex === 1 || data.questionIndex === timeData.length) && (
                  <text
                    x={x + barWidth / 2}
                    y={innerHeight + 15}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="var(--font-mono)"
                    fill="var(--ui-fg)"
                  >
                    {data.questionIndex}
                  </text>
                )}
              </g>
            );
          })}

          {/* Axes */}
          <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="var(--ui-border)" strokeWidth="2" />
          <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="var(--ui-border)" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
