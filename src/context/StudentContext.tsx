import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile, LevelId, LevelScore, TenseId } from '../types';
import { LEVELS } from '../data/tensesTheory';

interface StudentContextType {
  profile: StudentProfile;
  setStudentName: (name: string) => void;
  recordLevelCompletion: (
    levelId: LevelId,
    score: number,
    total: number,
    passed: boolean
  ) => { newlyUnlocked: boolean; nextLevelTitle?: string };
  recordMistake: (mistake: {
    questionId: string;
    prompt: string;
    userChoice: string;
    correctAnswer: string;
    explanation: string;
    tenseId: TenseId;
  }) => void;
  clearMistake: (questionId: string) => void;
  decrementHeart: () => void;
  refillHearts: () => void;
  addXP: (amount: number) => void;
  isLevelUnlocked: (levelIndex: number) => boolean;
  canAccessFinalExam: () => boolean;
  resetProgress: () => void;
  issueCertificateId: () => string;
}

const STORAGE_KEY = 'tiempos_verbales_student_profile_v2';

const INITIAL_PROFILE: StudentProfile = {
  studentName: '',
  unlockedLevelIndex: 0, // 0 = Level 1 unlocked, 1 = Level 2 unlocked, etc.
  levelScores: {},
  finalExamPassed: false,
  xp: 100,
  streakDays: 1,
  hearts: 5,
  answeredQuestionsCount: 0,
  mistakes: [],
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile>(() => {
    if (typeof window === 'undefined') return INITIAL_PROFILE;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_PROFILE,
          ...parsed,
          // Guarantee safety defaults
          unlockedLevelIndex: typeof parsed.unlockedLevelIndex === 'number' ? parsed.unlockedLevelIndex : 0,
          levelScores: parsed.levelScores || {},
          mistakes: parsed.mistakes || [],
        };
      }
    } catch {
      // ignore
    }
    return INITIAL_PROFILE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore storage quota issues
    }
  }, [profile]);

  const setStudentName = (name: string) => {
    setProfile((prev) => ({
      ...prev,
      studentName: name.trim(),
    }));
  };

  const isLevelUnlocked = (levelIndex: number): boolean => {
    // Level 0 is always unlocked. Other levels require student.unlockedLevelIndex >= levelIndex.
    return levelIndex <= profile.unlockedLevelIndex;
  };

  const canAccessFinalExam = (): boolean => {
    // Final exam is index 4, unlocked ONLY if unlockedLevelIndex >= 4
    // (meaning Level 1, Level 2, Level 3, and Level 4 have all been passed)
    return profile.unlockedLevelIndex >= 4;
  };

  const issueCertificateId = (): string => {
    if (profile.certificateId) return profile.certificateId;
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newId = `TVM-2026-${randomHex}`;
    setProfile((prev) => ({
      ...prev,
      certificateId: newId,
    }));
    return newId;
  };

  const recordLevelCompletion = (
    levelId: LevelId,
    score: number,
    total: number,
    passed: boolean
  ) => {
    const percentage = Math.round((score / total) * 100);
    const currentLevel = LEVELS.find((l) => l.id === levelId);
    const levelIdx = currentLevel?.index ?? 0;

    let newlyUnlocked = false;
    let nextLevelTitle: string | undefined = undefined;

    setProfile((prev) => {
      const existingScore: LevelScore | undefined = prev.levelScores[levelId];
      const attempts = (existingScore?.attempts || 0) + 1;
      const updatedScores = {
        ...prev.levelScores,
        [levelId]: {
          score,
          total,
          percentage,
          passed: passed || !!existingScore?.passed,
          completedAt: new Date().toISOString(),
          attempts,
        },
      };

      let newUnlocked = prev.unlockedLevelIndex;
      // If student passed the level, and it was their current frontier, advance the frontier!
      if (passed && levelIdx === prev.unlockedLevelIndex && levelIdx < LEVELS.length - 1) {
        newUnlocked = levelIdx + 1;
        newlyUnlocked = true;
        nextLevelTitle = LEVELS[newUnlocked]?.title;
      }

      const xpEarned = score * 15 + (passed ? 200 : 50);
      const isFinal = levelId === 'level-final-exam';

      return {
        ...prev,
        levelScores: updatedScores,
        unlockedLevelIndex: newUnlocked,
        finalExamPassed: isFinal && passed ? true : prev.finalExamPassed,
        finalScore: isFinal ? percentage : prev.finalScore,
        finalExamCompletedAt: isFinal && passed ? new Date().toISOString() : prev.finalExamCompletedAt,
        certificateId: isFinal && passed && !prev.certificateId ? `TVM-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}` : prev.certificateId,
        xp: prev.xp + xpEarned,
        answeredQuestionsCount: prev.answeredQuestionsCount + total,
      };
    });

    return { newlyUnlocked, nextLevelTitle };
  };

  const recordMistake = (mistake: {
    questionId: string;
    prompt: string;
    userChoice: string;
    correctAnswer: string;
    explanation: string;
    tenseId: TenseId;
  }) => {
    setProfile((prev) => {
      // Don't duplicate if already logged
      const exists = prev.mistakes.some((m) => m.questionId === mistake.questionId);
      if (exists) return prev;
      return {
        ...prev,
        mistakes: [
          {
            ...mistake,
            date: new Date().toLocaleDateString('es-ES'),
          },
          ...prev.mistakes.slice(0, 39), // keep recent 40 mistakes
        ],
      };
    });
  };

  const clearMistake = (questionId: string) => {
    setProfile((prev) => ({
      ...prev,
      mistakes: prev.mistakes.filter((m) => m.questionId !== questionId),
      xp: prev.xp + 20,
    }));
  };

  const decrementHeart = () => {
    setProfile((prev) => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
    }));
  };

  const refillHearts = () => {
    setProfile((prev) => ({
      ...prev,
      hearts: 5,
    }));
  };

  const addXP = (amount: number) => {
    setProfile((prev) => ({
      ...prev,
      xp: prev.xp + amount,
    }));
  };

  const resetProgress = () => {
    const fresh: StudentProfile = {
      ...INITIAL_PROFILE,
      studentName: profile.studentName, // keep student name
    };
    setProfile(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      // ignore
    }
  };

  return (
    <StudentContext.Provider
      value={{
        profile,
        setStudentName,
        recordLevelCompletion,
        recordMistake,
        clearMistake,
        decrementHeart,
        refillHearts,
        addXP,
        isLevelUnlocked,
        canAccessFinalExam,
        resetProgress,
        issueCertificateId,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
