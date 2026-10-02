import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import {
  Award,
  BookOpen,
  GitCommit,
  Heart,
  RotateCcw,
  User,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'roadmap' | 'timeline' | 'theory' | 'mistakes' | 'certificate';
  setCurrentTab: (tab: 'roadmap' | 'timeline' | 'theory' | 'mistakes' | 'certificate') => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenProfile,
}) => {
  const { profile, refillHearts, resetProgress } = useStudent();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setCurrentTab('roadmap')}
          className="flex items-center gap-2.5 text-left group transition-transform focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20 group-hover:bg-indigo-500 transition-colors">
            TV
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
            Tiempos Verbales Master
          </span>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentTab('roadmap')}
            className={`transition-colors hover:text-white py-1 ${
              currentTab === 'roadmap'
                ? 'text-indigo-400 border-b-2 border-indigo-400 font-semibold'
                : 'text-slate-400'
            }`}
          >
            Ruta de Aprendizaje
          </button>

          <button
            onClick={() => setCurrentTab('timeline')}
            className={`transition-colors hover:text-white py-1 flex items-center gap-1.5 ${
              currentTab === 'timeline'
                ? 'text-indigo-400 border-b-2 border-indigo-400 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <GitCommit className="w-4 h-4" />
            Línea del Tiempo
          </button>

          <button
            onClick={() => setCurrentTab('theory')}
            className={`transition-colors hover:text-white py-1 flex items-center gap-1.5 ${
              currentTab === 'theory'
                ? 'text-indigo-400 border-b-2 border-indigo-400 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Guía Teórica
          </button>

          <button
            onClick={() => setCurrentTab('mistakes')}
            className={`transition-colors hover:text-white py-1 flex items-center gap-1.5 ${
              currentTab === 'mistakes'
                ? 'text-indigo-400 border-b-2 border-indigo-400 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <span>Mis Errores</span>
            {profile.mistakes.length > 0 && (
              <span className="text-xs bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded-full font-mono">
                {profile.mistakes.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('certificate')}
            className={`transition-colors hover:text-white py-1 flex items-center gap-1.5 ${
              currentTab === 'certificate'
                ? 'text-amber-400 border-b-2 border-amber-400 font-semibold'
                : profile.finalExamPassed
                ? 'text-amber-300'
                : 'text-slate-400'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certificado</span>
          </button>
        </nav>

        {/* Zone 3: Student Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Hearts / Vidas */}
          <div
            onClick={refillHearts}
            title="Vidas disponibles para ejercicios (haz clic para recargar)"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-rose-400 cursor-pointer hover:border-rose-500/40 transition-colors"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span className="font-mono tabular-nums">{profile.hearts}</span>
          </div>

          {/* XP Badge */}
          <div
            title="Puntos de Experiencia acumulados"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-amber-400"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-mono tabular-nums">{profile.xp} XP</span>
          </div>

          {/* Student Profile Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
          >
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <span className="max-w-[100px] truncate">
              {profile.studentName || 'Estudiante'}
            </span>
          </button>

          {/* Reset progress button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reiniciar progreso del curso"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950 px-2 py-2 text-xs">
        <button
          onClick={() => setCurrentTab('roadmap')}
          className={`px-2 py-1 rounded ${
            currentTab === 'roadmap' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Ruta
        </button>
        <button
          onClick={() => setCurrentTab('timeline')}
          className={`px-2 py-1 rounded ${
            currentTab === 'timeline' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Línea
        </button>
        <button
          onClick={() => setCurrentTab('theory')}
          className={`px-2 py-1 rounded ${
            currentTab === 'theory' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Teoría
        </button>
        <button
          onClick={() => setCurrentTab('mistakes')}
          className={`px-2 py-1 rounded ${
            currentTab === 'mistakes' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Errores ({profile.mistakes.length})
        </button>
        <button
          onClick={() => setCurrentTab('certificate')}
          className={`px-2 py-1 rounded ${
            currentTab === 'certificate' ? 'text-amber-400 font-semibold' : 'text-slate-400'
          }`}
        >
          Diploma
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">¿Reiniciar progreso de estudio?</h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Esta acción restablecerá el bloqueo de niveles al Nivel 1 para que puedas comenzar de cero la ruta secuencial. Se conservará tu nombre de estudiante.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetProgress();
                  setShowResetConfirm(false);
                  setCurrentTab('roadmap');
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                Sí, reiniciar ruta
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
