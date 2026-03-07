'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type Plan = 'free' | 'pro' | 'enterprise';

interface PlanContextType {
  currentPlan: Plan;
  upgradePlan: (plan: Plan) => void;
  isPro: boolean;
  dailyQuestionsUsed: number;
  incrementDailyQuestions: () => boolean; // returns false if limit reached
}

const PlanContext = createContext<PlanContextType>({
  currentPlan: 'free',
  upgradePlan: () => {},
  isPro: false,
  dailyQuestionsUsed: 0,
  incrementDailyQuestions: () => true,
});

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [currentPlan, setCurrentPlan] = useState<Plan>('free');
  const [dailyQuestionsUsed, setDailyQuestionsUsed] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_plan') as Plan | null;
      if (saved) setCurrentPlan(saved);

      const today = new Date().toDateString();
      const savedDate = localStorage.getItem('ai_questions_date');
      const savedCount = parseInt(localStorage.getItem('ai_questions_count') || '0', 10);
      if (savedDate === today) {
        setDailyQuestionsUsed(savedCount);
      } else {
        localStorage.setItem('ai_questions_date', today);
        localStorage.setItem('ai_questions_count', '0');
      }
    }
  }, []);

  const upgradePlan = useCallback((plan: Plan) => {
    setCurrentPlan(plan);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_plan', plan);
    }
  }, []);

  const incrementDailyQuestions = useCallback(() => {
    if (currentPlan !== 'free') return true;
    if (dailyQuestionsUsed >= 5) return false;
    const newCount = dailyQuestionsUsed + 1;
    setDailyQuestionsUsed(newCount);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_questions_count', String(newCount));
      localStorage.setItem('ai_questions_date', new Date().toDateString());
    }
    return true;
  }, [currentPlan, dailyQuestionsUsed]);

  return (
    <PlanContext.Provider value={{
      currentPlan,
      upgradePlan,
      isPro: currentPlan === 'pro' || currentPlan === 'enterprise',
      dailyQuestionsUsed,
      incrementDailyQuestions,
    }}>
      {children}
    </PlanContext.Provider>
  );
}

export const usePlan = () => useContext(PlanContext);
