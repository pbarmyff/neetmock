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
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-12">NEET Mock Test Portal</h1>

        <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto text-gray-800">
          <h2 className="text-2xl font-semibold mb-6">Test Configuration</h2>

          <div className="mb-6">
            <h3 className="font-medium mb-3">Difficulty Level</h3>
            <div className="flex gap-2">
              {(["All", "Easy", "Medium", "Hard"] as Difficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-4 py-2 rounded-md ${
                    selectedDifficulty === diff
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-medium mb-3">Subjects</h3>
            <div className="flex flex-col gap-2">
              {(["Physics", "Chemistry", "Biology"] as Subject[]).map(subject => (
                <label key={subject} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSubjects[subject]}
                    onChange={() => handleSubjectToggle(subject)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span>{subject}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartTest}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Start Test
          </button>
        </div>
      </div>
    </main>
  );
}
