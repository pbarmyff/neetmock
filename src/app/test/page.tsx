"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTest } from "@/context/TestContext";
import questionsData from "@/data/questions.json";
import QuestionPalette from "@/components/QuestionPalette";

export default function TestPage() {
  const router = useRouter();
  const { state, setAnswer, markQuestion, setCurrentQuestion, submitTest, updateTimeRemaining, incrementTimeSpent } = useTest();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Timer logic
  useEffect(() => {
    if (state.testStatus !== 'in_progress') return;

    const timerInterval = setInterval(() => {
      if (state.timeRemaining > 0) {
        updateTimeRemaining(state.timeRemaining - 1);
        if (state.currentQuestionId) {
          incrementTimeSpent(state.currentQuestionId);
        }
      } else {
        clearInterval(timerInterval);
        submitTest();
        router.push("/scorecard");
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [state.testStatus, state.timeRemaining, state.currentQuestionId, updateTimeRemaining, incrementTimeSpent, submitTest, router]);

  // Redirect if test hasn't started or is already submitted
  useEffect(() => {
    if (state.testStatus === 'not_started') {
      router.push("/");
    } else if (state.testStatus === 'submitted') {
      router.push("/scorecard");
    }
  }, [state.testStatus, router]);

  // Load current answer when question changes
  useEffect(() => {
    if (state.currentQuestionId) {
      // Use setTimeout to avoid synchronous setState inside useEffect
      const timer = setTimeout(() => {
        setSelectedOption(state.answers[state.currentQuestionId!] || null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [state.currentQuestionId, state.answers]);

  if (!state.currentQuestionId || state.testStatus !== 'in_progress') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const currentIndex = state.questionIds.indexOf(state.currentQuestionId);
  const currentQuestion = questionsData.find(q => q.id === state.currentQuestionId);

  if (!currentQuestion) return <div>Question not found.</div>;

  const handleNext = () => {
    if (currentIndex < state.questionIds.length - 1) {
      setCurrentQuestion(state.questionIds[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentQuestion(state.questionIds[currentIndex - 1]);
    }
  };

  const handleSaveAndNext = () => {
    setAnswer(state.currentQuestionId!, selectedOption);
    handleNext();
  };

  const handleClearResponse = () => {
    setSelectedOption(null);
    setAnswer(state.currentQuestionId!, null);
  };

  const handleMarkForReviewAndNext = () => {
    setAnswer(state.currentQuestionId!, selectedOption);
    markQuestion(state.currentQuestionId!);
    handleNext();
  };

  const handleSubmit = () => {
    if (confirm("Are you sure you want to submit the test?")) {
      submitTest();
      router.push("/scorecard");
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-ui-bg text-ui-fg overflow-hidden relative">
      {/* Decorative scanning line */}
      <div className="absolute w-full h-[2px] bg-ui-accent/20 z-50 pointer-events-none top-0 animate-[scan_8s_linear_infinite] shadow-[0_0_10px_var(--ui-accent)]"></div>

      {/* Header */}
      <header className="bg-ui-fg text-ui-bg p-4 flex justify-between items-center border-b-4 border-ui-border relative z-10">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold leading-none tracking-tight">TERMINAL_SEC</h1>
          <span className="text-[10px] text-ui-fg-muted uppercase tracking-widest mt-1">Mock Examination Protocol</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-ui-accent mb-1">Time Remaining</span>
            <div className="text-3xl font-mono font-bold bg-ui-bg text-ui-fg px-4 py-1 border-2 border-ui-accent animate-pulse-slow">
              {formatTime(state.timeRemaining)}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="bg-ui-accent hover:bg-ui-accent-hover text-white px-6 py-4 font-bold transition-colors brutal-btn border-ui-bg border-4"
          >
            TERMINATE & SUBMIT
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* Left Side: Question Display */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-ui-surface border-r-4 border-ui-border">
          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">

            {/* Question Header */}
            <div className="flex justify-between items-end mb-6 border-b-4 border-ui-border pb-4">
              <div className="flex items-center gap-4">
                <div className="bg-ui-fg text-ui-bg font-bold text-4xl p-4 brutal-border">
                  {(currentIndex + 1).toString().padStart(3, '0')}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-ui-fg-muted mb-1">Data Entry / {state.questionIds.length.toString().padStart(3, '0')}</span>
                  <span className="text-sm bg-ui-border text-ui-bg px-2 py-1 font-bold uppercase inline-block self-start">{currentQuestion.subject}</span>
                </div>
              </div>
              <div className="text-xs font-bold bg-ui-accent text-white px-2 py-1 brutal-border">
                {currentQuestion.difficulty}
              </div>
            </div>

            {/* Question Text */}
            <div className="text-2xl font-bold mb-10 leading-tight">
              {currentQuestion.question}
            </div>

            {/* Options */}
            <div className="flex flex-col gap-4 mb-10">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <label
                  key={key}
                  className={`flex items-start p-4 brutal-border cursor-pointer transition-all ${
                    selectedOption === key
                      ? 'bg-ui-fg text-ui-bg translate-x-[3px] translate-y-[3px] !shadow-[3px_3px_0px_0px_var(--ui-border)]'
                      : 'bg-ui-bg hover:bg-gray-200'
                  }`}
                >
                  <div className="relative flex items-center mt-1">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={key}
                      checked={selectedOption === key}
                      onChange={() => setSelectedOption(key)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 border-2 flex items-center justify-center shrink-0 ${
                      selectedOption === key ? 'border-ui-bg' : 'border-ui-fg bg-white'
                    }`}>
                      {selectedOption === key && <span className="block w-3 h-3 bg-ui-accent"></span>}
                    </div>
                  </div>
                  <div className="ml-4 flex">
                    <span className={`font-bold mr-4 ${selectedOption === key ? 'text-ui-accent' : 'text-ui-fg-muted'}`}>[{key}]</span>
                    <span className="text-lg">{value as string}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center bg-ui-bg p-4 brutal-border mt-auto">
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAndNext}
                  className="bg-[#00CC44] hover:bg-[#00AA33] text-white px-6 py-3 brutal-btn font-bold"
                >
                  Save + FWD
                </button>
                <button
                  onClick={handleMarkForReviewAndNext}
                  className="bg-[#0033FF] hover:bg-[#0022AA] text-white px-6 py-3 brutal-btn font-bold"
                >
                  Mark + FWD
                </button>
                <button
                  onClick={handleClearResponse}
                  className="bg-ui-surface hover:bg-gray-300 text-ui-fg px-6 py-3 brutal-btn font-bold"
                >
                  Purge Data
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="bg-ui-surface hover:bg-gray-300 text-ui-fg px-6 py-3 brutal-btn font-bold disabled:opacity-30"
                >
                  ← REV
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === state.questionIds.length - 1}
                  className="bg-ui-fg hover:bg-black text-ui-bg px-6 py-3 brutal-btn font-bold disabled:opacity-30"
                >
                  FWD →
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Question Palette */}
        <div className="w-96 bg-ui-bg flex flex-col">
          <div className="p-4 border-b-4 border-ui-border bg-ui-surface">
            <h2 className="font-bold text-xl uppercase tracking-widest flex items-center justify-between">
              <span>Nav_Matrix</span>
              <span className="w-3 h-3 bg-ui-accent rounded-full animate-pulse"></span>
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-hidden">
            <QuestionPalette />
          </div>
        </div>

      </div>

      {/* Add keyframes for scanning line via inline style since it's a one-off effect */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: -10px; }
          100% { top: 100vh; }
        }
        .animate-[scan_8s_linear_infinite] {
          animation: scan 8s linear infinite;
        }
      `}} />
    </div>
  );
}
