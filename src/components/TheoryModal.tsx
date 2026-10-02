import React, { useState } from 'react';
import { TENSES_THEORY } from '../data/tensesTheory';
import { TenseId, TenseTheory } from '../types';
import { audioService } from '../utils/audio';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  Volume2,
  X,
} from 'lucide-react';

interface TheoryModalProps {
  initialTenseId?: string;
  onClose?: () => void;
  isStandaloneTab?: boolean;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({
  initialTenseId,
  onClose,
  isStandaloneTab = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'present' | 'past' | 'future' | 'mixed'>('all');
  const [expandedTense, setExpandedTense] = useState<string | null>(initialTenseId || 'simple-present');
  const [playingAudio, setPlayingAudio] = useState(false);

  const tensesList = Object.values(TENSES_THEORY);

  const filteredTenses = tensesList.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesCategory;

    const matchesName = item.name.toLowerCase().includes(query) || item.spanishName.toLowerCase().includes(query);
    const matchesMarkers = item.timeMarkers.some((m) => m.toLowerCase().includes(query));
    const matchesSummary = item.summary.toLowerCase().includes(query);
    return matchesCategory && (matchesName || matchesMarkers || matchesSummary);
  });

  const playSentence = async (text: string) => {
    setPlayingAudio(true);
    await audioService.speak(text);
    setPlayingAudio(false);
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Compendio Gramatical de los 12 Tiempos Verbales
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fórmulas estructurales (+, -, ?), marcadores temporales y errores típicos de hispanohablantes.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors self-end sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          {[
            { id: 'all', label: 'Todos (12)' },
            { id: 'present', label: 'Presentes' },
            { id: 'past', label: 'Pasados' },
            { id: 'future', label: 'Futuros' },
            { id: 'mixed', label: 'Contrastes' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tiempo o marcador (ej: since)..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {filteredTenses.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
            <p className="text-sm text-slate-400">
              No se encontraron tiempos verbales que coincidan con "{searchQuery}".
            </p>
          </div>
        ) : (
          filteredTenses.map((tense) => {
            const isExpanded = expandedTense === tense.id;

            return (
              <div
                key={tense.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-indigo-500/50 bg-slate-900/90 shadow-xl'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                {/* Header row / toggle */}
                <button
                  type="button"
                  onClick={() => setExpandedTense(isExpanded ? null : tense.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        tense.category === 'present'
                          ? 'bg-indigo-400'
                          : tense.category === 'past'
                          ? 'bg-rose-400'
                          : tense.category === 'future'
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          {tense.name}
                        </h3>
                        <span className="text-xs text-slate-400 font-normal">
                          · {tense.spanishName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {tense.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      CEFR: {tense.cefrLevel}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-indigo-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 border-t border-slate-800/80 bg-slate-950/50 space-y-6">
                    {/* Summary */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Definición y Propósito
                      </span>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {tense.summary}
                      </p>
                    </div>

                    {/* Formulas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[11px] font-bold text-emerald-400 font-mono block mb-1">
                          (+) Afirmativa
                        </span>
                        <p className="text-xs text-slate-200 font-mono leading-relaxed">
                          {tense.formula.positive}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[11px] font-bold text-rose-400 font-mono block mb-1">
                          (-) Negativa
                        </span>
                        <p className="text-xs text-slate-200 font-mono leading-relaxed">
                          {tense.formula.negative}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                        <span className="text-[11px] font-bold text-sky-400 font-mono block mb-1">
                          (?) Interrogativa
                        </span>
                        <p className="text-xs text-slate-200 font-mono leading-relaxed">
                          {tense.formula.question}
                        </p>
                      </div>
                    </div>

                    {/* Usages with audio */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Usos Principales y Ejemplos de Audio
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tense.usages.map((u, i) => (
                          <div
                            key={`u-${i}`}
                            className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <span className="text-xs font-semibold text-indigo-300 block">
                                {u.title}
                              </span>
                              <p className="text-xs text-slate-300">
                                {u.explanation}
                              </p>
                              <p className="text-xs font-bold text-white pt-1">
                                "{u.exampleEn}"
                              </p>
                              <p className="text-[11px] text-slate-400 italic">
                                {u.exampleEs}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => playSentence(u.exampleEn)}
                              disabled={playingAudio}
                              className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-white transition-colors shrink-0"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Common Pitfalls for Spanish Speakers */}
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-amber-200 block">
                          Errores Típicos de Hispanohablantes:
                        </span>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {tense.spanishPitfalls}
                        </p>
                      </div>
                    </div>

                    {/* Time markers */}
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Marcadores Temporales (Time Markers):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tense.timeMarkers.map((tm, idx) => (
                          <span
                            key={`tm-${idx}`}
                            className="px-2.5 py-1 rounded-md bg-slate-800 text-xs font-mono text-slate-300 border border-slate-700"
                          >
                            {tm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  if (isStandaloneTab) {
    return <div className="max-w-5xl mx-auto pb-12">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        {content}
      </div>
    </div>
  );
};
