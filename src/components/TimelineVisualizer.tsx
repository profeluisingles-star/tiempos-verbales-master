import React, { useState } from 'react';
import { TENSES_THEORY } from '../data/tensesTheory';
import { TenseId, TenseTheory } from '../types';
import { audioService } from '../utils/audio';
import {
  Clock,
  Info,
  Play,
  Volume2,
} from 'lucide-react';

export const TimelineVisualizer: React.FC = () => {
  const [selectedTenseId, setSelectedTenseId] = useState<TenseId>('present-perfect');
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTheory: TenseTheory = TENSES_THEORY[selectedTenseId] || TENSES_THEORY['simple-present'];

  const playSentence = async (text: string, rate: number = 0.9) => {
    setIsPlaying(true);
    await audioService.speak(text, rate);
    setIsPlaying(false);
  };

  // Group of tenses in time-order
  const timelineNodes: {
    id: TenseId;
    label: string;
    span: string;
    category: 'past' | 'present' | 'future';
    visualType: 'point' | 'continuous' | 'bridge';
  }[] = [
    { id: 'past-perfect', label: 'Past Perfect', span: 'Antes de otro pasado', category: 'past', visualType: 'point' },
    { id: 'past-perfect-continuous', label: 'Past Perf. Cont.', span: 'Duración previa al pasado', category: 'past', visualType: 'continuous' },
    { id: 'simple-past', label: 'Simple Past', span: 'Momento cerrado en pasado', category: 'past', visualType: 'point' },
    { id: 'past-continuous', label: 'Past Continuous', span: 'Acción en progreso en pasado', category: 'past', visualType: 'continuous' },
    { id: 'present-perfect', label: 'Present Perfect', span: 'Puente pasado ➔ presente', category: 'present', visualType: 'bridge' },
    { id: 'present-perfect-continuous', label: 'Pres. Perf. Cont.', span: 'Duración desde pasado a hoy', category: 'present', visualType: 'bridge' },
    { id: 'simple-present', label: 'Simple Present', span: 'Hábitos y verdades eternas', category: 'present', visualType: 'point' },
    { id: 'present-continuous', label: 'Present Continuous', span: 'Acción en curso AHORA', category: 'present', visualType: 'continuous' },
    { id: 'future-going-to', label: 'Going To', span: 'Plan o evidencia inminente', category: 'future', visualType: 'point' },
    { id: 'future-simple', label: 'Will', span: 'Decisión espontánea / predicción', category: 'future', visualType: 'point' },
    { id: 'future-continuous', label: 'Future Continuous', span: 'En curso a una hora futura', category: 'future', visualType: 'continuous' },
    { id: 'future-perfect', label: 'Future Perfect', span: 'Completado antes de fecha tope', category: 'future', visualType: 'bridge' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>Simulador Conceptual del Espacio Temporal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Línea del Tiempo Interactiva de los 12 Tiempos Verbales
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Haz clic en cualquier tiempo verbal para comprender visualmente cuándo ocurre la acción en relación con el presente, qué aspecto tiene (puntual vs continuo) y cómo se diferencia de los demás.
        </p>
      </div>

      {/* Interactive Timeline Canvas */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-xl space-y-6">
        {/* Time Axis Labels */}
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3">
          <span className="flex items-center gap-1.5 text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Pasado Remoto y Pasado
          </span>
          <span className="flex items-center gap-1.5 text-indigo-300 font-bold bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            EL PRESENTE (NOW)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Futuro y Metas
          </span>
        </div>

        {/* Scrollable Timeline Grid */}
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="min-w-[850px] grid grid-cols-12 gap-2 relative">
            {/* Guide line across */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />

            {timelineNodes.map((node) => {
              const isSelected = selectedTenseId === node.id;
              let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600';

              if (isSelected) {
                if (node.category === 'past') badgeColor = 'bg-rose-600 text-white border-rose-400 shadow-lg shadow-rose-900/40 ring-2 ring-rose-500/40';
                if (node.category === 'present') badgeColor = 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-900/40 ring-2 ring-indigo-500/40';
                if (node.category === 'future') badgeColor = 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/40 ring-2 ring-emerald-500/40';
              }

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedTenseId(node.id)}
                  className={`relative z-10 p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${badgeColor}`}
                >
                  {/* Visual glyph */}
                  <div className="mb-2">
                    {node.visualType === 'point' && (
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-black/30">
                        ● Puntual
                      </span>
                    )}
                    {node.visualType === 'continuous' && (
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-black/30">
                        〰 Continuo
                      </span>
                    )}
                    {node.visualType === 'bridge' && (
                      <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-black/30">
                        ➔ Conector
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold block leading-tight">
                    {node.label}
                  </span>

                  <span className="text-[10px] text-slate-400 block mt-1.5 line-clamp-2 leading-tight opacity-90">
                    {node.span}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Tense Deep-Dive Card */}
        <div className="pt-4 border-t border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider font-mono">
                {currentTheory.category.toUpperCase()} · NIVEL CEFR: {currentTheory.cefrLevel}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 mt-0.5">
                {currentTheory.name}
                <span className="text-sm font-normal text-slate-400">
                  ({currentTheory.spanishName})
                </span>
              </h2>
            </div>

            {/* Timeline position description badge */}
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="text-slate-400 block text-[10px]">Aspecto temporal:</span>
              <span className="text-white font-semibold">{currentTheory.timelineInfo.timeSpan}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentTheory.summary}
          </p>

          {/* Formulas 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-bold text-emerald-400 font-mono block mb-1">
                (+) Afirmativa
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {currentTheory.formula.positive}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-bold text-rose-400 font-mono block mb-1">
                (-) Negativa
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {currentTheory.formula.negative}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[11px] font-bold text-sky-400 font-mono block mb-1">
                (?) Interrogativa
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {currentTheory.formula.question}
              </p>
            </div>
          </div>

          {/* Real Audio Examples */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ejemplos Prácticos con Pronunciación Nativa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentTheory.usages.map((usage, uIdx) => (
                <div
                  key={`usage-${uIdx}`}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-indigo-300">
                      {usage.title}
                    </span>
                    <p className="text-sm font-semibold text-white">
                      "{usage.exampleEn}"
                    </p>
                    <p className="text-xs text-slate-400">
                      {usage.exampleEs}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => playSentence(usage.exampleEn)}
                    disabled={isPlaying}
                    title="Escuchar pronunciación"
                    className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-white transition-colors shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Common Spanish Pitfalls Box */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-200">
                Trampa habitual de hispanohablantes:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                {currentTheory.spanishPitfalls}
              </p>
            </div>
          </div>

          {/* Time markers / Keywords */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              Marcadores Temporales Clave (Time Markers que delatan este tiempo):
            </span>
            <div className="flex flex-wrap gap-2">
              {currentTheory.timeMarkers.map((marker, mIdx) => (
                <span
                  key={`marker-${mIdx}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-mono text-slate-200 border border-slate-700"
                >
                  {marker}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
