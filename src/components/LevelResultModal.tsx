import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { LevelInfo } from '../types';
import { useStudent } from '../context/StudentContext';
import { Award, CheckCircle2, RotateCw, Sparkles, XCircle } from 'lucide-react';

interface LevelResultModalProps {
  level: LevelInfo;
  score: number;
  total: number;
  passed: boolean;
  onRetry: () => void;
  onContinue: () => void;
  onOpenCertificate: () => void;
  onOpenTheory: () => void;
}

export const LevelResultModal: React.FC<LevelResultModalProps> = ({
  level,
  score,
  total,
  passed,
  onRetry,
  onContinue,
  onOpenCertificate,
  onOpenTheory,
}) => {
  const { profile } = useStudent();
  const percentage = Math.round((score / total) * 100);

  useEffect(() => {
    if (passed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  }, [passed]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden">
        {/* Ambient glow */}
        <div
          className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
            passed ? 'bg-emerald-500/20' : 'bg-rose-500/10'
          }`}
        />

        {/* Icon & Title */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              passed
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                : 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
            }`}
          >
            {passed ? (
              level.isFinalExam ? (
                <Award className="w-9 h-9 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              )
            ) : (
              <XCircle className="w-9 h-9 text-rose-400" />
            )}
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {passed
            ? level.isFinalExam
              ? '¡Felicidades! Examen C1 Superado'
              : '¡Nivel Completado y Aprobado!'
            : 'Nivel No Superado'}
        </h3>

        <p className="text-xs text-slate-400 mt-1">
          {level.title}
        </p>

        {/* Score circular badge */}
        <div className="my-6 p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-around">
          <div>
            <span className="text-xs text-slate-400 block">Puntaje</span>
            <span className="text-2xl font-bold font-mono text-white">
              {score} / {total}
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div>
            <span className="text-xs text-slate-400 block">Porcentaje</span>
            <span
              className={`text-2xl font-bold font-mono ${
                passed ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {percentage}%
            </span>
          </div>

          <div className="h-8 w-px bg-slate-800" />

          <div>
            <span className="text-xs text-slate-400 block">Requerido</span>
            <span className="text-2xl font-bold font-mono text-slate-300">
              {level.passingPercentage}%
            </span>
          </div>
        </div>

        {/* Feedback message */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          {passed ? (
            level.isFinalExam ? (
              <span>
                Has demostrado maestría rigurosa en todos los 12 tiempos verbales de la lengua inglesa. Tu Certificado Oficial ha sido emitido a nombre de{' '}
                <strong className="text-white">{profile.studentName || 'Estudiante'}</strong>.
              </span>
            ) : (
              <span>
                ¡Excelente trabajo! Has superado el umbral del 80% y desbloqueado exitosamente el siguiente paso de tu ruta formativa.
              </span>
            )
          ) : (
            <span>
              Has obtenido un <strong>{percentage}%</strong>. Recuerda que la metodología exige al menos un <strong>{level.passingPercentage}% de aciertos</strong> para desbloquear el siguiente nivel y garantizar un aprendizaje sólido sin vacíos.
            </span>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {passed ? (
            level.isFinalExam ? (
              <button
                type="button"
                onClick={onOpenCertificate}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Ver y Descargar Certificado</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onContinue}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Continuar Siguiente Nivel →</span>
              </button>
            )
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenTheory}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Repasar Teoría
              </button>
              <button
                type="button"
                onClick={onRetry}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                <span>Reintentar Nivel</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
