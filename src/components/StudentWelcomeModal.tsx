import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { CheckCircle2, Lock, Shuffle, Sparkles, UserCheck } from 'lucide-react';

interface StudentWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentWelcomeModal: React.FC<StudentWelcomeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, setStudentName } = useStudent();
  const [nameInput, setNameInput] = useState(profile.studentName || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      setError('Por favor ingresa tu nombre para personalizar tu ruta y expedir tu Certificado.');
      return;
    }
    setStudentName(nameInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Bienvenido a Tiempos Verbales Master
            </h2>
            <p className="text-xs text-slate-400">
              Plataforma pedagógica de maestría en los 12 tiempos en inglés
            </p>
          </div>
        </div>

        {/* Essential Pedagogical Principles */}
        <div className="space-y-3 my-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded bg-amber-500/10 text-amber-400 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-200">
                1. Ruta Secuencial Estricta (Sin Atajos)
              </p>
              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                No es posible saltarse niveles ni ingresar directamente al Examen Final. Debes aprobar cada nivel con mínimo un 80% para desbloquear el siguiente.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
              <Shuffle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-200">
                2. Respuestas Dinámicamente Intercaladas
              </p>
              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                Las opciones de respuesta (A, B, C, D) se barajan aleatoriamente en cada intento. Es imposible adivinar por patrones fijos; premia el conocimiento genuino.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1 rounded bg-sky-500/10 text-sky-400 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-sky-200">
                3. Certificado Oficial de Aprobación C1
              </p>
              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                Al completar la ruta y superar el Examen Final de 30 preguntas, se emitirá tu Diploma de Maestría con código verificable y tu nombre oficial.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ingresa tu nombre y apellido (tal como aparecerá en tu Certificado):
            </label>
            <div className="relative">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setError('');
                }}
                placeholder="Ejemplo: Carlos Mendoza Silva"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                autoFocus
              />
              <UserCheck className="absolute right-3.5 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            {profile.studentName && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cerrar
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              Comenzar Mi Ruta de Aprendizaje →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
