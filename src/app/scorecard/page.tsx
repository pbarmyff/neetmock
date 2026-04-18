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
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Performance Scorecard</h1>
          <button
            onClick={() => { resetTest(); router.push("/"); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Take Another Test
          </button>
        </div>

        {/* Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Score</div>
            <div className="text-4xl font-bold text-blue-600">{score} <span className="text-xl text-gray-400">/ {maxScore}</span></div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
            <div className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Predicted Rank</div>
            <div className="text-4xl font-bold text-purple-600">{predictedRank.toLocaleString()}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-around items-center col-span-1 md:col-span-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{correctCount}</div>
              <div className="text-xs text-gray-500 uppercase">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{incorrectCount}</div>
              <div className="text-xs text-gray-500 uppercase">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-500">{unattemptedCount}</div>
              <div className="text-xs text-gray-500 uppercase">Unattempted</div>
            </div>
          </div>
        </div>

        {/* Analytics Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border overflow-hidden">
            <h2 className="text-xl font-bold mb-4">Topic-wise Accuracy</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded p-2 overflow-hidden">
              <AccuracyHeatmap />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border overflow-hidden">
            <h2 className="text-xl font-bold mb-4">Time per Question (seconds)</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded p-2">
              <TimeBarChart />
            </div>
          </div>
        </div>

        {/* Solutions Review Mode Toggle */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowSolutions(!showSolutions)}
            className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-md"
          >
            {showSolutions ? "Hide Solutions" : "Review Solutions"}
          </button>
        </div>

        {/* Solutions Review Mode */}
        {showSolutions && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Solutions & Explanations</h2>
            {state.questionIds.map((id, index) => {
              const q = questionsData.find(q => q.id === id);
              if (!q) return null;

              const userAnswer = state.answers[id];
              const isCorrect = userAnswer === q.correct;
              const isUnattempted = !userAnswer;

              return (
                <div key={id} className={`bg-white p-6 rounded-xl shadow-sm border-l-4 ${isCorrect ? 'border-green-500' : isUnattempted ? 'border-gray-400' : 'border-red-500'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-bold text-lg">Question {index + 1}</span>
                    <div className="flex gap-2">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded border">{q.subject}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded border">{q.topic}</span>
                    </div>
                  </div>

                  <p className="text-lg mb-6">{q.question}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Options</h4>
                      <div className="space-y-2">
                        {Object.entries(q.options).map(([key, value]) => (
                          <div
                            key={key}
                            className={`p-2 rounded border ${
                              key === q.correct ? 'bg-green-50 border-green-300' :
                              key === userAnswer && !isCorrect ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <span className="font-bold mr-2">{key}.</span> {value as string}
                            {key === q.correct && <span className="ml-2 text-green-600 text-sm font-bold">✓ Correct</span>}
                            {key === userAnswer && !isCorrect && <span className="ml-2 text-red-600 text-sm font-bold">✗ Your Answer</span>}
                            {key === userAnswer && isCorrect && <span className="ml-2 text-green-600 text-sm font-bold">(Your Answer)</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded border border-blue-100">
                      <h4 className="text-sm font-semibold text-blue-800 uppercase mb-2">Explanation</h4>
                      <p className="text-blue-900">{q.explanation}</p>

                      <div className="mt-4 pt-4 border-t border-blue-200 grid grid-cols-2 gap-2 text-sm">
                        <div><span className="font-semibold">Difficulty:</span> {q.difficulty}</div>
                        <div><span className="font-semibold">Year:</span> {q.year}</div>
                        <div><span className="font-semibold">Time Spent:</span> {state.timeSpent[id] || 0}s</div>
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
