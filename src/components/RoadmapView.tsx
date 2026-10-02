import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { LEVELS } from '../data/tensesTheory';
import { LevelInfo } from '../types';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Lock,
  Play,
  RotateCw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface RoadmapViewProps {
  onSelectLevel: (level: LevelInfo) => void;
  onOpenTheory: (tenseId?: string) => void;
  onOpenCertificate: () => void;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  onSelectLevel,
  onOpenTheory,
  onOpenCertificate,
}) => {
  const { profile, isLevelUnlocked } = useStudent();
  const [lockedAlert, setLockedAlert] = useState<{
    show: boolean;
    levelTitle: string;
    prevLevelTitle: string;
  } | null>(null);

  const totalLevels = LEVELS.length;
  // Calculate completed count
  const completedCount = LEVELS.filter((lvl) => {
    const sc = profile.levelScores[lvl.id];
    return sc && sc.passed;
  }).length;
  const progressPercent = Math.round((completedCount / totalLevels) * 100);

  const handleLevelClick = (level: LevelInfo) => {
    const unlocked = isLevelUnlocked(level.index);
    if (!unlocked) {
      const prevLevel = LEVELS[level.index - 1];
      setLockedAlert({
        show: true,
        levelTitle: level.title,
        prevLevelTitle: prevLevel ? prevLevel.title : 'el nivel anterior',
      });
      return;
    }
    onSelectLevel(level);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner with Course Overview and Sequential Philosophy */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Metodología de Aprendizaje Secuencial Estricto</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Domina los 12 Tiempos Verbales en Inglés
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Avanza paso a paso desde el presente hasta las estructuras avanzadas. Para garantizar un aprendizaje sólido, cada nivel se desbloquea únicamente al superar el anterior con un 80% de aciertos.
          </p>

          {/* Student Progress Overview Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-xs text-slate-400 block">Progreso de la Ruta</span>
              <div className="flex items-center justify-between mt-1 mb-1.5">
                <span className="text-lg font-bold text-white font-mono">{progressPercent}%</span>
                <span className="text-xs text-slate-400 font-mono">{completedCount} de {totalLevels} superados</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
              <span className="text-xs text-slate-400 block">Puntuación y Rango</span>
              <div className="flex items-center gap-2 mt-1">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-lg font-bold text-white font-mono">{profile.xp} XP</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {profile.finalExamPassed
                  ? '🏅 Certificado C1 Otorgado'
                  : `Nivel actual: ${profile.unlockedLevelIndex + 1} de ${totalLevels}`}
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Estado de Certificación</span>
                <span className="text-sm font-semibold text-slate-200 mt-1 block">
                  {profile.finalExamPassed ? 'Diploma Disponible' : 'Pendiente Examen Final'}
                </span>
              </div>
              {profile.finalExamPassed ? (
                <button
                  onClick={onOpenCertificate}
                  className="mt-2 text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  Ver mi Certificado Oficial →
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 mt-1">
                  Requiere aprobar los 4 niveles previos
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* The Roadmap Step-by-Step Levels */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Ruta Paso a Paso del Estudiante
            </h2>
            <p className="text-xs text-slate-400">
              Cada nivel incluye ejercicios interactivos con respuestas intercaladas, comprensión auditiva y retroalimentación explicativa.
            </p>
          </div>
          <button
            onClick={() => onOpenTheory()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/60 rounded-lg transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Consultar Todas las Fórmulas</span>
          </button>
        </div>

        <div className="space-y-4">
          {LEVELS.map((level, idx) => {
            const isUnlocked = isLevelUnlocked(level.index);
            const scoreData = profile.levelScores[level.id];
            const isPassed = scoreData?.passed;
            const isCurrent = isUnlocked && !isPassed;
            const isFinal = level.isFinalExam;

            return (
              <div
                key={level.id}
                className={`relative rounded-xl border transition-all overflow-hidden ${
                  !isUnlocked
                    ? 'border-slate-800/60 bg-slate-950/40 opacity-70'
                    : isPassed
                    ? 'border-emerald-500/40 bg-slate-900/90 shadow-md shadow-emerald-950/20'
                    : isFinal
                    ? 'border-amber-500/50 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 shadow-lg'
                    : 'border-indigo-500/50 bg-slate-900/90 shadow-lg ring-1 ring-indigo-500/20'
                }`}
              >
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  {/* Left: Level Header & Details */}
                  <div className="flex items-start gap-4">
                    {/* Level Number Icon Badge */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-base transition-colors ${
                        !isUnlocked
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : isPassed
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                          : isFinal
                          ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                          : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      }`}
                    >
                      {!isUnlocked ? (
                        <Lock className="w-5 h-5 text-slate-400" />
                      ) : isPassed ? (
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      ) : isFinal ? (
                        <Award className="w-6 h-6 text-amber-400" />
                      ) : (
                        <span>{level.index + 1}</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 font-mono">
                          {isFinal ? 'Certificación de Maestría' : `Fase ${idx + 1}`}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-400 font-mono">
                          Nivel CEFR: {level.cefr}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {level.questionCount} ejercicios
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        {level.title}
                        {isPassed && (
                          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Aprobado ({scoreData.percentage}%)
                          </span>
                        )}
                        {!isUnlocked && (
                          <span className="text-xs font-normal text-slate-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Bloqueado
                          </span>
                        )}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        {level.description}
                      </p>

                      {/* Tenses pills list */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {level.tenses.map((tId) => (
                          <button
                            key={tId}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTheory(tId);
                            }}
                            className="text-[11px] font-medium text-slate-400 hover:text-indigo-300 bg-slate-800/80 hover:bg-slate-800 px-2 py-0.5 rounded transition-colors"
                          >
                            {tId.replace(/-/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Action or Status */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {!isUnlocked ? (
                      <button
                        onClick={() => handleLevelClick(level)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs font-semibold hover:bg-slate-700/80 hover:text-slate-300 transition-colors"
                      >
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>Bloqueado</span>
                      </button>
                    ) : isPassed ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLevelClick(level)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                          <span>Repasar o Mejorar</span>
                        </button>
                        {isFinal && (
                          <button
                            onClick={onOpenCertificate}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all"
                          >
                            <Award className="w-4 h-4" />
                            <span>Ver Diploma</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleLevelClick(level)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-[0.98] ${
                          isFinal
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isFinal ? 'Iniciar Examen Final' : 'Comenzar Nivel'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Locked Alert Modal */}
      {lockedAlert?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Nivel Bloqueado</h3>
                <p className="text-xs text-rose-300">Requisito de aprendizaje paso a paso</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              No puedes acceder a <strong className="text-white">"{lockedAlert.levelTitle}"</strong> porque la metodología exige que completes y apruebes primero <strong className="text-indigo-300">"{lockedAlert.prevLevelTitle}"</strong> con al menos un <strong>80% de aciertos</strong>.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Esta restricción asegura que domines cada fundamento gramatical antes de pasar a tiempos más complejos o al examen final.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setLockedAlert(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Entendido
              </button>
              <button
                onClick={() => {
                  setLockedAlert(null);
                  const currentUnlocked = LEVELS[profile.unlockedLevelIndex];
                  if (currentUnlocked) {
                    onSelectLevel(currentUnlocked);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all"
              >
                Ir a mi nivel activo →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
