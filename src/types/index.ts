export type TenseId =
  | 'simple-present'
  | 'present-continuous'
  | 'present-perfect'
  | 'present-perfect-continuous'
  | 'simple-past'
  | 'past-continuous'
  | 'past-perfect'
  | 'past-perfect-continuous'
  | 'future-simple'
  | 'future-going-to'
  | 'future-continuous'
  | 'future-perfect'
  | 'future-perfect-continuous'
  | 'mixed-tenses';

export type LevelId =
  | 'level-1-present'
  | 'level-2-past'
  | 'level-3-future'
  | 'level-4-advanced'
  | 'level-final-exam';

export type QuestionType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'structure_order'
  | 'listening'
  | 'error_spotting';

export interface Question {
  id: string;
  tenseId: TenseId;
  type: QuestionType;
  prompt: string;
  options?: string[]; // for multiple choice & listening & error spotting
  correctAnswer: string;
  audioText?: string;
  orderTokens?: string[]; // for structure order
  hint?: string;
  verbBase?: string; // for fill in the blank
  explanation: string;
  points: number;
}

export interface ShuffledQuestion extends Question {
  shuffledOptions?: string[];
  correctOptionIndex?: number; // 0=A, 1=B, 2=C, 3=D
}

export interface TenseTheory {
  id: TenseId;
  name: string;
  spanishName: string;
  category: 'present' | 'past' | 'future' | 'mixed';
  cefrLevel: 'A1' | 'A2' | 'A1-A2' | 'A2-B1' | 'B1' | 'B1-B2' | 'B2' | 'B2-C1' | 'C1';
  summary: string;
  formula: {
    positive: string;
    negative: string;
    question: string;
  };
  usages: {
    title: string;
    explanation: string;
    exampleEn: string;
    exampleEs: string;
  }[];
  timeMarkers: string[];
  spanishPitfalls: string;
  timelineInfo: {
    timeSpan: string;
    position: 'before_past' | 'past' | 'past_ongoing' | 'present' | 'now_ongoing' | 'future' | 'future_before';
    graphicDescription: string;
  };
}

export interface LevelInfo {
  id: LevelId;
  index: number;
  title: string;
  subtitle: string;
  description: string;
  cefr: string;
  tensesCount: number;
  questionCount: number;
  passingPercentage: number;
  tenses: TenseId[];
  isFinalExam?: boolean;
}

export interface LevelScore {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  attempts: number;
}

export interface StudentProfile {
  studentName: string;
  unlockedLevelIndex: number; // 0 = Level 1, 1 = Level 2, 2 = Level 3, 3 = Level 4, 4 = Final Exam
  levelScores: Partial<Record<LevelId, LevelScore>>;
  finalExamPassed: boolean;
  finalScore?: number;
  finalExamCompletedAt?: string;
  certificateId?: string;
  xp: number;
  streakDays: number;
  hearts: number;
  answeredQuestionsCount: number;
  mistakes: {
    questionId: string;
    prompt: string;
    userChoice: string;
    correctAnswer: string;
    explanation: string;
    tenseId: TenseId;
    date: string;
  }[];
}
