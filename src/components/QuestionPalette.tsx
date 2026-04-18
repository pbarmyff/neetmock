"use client";

import { useState } from "react";
import { useTest, Subject, QuestionStatus } from "@/context/TestContext";
import questionsData from "@/data/questions.json";

export default function QuestionPalette() {
  const { state, setCurrentQuestion } = useTest();
  const [activeSubjectTab, setActiveSubjectTab] = useState<Subject | "All">("All");

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'answered': return 'bg-[var(--state-answered)] text-white border-ui-border';
      case 'marked': return 'bg-[var(--state-marked)] text-white border-ui-border';
      case 'not_answered': return 'bg-[var(--state-not-answered)] text-white border-ui-border';
      case 'not_visited': return 'bg-[var(--state-unvisited)] text-ui-fg border-ui-border';
      default: return 'bg-[var(--state-unvisited)] text-ui-fg border-ui-border';
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
      <div className="grid grid-cols-2 gap-2 text-xs mb-6 p-3 brutal-border bg-ui-surface font-bold">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--state-unvisited)] border-2 border-ui-border shadow-[1px_1px_0px_0px_var(--ui-border)]"></div>
          <span className="uppercase text-[10px]">Unvisited [{statusCounts.not_visited}]</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--state-not-answered)] border-2 border-ui-border shadow-[1px_1px_0px_0px_var(--ui-border)]"></div>
          <span className="uppercase text-[10px]">Unanswered [{statusCounts.not_answered}]</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--state-answered)] border-2 border-ui-border shadow-[1px_1px_0px_0px_var(--ui-border)]"></div>
          <span className="uppercase text-[10px]">Answered [{statusCounts.answered}]</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[var(--state-marked)] border-2 border-ui-border shadow-[1px_1px_0px_0px_var(--ui-border)]"></div>
          <span className="uppercase text-[10px]">Marked [{statusCounts.marked}]</span>
        </div>
      </div>

      {/* Subject Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveSubjectTab("All")}
          className={`px-3 py-1 text-xs font-bold uppercase border-2 border-ui-border transition-all ${activeSubjectTab === "All" ? 'bg-ui-fg text-ui-bg shadow-[2px_2px_0px_0px_var(--ui-border)] translate-x-[-2px] translate-y-[-2px]' : 'bg-ui-surface text-ui-fg hover:bg-gray-200 shadow-none'}`}
        >
          All_Mods
        </button>
        {availableSubjects.map(subject => (
          <button
            key={subject}
            onClick={() => setActiveSubjectTab(subject)}
            className={`px-3 py-1 text-xs font-bold uppercase border-2 border-ui-border transition-all ${activeSubjectTab === subject ? 'bg-ui-fg text-ui-bg shadow-[2px_2px_0px_0px_var(--ui-border)] translate-x-[-2px] translate-y-[-2px]' : 'bg-ui-surface text-ui-fg hover:bg-gray-200 shadow-none'}`}
          >
            {subject.slice(0, 3)}_MOD
          </button>
        ))}
      </div>

      {/* Palette Grid */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-4 gap-3 pb-4">
          {filteredQuestions.map((q) => {
            const globalIndex = state.questionIds.indexOf(q.id);
            const isCurrent = state.currentQuestionId === q.id;
            const status = state.status[q.id] || 'not_visited';

            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestion(q.id)}
                className={`
                  h-12 border-2 font-bold flex items-center justify-center transition-all
                  ${getStatusColor(status)}
                  ${isCurrent ? 'ring-4 ring-ui-fg ring-offset-2 ring-offset-ui-bg z-10 scale-110' : 'hover:scale-105 shadow-[2px_2px_0px_0px_var(--ui-border)]'}
                `}
              >
                {(globalIndex + 1).toString().padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: var(--ui-surface); border-left: 2px solid var(--ui-border); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--ui-fg); }
      `}} />
    </div>
  );
}
