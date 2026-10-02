import React from 'react';
import { useStudent } from '../context/StudentContext';
import { audioService } from '../utils/audio';
import { CheckCircle2, RotateCw, Trash2, Volume2, XCircle } from 'lucide-react';

interface MistakesReviewModalProps {
  isStandaloneTab?: boolean;
}

export const MistakesReviewModal: React.FC<MistakesReviewModalProps> = ({
  isStandaloneTab = false,
}) => {
  const { profile, clearMistake } = useStudent();

  const handleSpeak = (text: string) => {
    audioService.speak(text);
  };

  const content = (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Cuaderno de Repaso de Errores
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Aprender de los fallos es el método más rápido para afianzar la gramática en inglés. Aquí quedan registradas las preguntas que fallaste para que puedas analizarlas.
        </p>
      </div>

      {profile.mistakes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">¡No tienes errores pendientes!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Excelente rendimiento. A medida que realices ejercicios y exámenes, cualquier respuesta incorrecta se archivará aquí automáticamente para su repaso.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{profile.mistakes.length} preguntas guardadas para análisis</span>
            <span className="text-[11px] text-indigo-400">+20 XP por cada error repasado y corregido</span>
          </div>

          {profile.mistakes.map((m, idx) => (
            <div
              key={`${m.questionId}-${idx}`}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">
                    {m.tenseId.replace(/-/g, ' ')} · Registrado: {m.date}
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {m.prompt}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSpeak(m.prompt)}
                    title="Escuchar"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => clearMistake(m.questionId)}
                    title="Marcar como dominado"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ya lo aprendí (+20 XP)</span>
                  </button>
                </div>
              </div>

              {/* Contrast User vs Correct */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Tu respuesta anterior:</span>
                    <span className="font-mono text-white line-through">{m.userChoice}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Respuesta correcta:</span>
                    <span className="font-mono text-white font-bold">{m.correctAnswer}</span>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong className="text-indigo-300 block mb-0.5">Explicación gramatical:</strong>
                {m.explanation}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return <div className="max-w-4xl mx-auto pb-12">{content}</div>;
};
