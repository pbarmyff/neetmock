"use client";

import { useState } from "react";
import { useTest, Subject, QuestionStatus } from "@/context/TestContext";
import questionsData from "@/data/questions.json";

export default function QuestionPalette() {
  const { state, setCurrentQuestion } = useTest();
  const [activeSubjectTab, setActiveSubjectTab] = useState<Subject | "All">("All");

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white border-green-600';
      case 'marked': return 'bg-purple-500 text-white border-purple-600';
      case 'not_answered': return 'bg-red-500 text-white border-red-600';
      case 'not_visited': return 'bg-gray-200 text-gray-700 border-gray-300';
      default: return 'bg-gray-200 text-gray-700 border-gray-300';
    }
  };

  // Group questions by subject based on the filtered list in state
  const questionsList = state.questionIds.map(id => {
    const q = questionsData.find(q => q.id === id);
    return { id, subject: q?.subject as Subject };
  });

  const availableSubjects = Array.from(new Set(questionsList.map(q => q.subject)));

  const filteredQuestions = activeSubjectTab === "All"
    ? questionsList
    : questionsList.filter(q => q.subject === activeSubjectTab);

  const statusCounts = {
    answered: state.questionIds.filter(id => state.status[id] === 'answered').length,
    not_answered: state.questionIds.filter(id => state.status[id] === 'not_answered').length,
    not_visited: state.questionIds.filter(id => state.status[id] === 'not_visited').length,
    marked: state.questionIds.filter(id => state.status[id] === 'marked').length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-4 p-2 bg-gray-50 rounded">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-200 border border-gray-300 rounded-sm"></div>
          <span>Not Visited ({statusCounts.not_visited})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 border border-red-600 rounded-sm"></div>
          <span>Not Answered ({statusCounts.not_answered})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-500 border border-green-600 rounded-sm"></div>
          <span>Answered ({statusCounts.answered})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-purple-500 border border-purple-600 rounded-sm"></div>
          <span>Marked ({statusCounts.marked})</span>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex flex-wrap gap-1 mb-4">
        <button
          onClick={() => setActiveSubjectTab("All")}
          className={`px-2 py-1 text-xs rounded border ${activeSubjectTab === "All" ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
        >
          All
        </button>
        {availableSubjects.map(subject => (
          <button
            key={subject}
            onClick={() => setActiveSubjectTab(subject)}
            className={`px-2 py-1 text-xs rounded border ${activeSubjectTab === subject ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}`}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Palette Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-4 gap-2">
          {filteredQuestions.map((q) => {
            const globalIndex = state.questionIds.indexOf(q.id);
            const isCurrent = state.currentQuestionId === q.id;
            const status = state.status[q.id] || 'not_visited';

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(q.id)}
                className={`
                  w-12 h-10 rounded text-sm font-medium border flex items-center justify-center transition-all
                  ${getStatusColor(status)}
                  ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-1 font-bold shadow-md' : 'opacity-90 hover:opacity-100'}
                `}
              >
                {globalIndex + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
