"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTest } from "@/context/TestContext";
import questionsData from "@/data/questions.json";
import AccuracyHeatmap from "@/components/AccuracyHeatmap";
import TimeBarChart from "@/components/TimeBarChart";

export default function ScorecardPage() {
  const router = useRouter();
  const { state, resetTest } = useTest();
  const [showSolutions, setShowSolutions] = useState(false);

  // Redirect if test hasn't started or is still in progress
  useEffect(() => {
    if (state.testStatus !== 'submitted') {
      router.push("/");
    }
  }, [state.testStatus, router]);

  // Calculate score and rank
  const { score, maxScore, correctCount, incorrectCount, unattemptedCount, predictedRank } = useMemo(() => {
    let s = 0;
    let c = 0;
    let i = 0;
    let u = 0;

    state.questionIds.forEach(id => {
      const q = questionsData.find(q => q.id === id);
      if (!q) return;

      const userAnswer = state.answers[id];
      if (!userAnswer) {
        u++;
      } else if (userAnswer === q.correct) {
        s += 4;
        c++;
      } else {
        s -= 1;
        i++;
      }
    });

    const mScore = state.questionIds.length * 4;

    // Hardcoded rank predictor based on score percentage
    const scorePercentage = mScore > 0 ? (s / mScore) * 100 : 0;
    let rank = 1000000; // Default worst rank

    // Replace Math.random inside useMemo with a stable pseudo-random value based on score
    // to appease react-hooks/purity
    const pseudoRandom = ((s * 13) % 100) / 100;

    if (scorePercentage >= 95) rank = Math.floor(pseudoRandom * 500) + 1; // 1-500
    else if (scorePercentage >= 90) rank = Math.floor(pseudoRandom * 4500) + 500; // 500-5000
    else if (scorePercentage >= 80) rank = Math.floor(pseudoRandom * 15000) + 5000; // 5k-20k
    else if (scorePercentage >= 70) rank = Math.floor(pseudoRandom * 30000) + 20000; // 20k-50k
    else if (scorePercentage >= 60) rank = Math.floor(pseudoRandom * 50000) + 50000; // 50k-100k
    else if (scorePercentage >= 50) rank = Math.floor(pseudoRandom * 100000) + 100000; // 100k-200k
    else if (scorePercentage >= 40) rank = Math.floor(pseudoRandom * 300000) + 200000; // 200k-500k
    else rank = Math.floor(pseudoRandom * 500000) + 500000; // > 500k

    // Just an approximation for UI feeling realistic
    return { score: s, maxScore: mScore, correctCount: c, incorrectCount: i, unattemptedCount: u, predictedRank: rank };
  }, [state.answers, state.questionIds]);

  if (state.testStatus !== 'submitted') return null;

  return (
    <div className="min-h-screen p-6 md:p-12 relative overflow-hidden bg-ui-bg text-ui-fg">
      {/* Decorative Grid Lines */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="w-full h-full border-4 border-ui-border m-4 max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b-4 border-ui-border pb-6">
          <div>
            <div className="text-ui-accent font-bold tracking-widest text-xs mb-2">EVALUATION_REPORT</div>
            <h1 className="text-5xl md:text-6xl font-bold leading-none tracking-tighter uppercase">Scorecard</h1>
          </div>
          <button
            onClick={() => { resetTest(); router.push("/"); }}
            className="mt-6 md:mt-0 bg-ui-fg hover:bg-black text-ui-bg brutal-btn px-6 py-3 text-lg"
          >
            ← REBOOT_SYS
          </button>
        </header>

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="brutal-panel p-6 flex flex-col justify-between">
            <div className="font-bold text-xs uppercase tracking-widest border-b-2 border-ui-border pb-2 mb-4">Total Score</div>
            <div className="text-6xl font-bold text-ui-accent tracking-tighter">
              {score} <span className="text-2xl text-ui-fg-muted font-normal">/ {maxScore}</span>
            </div>
          </div>

          <div className="brutal-panel p-6 flex flex-col justify-between">
            <div className="font-bold text-xs uppercase tracking-widest border-b-2 border-ui-border pb-2 mb-4">Predicted Rank</div>
            <div className="text-5xl font-bold text-[#0033FF] tracking-tighter">
              {predictedRank.toLocaleString()}
            </div>
          </div>

          <div className="brutal-panel p-6 col-span-1 md:col-span-2 flex justify-between items-center">
            <div className="w-full grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-[#00CC44] mb-2">{correctCount}</div>
                <div className="text-xs font-bold uppercase tracking-widest bg-ui-fg text-ui-bg px-2 py-1">Correct</div>
              </div>
              <div className="flex flex-col items-center border-l-2 border-r-2 border-ui-border">
                <div className="text-4xl font-bold text-[#FF3B00] mb-2">{incorrectCount}</div>
                <div className="text-xs font-bold uppercase tracking-widest bg-ui-fg text-ui-bg px-2 py-1">Incorrect</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-ui-fg-muted mb-2">{unattemptedCount}</div>
                <div className="text-xs font-bold uppercase tracking-widest bg-ui-fg text-ui-bg px-2 py-1">Skipped</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="brutal-panel flex flex-col overflow-hidden">
            <h2 className="text-lg font-bold uppercase tracking-widest border-b-4 border-ui-border p-4 bg-ui-fg text-ui-bg">Topic Accuracy_Heatmap</h2>
            <div className="h-80 flex items-center justify-center p-4">
              <AccuracyHeatmap />
            </div>
          </div>
          <div className="brutal-panel flex flex-col overflow-hidden">
            <h2 className="text-lg font-bold uppercase tracking-widest border-b-4 border-ui-border p-4 bg-ui-fg text-ui-bg">Time_Delta (SEC)</h2>
            <div className="h-80 flex items-center justify-center p-4">
              <TimeBarChart />
            </div>
          </div>
        </div>

        {/* Solutions Review Mode Toggle */}
        <div className="flex justify-center mb-12 border-t-4 border-b-4 border-ui-border py-8">
          <button
            onClick={() => setShowSolutions(!showSolutions)}
            className="bg-ui-accent hover:bg-ui-accent-hover text-white brutal-btn text-2xl px-12 py-4"
          >
            {showSolutions ? "HIDE_LOGS" : "DUMP_SOLUTIONS_LOG"}
          </button>
        </div>

        {/* Solutions Review Mode */}
        {showSolutions && (
          <div className="space-y-8 pb-24">
            <h2 className="text-4xl font-bold mb-8 uppercase tracking-tighter">Solution_Logs</h2>
            {state.questionIds.map((id, index) => {
              const q = questionsData.find(q => q.id === id);
              if (!q) return null;

              const userAnswer = state.answers[id];
              const isCorrect = userAnswer === q.correct;
              const isUnattempted = !userAnswer;

              const borderColor = isCorrect ? 'border-[#00CC44]' : isUnattempted ? 'border-ui-border' : 'border-[#FF3B00]';

              return (
                <div key={id} className={`brutal-panel p-0 flex flex-col md:flex-row border-l-8 ${borderColor}`}>

                  {/* Left Column: Metadata */}
                  <div className="md:w-48 bg-ui-surface border-b-4 md:border-b-0 md:border-r-4 border-ui-border p-6 flex flex-col justify-between shrink-0">
                    <div>
                      <div className="text-4xl font-bold mb-4">{(index + 1).toString().padStart(3, '0')}</div>
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-ui-fg text-ui-bg px-2 py-1 self-start">{q.subject}</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-ui-surface border-2 border-ui-border px-2 py-1 self-start">{q.topic}</span>
                      </div>
                    </div>
                    <div className="mt-8 pt-4 border-t-2 border-ui-border grid grid-cols-1 gap-2 text-xs font-bold uppercase tracking-wider text-ui-fg-muted">
                      <div className="flex justify-between"><span>LVL:</span> <span className="text-ui-fg">{q.difficulty}</span></div>
                      <div className="flex justify-between"><span>YR:</span> <span className="text-ui-fg">{q.year}</span></div>
                      <div className="flex justify-between"><span>T:</span> <span className="text-ui-fg">{state.timeSpent[id] || 0}s</span></div>
                    </div>
                  </div>

                  {/* Right Column: Content */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col">
                    <p className="text-xl font-bold mb-8 leading-tight">{q.question}</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-auto">
                      {/* Options */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 border-b-2 border-ui-border pb-2">Options_Matrix</h4>
                        <div className="space-y-3">
                          {Object.entries(q.options).map(([key, value]) => {
                            const isThisCorrect = key === q.correct;
                            const isThisSelected = key === userAnswer;

                            let style = 'bg-ui-surface border-2 border-ui-border text-ui-fg';
                            let icon = '';

                            if (isThisCorrect) {
                              style = 'bg-[#00CC44] border-2 border-[#00CC44] text-white font-bold transform -translate-y-1 shadow-[4px_4px_0px_0px_var(--ui-border)]';
                              icon = '✓ TRUE';
                            } else if (isThisSelected && !isCorrect) {
                              style = 'bg-[#FF3B00] border-2 border-[#FF3B00] text-white font-bold transform -translate-y-1 shadow-[4px_4px_0px_0px_var(--ui-border)]';
                              icon = '✗ ERR';
                            }

                            return (
                              <div key={key} className={`p-3 transition-all flex items-start ${style}`}>
                                <span className="font-bold mr-3">[{key}]</span>
                                <span className="flex-1">{value as string}</span>
                                {icon && <span className="ml-2 text-xs font-bold tracking-widest shrink-0 self-center">{icon}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="bg-ui-fg text-ui-bg p-6 relative">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-ui-surface border-b-4 border-l-4 border-ui-border"></div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-ui-accent border-b-2 border-ui-border/30 pb-2">System_Explanation</h4>
                        <p className="text-lg leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
