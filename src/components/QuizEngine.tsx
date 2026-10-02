import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LevelInfo, Question, ShuffledQuestion } from '../types';
import { useStudent } from '../context/StudentContext';
import {
  LEVEL_1_QUESTIONS,
  LEVEL_2_QUESTIONS,
  LEVEL_3_QUESTIONS,
  LEVEL_4_QUESTIONS,
  FINAL_EXAM_QUESTIONS,
} from '../data/questionsData';
import { prepareShuffledQuestions, getOptionLetter } from '../utils/shuffle';
import { audioService } from '../utils/audio';
import {
  AlertOctagon,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Heart,
  HeartCrack,
  HelpCircle,
  RotateCcw,
  RotateCw,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react';

interface QuizEngineProps {
  level: LevelInfo;
  onExit: () => void;
  onComplete: (score: number, total: number, passed: boolean) => void;
  onOpenTheory?: (tenseId?: string) => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  level,
  onExit,
  onComplete,
  onOpenTheory,
}) => {
  const { decrementHeart, recordMistake } = useStudent();

  // 3 lives for standard levels, 4 lives for the rigorous final exam
  const maxLives = level.isFinalExam ? 4 : 3;

  const [attemptSeed, setAttemptSeed] = useState(0);
  const [lives, setLives] = useState(maxLives);
  const [isGameOver, setIsGameOver] = useState(false);

  // Load raw questions for the selected level
  const rawQuestions: Question[] = useMemo(() => {
    switch (level.id) {
      case 'level-1-present':
        return LEVEL_1_QUESTIONS;
      case 'level-2-past':
        return LEVEL_2_QUESTIONS;
      case 'level-3-future':
        return LEVEL_3_QUESTIONS;
      case 'level-4-advanced':
        return LEVEL_4_QUESTIONS;
      case 'level-final-exam':
        return FINAL_EXAM_QUESTIONS;
      default:
        return LEVEL_1_QUESTIONS;
    }
  }, [level.id]);

  // Crucial: Prepare shuffled and intercalated options so correct answers are NEVER all 'A'
  // When attemptSeed changes (e.g., when restarting), questions and options are re-shuffled dynamically!
  const questions: ShuffledQuestion[] = useMemo(() => {
    return prepareShuffledQuestions(rawQuestions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawQuestions, attemptSeed]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillInput, setFillInput] = useState('');
  const [selectedOrderTokens, setSelectedOrderTokens] = useState<string[]>([]);
  const [availableTokens, setAvailableTokens] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [justLostLife, setJustLostLife] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Initialize tokens when current question changes
  useEffect(() => {
    setSelectedOption(null);
    setFillInput('');
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setShowHint(false);

    if (currentQ?.type === 'structure_order' && currentQ.orderTokens) {
      const tokensCopy = [...currentQ.orderTokens];
      for (let i = tokensCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tokensCopy[i], tokensCopy[j]] = [tokensCopy[j], tokensCopy[i]];
      }
      setAvailableTokens(tokensCopy);
      setSelectedOrderTokens([]);
    }

    if (currentQ?.type === 'fill_blank') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [currentIndex, currentQ, attemptSeed]);

  // Audio playback handler
  const playAudio = async (text: string, rate: number = 0.9) => {
    setIsPlayingAudio(true);
    await audioService.speak(text, rate);
    setIsPlayingAudio(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;

      if (isAnswerChecked) {
        if (e.key === 'Enter') {
          handleNextQuestion();
        }
        return;
      }

      if (
        currentQ?.type === 'multiple_choice' ||
        currentQ?.type === 'listening' ||
        currentQ?.type === 'error_spotting'
      ) {
        const opts = currentQ.shuffledOptions || [];
        if (['1', 'a', 'A'].includes(e.key) && opts[0]) setSelectedOption(opts[0]);
        if (['2', 'b', 'B'].includes(e.key) && opts[1]) setSelectedOption(opts[1]);
        if (['3', 'c', 'C'].includes(e.key) && opts[2]) setSelectedOption(opts[2]);
        if (['4', 'd', 'D'].includes(e.key) && opts[3]) setSelectedOption(opts[3]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerChecked, isGameOver, currentQ, selectedOption]);

  const handleCheckAnswer = () => {
    if (!currentQ || isAnswerChecked || isGameOver) return;

    let userAns = '';
    let correct = false;

    if (
      currentQ.type === 'multiple_choice' ||
      currentQ.type === 'listening' ||
      currentQ.type === 'error_spotting'
    ) {
      if (!selectedOption) return;
      userAns = selectedOption;
      correct = selectedOption.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    } else if (currentQ.type === 'fill_blank') {
      if (!fillInput.trim()) return;
      userAns = fillInput.trim();
      const cleanUser = userAns.toLowerCase().replace(/’/g, "'");
      const cleanCorrect = currentQ.correctAnswer.toLowerCase().replace(/’/g, "'");
      correct = cleanUser === cleanCorrect;
    } else if (currentQ.type === 'structure_order') {
      userAns = selectedOrderTokens.join(' ').trim();
      const cleanUser = userAns.toLowerCase().replace(/\s+/g, ' ');
      const cleanCorrect = currentQ.correctAnswer.toLowerCase().replace(/\s+/g, ' ');
      correct = cleanUser === cleanCorrect;
    }

    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      setScore((prev) => prev + currentQ.points);
    } else {
      decrementHeart();
      const nextLives = lives - 1;
      setLives(nextLives);
      setJustLostLife(true);
      setTimeout(() => setJustLostLife(false), 1200);

      recordMistake({
        questionId: currentQ.id,
        prompt: currentQ.prompt,
        userChoice: userAns,
        correctAnswer: currentQ.correctAnswer,
        explanation: currentQ.explanation,
        tenseId: currentQ.tenseId,
      });

      // If lives reach 0, trigger Game Over / must restart level
      if (nextLives <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
        }, 1400);
      }
    }
  };

  const handleNextQuestion = () => {
    if (lives <= 0) {
      setIsGameOver(true);
      return;
    }

    if (isLastQuestion) {
      const finalScore = score;
      const totalPossible = questions.reduce((sum, q) => sum + q.points, 0);
      const passed = Math.round((finalScore / totalPossible) * 100) >= level.passingPercentage;
      onComplete(finalScore, totalPossible, passed);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Full restart of level when student loses all lives or chooses to restart
  const handleRestartLevel = () => {
    setLives(maxLives);
    setIsGameOver(false);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setFillInput('');
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setAttemptSeed(Date.now()); // Re-triggers fresh shuffle of questions and options!
  };

  const progressPercentage = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Bar inside Quiz */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Abandonar</span>
        </button>

        {/* Lives Counter Bar */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border transition-all ${
            justLostLife
              ? 'border-rose-500 bg-rose-950/40 animate-pulse'
              : 'border-slate-800'
          }`}
        >
          <span className="text-xs text-slate-400 mr-1 font-semibold">Vidas:</span>
          {Array.from({ length: maxLives }).map((_, idx) => {
            const hasHeart = idx < lives;
            return (
              <Heart
                key={idx}
                className={`w-4 h-4 transition-all duration-300 ${
                  hasHeart
                    ? 'fill-rose-500 text-rose-500 scale-100'
                    : 'fill-slate-800 text-slate-700 scale-90'
                }`}
              />
            );
          })}
          <span className="text-xs font-mono font-bold text-slate-300 ml-1">
            {lives}/{maxLives}
          </span>
        </div>

        {/* Question Counter */}
        <div className="text-center hidden sm:block">
          <span className="text-xs font-semibold text-indigo-400 font-mono uppercase tracking-wider block">
            {level.title}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Pregunta {currentIndex + 1} de {questions.length}
          </span>
        </div>

        {/* Score & Points */}
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Puntos</span>
          <span className="text-sm font-bold text-amber-400 font-mono">
            {score} pts
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Question Type & Tense indicator */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded-md">
              {currentQ.type === 'multiple_choice' && 'Selección Múltiple (Intercalada)'}
              {currentQ.type === 'fill_blank' && 'Completar Espacio'}
              {currentQ.type === 'structure_order' && 'Ordenar Sintaxis'}
              {currentQ.type === 'listening' && 'Comprensión Auditiva'}
              {currentQ.type === 'error_spotting' && 'Detectar el Error'}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-indigo-300 font-medium">
              {currentQ.tenseId.replace(/-/g, ' ')}
            </span>
          </div>

          {currentQ.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'Ocultar Pista' : 'Ver Pista'}</span>
            </button>
          )}
        </div>

        {/* Clue/Hint Banner if toggled */}
        {showHint && currentQ.hint && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Pista gramatical: {currentQ.hint}</span>
          </div>
        )}

        {/* Audio Player for Listening exercises */}
        {currentQ.audioText && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Audio Nativo en Inglés</p>
                <p className="text-xs text-slate-400">Escucha con atención para responder con precisión</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => playAudio(currentQ.audioText!, 0.95)}
                disabled={isPlayingAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Escuchar (1x)</span>
              </button>
              <button
                type="button"
                onClick={() => playAudio(currentQ.audioText!, 0.75)}
                disabled={isPlayingAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              >
                <span>Lento (0.75x)</span>
              </button>
            </div>
          </div>
        )}

        {/* Prompt / Sentence */}
        <div className="space-y-2">
          <p className="text-base sm:text-xl font-semibold text-white leading-relaxed">
            {currentQ.prompt}
          </p>
        </div>

        {/* INTERACTIVE QUESTION BODY */}

        {/* 1. Multiple Choice / Listening / Error Spotting */}
        {(currentQ.type === 'multiple_choice' ||
          currentQ.type === 'listening' ||
          currentQ.type === 'error_spotting') &&
          currentQ.shuffledOptions && (
            <div className="space-y-3 pt-2">
              {currentQ.shuffledOptions.map((option, idx) => {
                const letter = getOptionLetter(idx);
                const isSelected = selectedOption === option;
                const isCorrectOption =
                  option.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();

                let cardStyle =
                  'border-slate-800 bg-slate-950/60 text-slate-200 hover:border-slate-700 hover:bg-slate-800/60';
                let letterStyle = 'bg-slate-800 text-slate-400 border-slate-700';

                if (isSelected) {
                  cardStyle = 'border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500';
                  letterStyle = 'bg-indigo-600 text-white border-indigo-500';
                }

                if (isAnswerChecked) {
                  if (isCorrectOption) {
                    cardStyle =
                      'border-emerald-500 bg-emerald-950/40 text-emerald-100 ring-1 ring-emerald-500';
                    letterStyle = 'bg-emerald-600 text-white border-emerald-500';
                  } else if (isSelected && !isCorrect) {
                    cardStyle = 'border-rose-500 bg-rose-950/40 text-rose-100 ring-1 ring-rose-500';
                    letterStyle = 'bg-rose-600 text-white border-rose-500';
                  } else {
                    cardStyle = 'border-slate-800/40 bg-slate-950/30 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={`${currentQ.id}-opt-${idx}`}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border flex items-center justify-between gap-3 transition-all ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors ${letterStyle}`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm sm:text-base font-medium">{option}</span>
                    </div>

                    {isAnswerChecked && isCorrectOption && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {isAnswerChecked && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

        {/* 2. Fill in the Blank */}
        {currentQ.type === 'fill_blank' && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="text"
                value={fillInput}
                disabled={isAnswerChecked}
                onChange={(e) => setFillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAnswerChecked && fillInput.trim()) {
                    handleCheckAnswer();
                  }
                }}
                placeholder="Escribe la conjugación correcta aquí..."
                className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-base font-medium transition-colors focus:outline-none ${
                  isAnswerChecked
                    ? isCorrect
                      ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                      : 'border-rose-500 text-rose-300 bg-rose-950/20'
                    : 'border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
            </div>
            {currentQ.verbBase && (
              <p className="text-xs text-slate-400">
                Verbo base a conjugar: <span className="font-mono text-indigo-300 font-bold">({currentQ.verbBase})</span>
              </p>
            )}
          </div>
        )}

        {/* 3. Structure / Word Order */}
        {currentQ.type === 'structure_order' && (
          <div className="space-y-5 pt-2">
            <div>
              <span className="text-xs text-slate-400 block mb-2">Tu oración ordenada:</span>
              <div className="min-h-16 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/70 flex flex-wrap gap-2 items-center">
                {selectedOrderTokens.length === 0 ? (
                  <span className="text-xs text-slate-400 italic">
                    Haz clic en las fichas de abajo para colocarlas en el orden sintáctico correcto...
                  </span>
                ) : (
                  selectedOrderTokens.map((token, tIdx) => (
                    <button
                      key={`slot-${tIdx}`}
                      type="button"
                      disabled={isAnswerChecked}
                      onClick={() => {
                        setSelectedOrderTokens(selectedOrderTokens.filter((_, i) => i !== tIdx));
                        setAvailableTokens([...availableTokens, token]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-transform active:scale-95"
                    >
                      {token}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">Fichas disponibles:</span>
                {selectedOrderTokens.length > 0 && !isAnswerChecked && (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentQ.orderTokens) {
                        setAvailableTokens([...currentQ.orderTokens]);
                        setSelectedOrderTokens([]);
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reiniciar orden</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTokens.map((token, aIdx) => (
                  <button
                    key={`avail-${aIdx}`}
                    type="button"
                    disabled={isAnswerChecked}
                    onClick={() => {
                      setSelectedOrderTokens([...selectedOrderTokens, token]);
                      setAvailableTokens(availableTokens.filter((_, i) => i !== aIdx));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all active:scale-95"
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK EXPLANATION DRAWER */}
        {isAnswerChecked && (
          <div
            className={`p-4 sm:p-5 rounded-xl border animate-in fade-in duration-200 ${
              isCorrect
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">
                    {isCorrect ? '¡Respuesta Correcta!' : 'Respuesta Incorrecta'}
                  </h4>
                  {!isCorrect && (
                    <span className="text-[11px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full">
                      -1 Vida (Te quedan {lives})
                    </span>
                  )}
                </div>
                {!isCorrect && (
                  <p className="text-xs font-semibold text-amber-300">
                    Respuesta exacta: <span className="underline">{currentQ.correctAnswer}</span>
                  </p>
                )}
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  {currentQ.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Actions (Comprobar / Siguiente) */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onExit}
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Salir al Menú
          </button>

          {!isAnswerChecked ? (
            <button
              type="button"
              onClick={handleCheckAnswer}
              disabled={
                (currentQ.type === 'multiple_choice' ||
                  currentQ.type === 'listening' ||
                  currentQ.type === 'error_spotting')
                  ? !selectedOption
                  : currentQ.type === 'fill_blank'
                  ? !fillInput.trim()
                  : selectedOrderTokens.length === 0
              }
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              Comprobar Respuesta
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <span>{isLastQuestion ? 'Ver Resultados Finales' : 'Siguiente Pregunta'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* GAME OVER MODAL (LIVES EXHAUSTED) */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-center space-y-5 overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto animate-bounce">
              <HeartCrack className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest block">
                0 VIDAS RESTANTES
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                ¡Te has quedado sin vidas!
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Has agotado tus <strong className="text-rose-400">{maxLives} vidas</strong> permitidas en este intento. Por exigencia metodológica y para evitar aprobaciones al azar, <strong className="text-white">debes reiniciar este nivel desde el principio</strong>.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2 text-left">
              <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Al reiniciar, las preguntas y las opciones se volverán a barajar dinámicamente para que afiances los conceptos sin memorizar patrones de letras.
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRestartLevel}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                <span>Reiniciar Nivel (Recuperar {maxLives} Vidas)</span>
              </button>

              {onOpenTheory && (
                <button
                  type="button"
                  onClick={() => {
                    const firstTense = level.tenses[0];
                    onOpenTheory(firstTense);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Estudiar Teoría</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onExit}
              className="text-xs text-slate-400 hover:text-white transition-colors block mx-auto pt-1"
            >
              Volver a la Ruta de Aprendizaje
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
