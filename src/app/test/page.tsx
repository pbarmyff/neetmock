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
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">NEET Mock Test</h1>
        <div className="flex items-center gap-4">
          <div className="text-lg font-mono font-semibold bg-blue-700 px-3 py-1 rounded">
            Time Left: {formatTime(state.timeRemaining)}
          </div>
          <button
            onClick={handleSubmit}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-bold transition-colors"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Side: Question Display */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border mb-6 flex-1">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <span className="font-bold text-lg">Question {currentIndex + 1} of {state.questionIds.length}</span>
              <span className="text-sm bg-gray-200 px-2 py-1 rounded">{currentQuestion.subject}</span>
            </div>

            <div className="text-lg mb-8">{currentQuestion.question}</div>

            <div className="flex flex-col gap-3">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <label
                  key={key}
                  className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${
                    selectedOption === key ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={key}
                    checked={selectedOption === key}
                    onChange={() => setSelectedOption(key)}
                    className="mr-3 h-5 w-5 text-blue-600"
                  />
                  <span className="font-semibold mr-2">{key}.</span>
                  <span>{value as string}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex gap-2">
              <button
                onClick={handleSaveAndNext}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
              >
                Save & Next
              </button>
              <button
                onClick={handleClearResponse}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium border"
              >
                Clear Response
              </button>
              <button
                onClick={handleMarkForReviewAndNext}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
              >
                Mark for Review & Next
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;&lt; Back
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === state.questionIds.length - 1}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next &gt;&gt;
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Question Palette */}
        <div className="w-80 bg-white border-l p-4 flex flex-col">
          <h2 className="font-bold mb-4">Question Palette</h2>
          <QuestionPalette />
        </div>

      </div>
    </div>
  );
}
