'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface DailyData {
  date: string;
  questions: number;
  quizzes: number;
  flashcards: number;
}

interface AnalyticsContextType {
  totalQuestions: number;
  totalQuizzes: number;
  totalFlashcards: number;
  totalUploads: number;
  weeklyData: DailyData[];
  trackQuestion: () => void;
  trackQuiz: () => void;
  trackFlashcard: () => void;
  trackUpload: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  totalQuestions: 0,
  totalQuizzes: 0,
  totalFlashcards: 0,
  totalUploads: 0,
  weeklyData: [],
  trackQuestion: () => {},
  trackQuiz: () => {},
  trackFlashcard: () => {},
  trackUpload: () => {},
});

function getStoredInt(key: string) {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(key) || '0', 10);
}

function getWeeklyData(): DailyData[] {
  const days: DailyData[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const stored = JSON.parse(localStorage.getItem(`analytics_day_${dateStr}`) || '{"questions":0,"quizzes":0,"flashcards":0}');
    days.push({
      date: d.toLocaleDateString('en-US', { weekday: 'short' }),
      questions: stored.questions || 0,
      quizzes: stored.quizzes || 0,
      flashcards: stored.flashcards || 0,
    });
  }
  return days;
}

function recordDailyEvent(field: 'questions' | 'quizzes' | 'flashcards') {
  if (typeof window === 'undefined') return;
  const key = `analytics_day_${new Date().toDateString()}`;
  const stored = JSON.parse(localStorage.getItem(key) || '{"questions":0,"quizzes":0,"flashcards":0}');
  stored[field] = (stored[field] || 0) + 1;
  localStorage.setItem(key, JSON.stringify(stored));
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [totalFlashcards, setTotalFlashcards] = useState(0);
  const [totalUploads, setTotalUploads] = useState(0);
  const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);

  useEffect(() => {
    setTotalQuestions(getStoredInt('analytics_total_questions'));
    setTotalQuizzes(getStoredInt('analytics_total_quizzes'));
    setTotalFlashcards(getStoredInt('analytics_total_flashcards'));
    setTotalUploads(getStoredInt('analytics_total_uploads'));
    setWeeklyData(getWeeklyData());
  }, []);

  const trackQuestion = useCallback(() => {
    setTotalQuestions((n) => { const v = n + 1; localStorage.setItem('analytics_total_questions', String(v)); return v; });
    recordDailyEvent('questions');
    setWeeklyData(getWeeklyData());
  }, []);

  const trackQuiz = useCallback(() => {
    setTotalQuizzes((n) => { const v = n + 1; localStorage.setItem('analytics_total_quizzes', String(v)); return v; });
    recordDailyEvent('quizzes');
    setWeeklyData(getWeeklyData());
  }, []);

  const trackFlashcard = useCallback(() => {
    setTotalFlashcards((n) => { const v = n + 1; localStorage.setItem('analytics_total_flashcards', String(v)); return v; });
    recordDailyEvent('flashcards');
    setWeeklyData(getWeeklyData());
  }, []);

  const trackUpload = useCallback(() => {
    setTotalUploads((n) => { const v = n + 1; localStorage.setItem('analytics_total_uploads', String(v)); return v; });
  }, []);

  return (
    <AnalyticsContext.Provider value={{
      totalQuestions, totalQuizzes, totalFlashcards, totalUploads,
      weeklyData, trackQuestion, trackQuiz, trackFlashcard, trackUpload,
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => useContext(AnalyticsContext);
