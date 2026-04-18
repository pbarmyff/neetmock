"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked';

export type Subject = 'Physics' | 'Chemistry' | 'Biology';
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'All';

export interface TestConfig {
  difficulty: Difficulty;
  subjects: Subject[];
}

export interface TestState {
  config: TestConfig;
  currentQuestionId: string | null;
  answers: Record<string, string>;
  status: Record<string, QuestionStatus>;
  timeSpent: Record<string, number>;
  timeRemaining: number;
  testStatus: 'not_started' | 'in_progress' | 'submitted';
  questionIds: string[]; // Keep track of the filtered questions
}

const defaultState: TestState = {
  config: { difficulty: 'All', subjects: ['Physics', 'Chemistry', 'Biology'] },
  currentQuestionId: null,
  answers: {},
  status: {},
  timeSpent: {},
  timeRemaining: 200 * 60, // 200 minutes in seconds
  testStatus: 'not_started',
  questionIds: []
};

interface TestContextType {
  state: TestState;
  setState: React.Dispatch<React.SetStateAction<TestState>>;
  startTest: (config: TestConfig, questions: string[]) => void;
  submitTest: () => void;
  resetTest: () => void;
  updateTimeRemaining: (time: number) => void;
  setAnswer: (questionId: string, answer: string | null) => void;
  markQuestion: (questionId: string) => void;
  setCurrentQuestion: (questionId: string) => void;
  incrementTimeSpent: (questionId: string) => void;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

export const TestProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<TestState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('neet_test_state');
    if (savedState) {
      try {
        // Use setTimeout to avoid synchronous setState inside useEffect
        const parsed = JSON.parse(savedState);
        setTimeout(() => setState(parsed), 0);
      } catch (e) {
        console.error("Failed to parse test state", e);
      }
    }
    setTimeout(() => setIsLoaded(true), 0);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('neet_test_state', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  const startTest = (config: TestConfig, questionIds: string[]) => {
    const initialStatus: Record<string, QuestionStatus> = {};
    const initialTimeSpent: Record<string, number> = {};

    questionIds.forEach((id, index) => {
      initialStatus[id] = index === 0 ? 'not_answered' : 'not_visited';
      initialTimeSpent[id] = 0;
    });

    setState({
      config,
      currentQuestionId: questionIds.length > 0 ? questionIds[0] : null,
      answers: {},
      status: initialStatus,
      timeSpent: initialTimeSpent,
      timeRemaining: 200 * 60,
      testStatus: 'in_progress',
      questionIds
    });
  };

  const submitTest = () => {
    setState(prev => ({ ...prev, testStatus: 'submitted' }));
  };

  const resetTest = () => {
    setState(defaultState);
    localStorage.removeItem('neet_test_state');
  };

  const updateTimeRemaining = (time: number) => {
    setState(prev => ({ ...prev, timeRemaining: time }));
  };

  const setAnswer = (questionId: string, answer: string | null) => {
    setState(prev => {
      const newAnswers = { ...prev.answers };
      if (answer === null) {
        delete newAnswers[questionId];
      } else {
        newAnswers[questionId] = answer;
      }

      return {
        ...prev,
        answers: newAnswers,
        status: {
          ...prev.status,
          [questionId]: answer ? 'answered' : 'not_answered'
        }
      };
    });
  };

  const markQuestion = (questionId: string) => {
    setState(prev => ({
      ...prev,
      status: {
        ...prev.status,
        [questionId]: 'marked'
      }
    }));
  };

  const setCurrentQuestion = (questionId: string) => {
    setState(prev => {
      const currentStatus = prev.status[questionId];
      const newStatus = currentStatus === 'not_visited' ? 'not_answered' : currentStatus;

      return {
        ...prev,
        currentQuestionId: questionId,
        status: {
          ...prev.status,
          [questionId]: newStatus
        }
      };
    });
  };

  const incrementTimeSpent = (questionId: string) => {
    setState(prev => ({
      ...prev,
      timeSpent: {
        ...prev.timeSpent,
        [questionId]: (prev.timeSpent[questionId] || 0) + 1
      }
    }));
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <TestContext.Provider value={{
      state,
      setState,
      startTest,
      submitTest,
      resetTest,
      updateTimeRemaining,
      setAnswer,
      markQuestion,
      setCurrentQuestion,
      incrementTimeSpent
    }}>
      {children}
    </TestContext.Provider>
  );
};

export const useTest = () => {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTest must be used within a TestProvider');
  }
  return context;
};
