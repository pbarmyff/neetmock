"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTest, Subject, Difficulty } from "@/context/TestContext";
import questionsData from "@/data/questions.json";

export default function Home() {
  const router = useRouter();
  const { startTest } = useTest();

  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("All");
  const [selectedSubjects, setSelectedSubjects] = useState<Record<Subject, boolean>>({
    Physics: true,
    Chemistry: true,
    Biology: true,
  });

  const handleSubjectToggle = (subject: Subject) => {
    setSelectedSubjects(prev => ({ ...prev, [subject]: !prev[subject] }));
  };

  const handleStartTest = () => {
    const activeSubjects = Object.entries(selectedSubjects)
      .filter(([, isSelected]) => isSelected)
      .map(([subject]) => subject as Subject);

    if (activeSubjects.length === 0) {
      alert("Please select at least one subject.");
      return;
    }

    // Filter questions based on selection
    const filteredQuestions = questionsData.filter(q => {
      const matchSubject = activeSubjects.includes(q.subject as Subject);
      const matchDifficulty = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
      return matchSubject && matchDifficulty;
    });

    if (filteredQuestions.length === 0) {
      alert("No questions match your criteria.");
      return;
    }

    const questionIds = filteredQuestions.map(q => q.id);

    startTest(
      { difficulty: selectedDifficulty, subjects: activeSubjects },
      questionIds
    );

    router.push("/test");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 md:p-24 overflow-hidden relative">

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0 flex justify-center items-center">
        <div className="w-[120%] h-[1px] bg-ui-border absolute transform -rotate-12"></div>
        <div className="w-[1px] h-[120%] bg-ui-border absolute transform rotate-12"></div>
      </div>

      <div className="z-10 max-w-2xl w-full relative">
        <div className="mb-2 text-ui-accent font-bold tracking-widest text-xs">SYS_INIT :: NE-ET_MOCK_ENV</div>
        <h1 className="text-5xl md:text-7xl font-bold mb-8 uppercase leading-none tracking-tighter">
          Test<br/>Terminal<span className="text-ui-accent animate-pulse">_</span>
        </h1>

        <div className="brutal-panel p-8 md:p-10 mb-8 transform hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between border-b-3 border-ui-border pb-4 mb-8">
            <h2 className="text-2xl font-bold">Configuration Setup</h2>
            <div className="w-12 h-3 bg-ui-border grid grid-cols-4 gap-1 p-[2px]">
              <div className="bg-ui-surface h-full"></div>
              <div className="bg-ui-surface h-full"></div>
              <div className="bg-ui-surface h-full"></div>
              <div className="bg-ui-accent h-full"></div>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="font-bold mb-4 uppercase tracking-wider text-sm flex justify-between">
              <span>Select Difficulty</span>
              <span className="text-ui-accent">[{selectedDifficulty}]</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["All", "Easy", "Medium", "Hard"] as Difficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`py-3 brutal-border font-bold uppercase text-sm ${
                    selectedDifficulty === diff
                      ? "bg-ui-fg text-ui-bg translate-x-[2px] translate-y-[2px] !shadow-[2px_2px_0px_0px_var(--ui-border)]"
                      : "bg-ui-surface hover:bg-gray-200"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-10">
            <h3 className="font-bold mb-4 uppercase tracking-wider text-sm">Subject Modules</h3>
            <div className="flex flex-col gap-3">
              {(["Physics", "Chemistry", "Biology"] as Subject[]).map(subject => (
                <label
                  key={subject}
                  className={`flex items-center justify-between p-4 brutal-border cursor-pointer transition-colors ${
                    selectedSubjects[subject] ? "bg-ui-accent text-white border-ui-accent" : "bg-ui-surface hover:bg-gray-200"
                  }`}
                >
                  <span className="font-bold uppercase text-lg">{subject}</span>
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSubjects[subject]}
                      onChange={() => handleSubjectToggle(subject)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 border-2 border-current flex items-center justify-center ${selectedSubjects[subject] ? "bg-white text-ui-accent" : ""}`}>
                      {selectedSubjects[subject] && <span className="block w-3 h-3 bg-current"></span>}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleStartTest}
          className="w-full bg-ui-accent hover:bg-ui-accent-hover text-white py-5 px-6 brutal-btn text-2xl flex justify-between items-center group"
        >
          <span>Initiate Sequence</span>
          <span className="transform group-hover:translate-x-2 transition-transform">→</span>
        </button>
      </div>
    </main>
  );
}
