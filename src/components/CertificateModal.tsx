import React, { useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { Award, CheckCircle2, Lock, Pencil, Printer, ShieldCheck, Sparkles, X } from 'lucide-react';

interface CertificateModalProps {
  onClose?: () => void;
  isStandaloneTab?: boolean;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  onClose,
  isStandaloneTab = false,
}) => {
  const { profile, setStudentName, issueCertificateId } = useStudent();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profile.studentName);

  const certId = profile.certificateId || (profile.finalExamPassed ? issueCertificateId() : 'TVM-2026-LOCKED');
  const issueDate = profile.finalExamCompletedAt
    ? new Date(profile.finalExamCompletedAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const handlePrint = () => {
    window.print();
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      setStudentName(tempName);
      setIsEditingName(false);
    }
  };

  // If student hasn't passed final exam, show requirement screen
  if (!profile.finalExamPassed) {
    const lockedContent = (
      <div className="max-w-2xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Certificado Oficial de Maestría en Tiempos Verbales
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Para expedir tu Diploma oficial con código de verificación, debes completar la ruta formativa y superar el <strong className="text-amber-300">Examen Final C1</strong> con un mínimo del <strong>80% de aciertos</strong>.
          </p>
        </div>

        {/* Progress tracker */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progreso para desbloquear el diploma:</span>
            <span className="font-mono font-bold text-indigo-400">
              Nivel actual: {profile.unlockedLevelIndex + 1} de 5
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.round((profile.unlockedLevelIndex / 4) * 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500">
            Requisito: Supera Nivel 1 (Presentes) ➔ Nivel 2 (Pasados) ➔ Nivel 3 (Futuros) ➔ Nivel 4 (Avanzados) ➔ Examen Final.
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Volver a la Ruta de Aprendizaje
          </button>
        )}
      </div>
    );

    if (isStandaloneTab) return <div className="pb-12">{lockedContent}</div>;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        {lockedContent}
      </div>
    );
  }

  // Certificate unlocked view!
  const certificateContent = (
    <div className="space-y-6">
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Certificado Oficial Aprobado</h2>
            <p className="text-xs text-slate-400">Listo para imprimir o guardar como documento PDF</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditingName(!isEditingName)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Editar Nombre</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Guardar PDF</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Name edit form if toggled */}
      {isEditingName && (
        <form
          onSubmit={handleSaveName}
          className="no-print p-4 rounded-xl bg-slate-900 border border-indigo-500/40 flex items-center gap-3"
        >
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            placeholder="Escribe tu nombre completo..."
            className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
          >
            Guardar en Diploma
          </button>
        </form>
      )}

      {/* PRINTABLE DIPLOMA FRAME */}
      <div
        id="printable-certificate"
        className="relative bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border-8 border-double border-amber-600/60 overflow-hidden font-serif max-w-4xl mx-auto"
      >
        {/* Subtle decorative inner border */}
        <div className="absolute inset-3 border-2 border-amber-700/30 pointer-events-none rounded-lg" />

        <div className="relative z-10 text-center space-y-6">
          {/* Institution Header */}
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-[0.3em] font-sans font-bold text-amber-800 block">
              ACADEMIA DE ESTUDIOS GRAMATICALES DEL IDIOMA INGLÉS
            </span>
            <span className="text-[11px] font-sans text-slate-500 tracking-wider uppercase block">
              DEPARTAMENTO PEDAGÓGICO DE EVALUACIÓN Y CERTIFICACIÓN
            </span>
          </div>

          {/* Certificate Title */}
          <div className="pt-2">
            <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-wider uppercase">
              Certificado de Maestría
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-600 tracking-widest uppercase mt-1">
              English Verb Tenses & Structural Syntax Proficiency (CEFR C1)
            </p>
          </div>

          {/* Awarded to */}
          <div className="pt-2 space-y-2">
            <p className="font-sans text-xs italic text-slate-500">
              Se otorga con distinción y reconocimiento académico a:
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight border-b-2 border-amber-600/40 pb-2 inline-block px-8 min-w-[300px]">
              {profile.studentName || 'Estudiante Sobresaliente'}
            </h2>
          </div>

          {/* Achievement Description */}
          <p className="font-sans text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl mx-auto">
            Por haber superado satisfactoriamente la ruta secuencial de formación gramatical y acreditado maestría evaluativa con un puntaje final de{' '}
            <strong className="text-slate-950 font-bold">{profile.finalScore || 100}%</strong> en los{' '}
            <strong>12 Tiempos Verbales del Inglés</strong> (Present, Past, Future, Continuous, Perfect & Mixed Aspect Structures).
          </p>

          {/* Golden Seal & Signatures Grid */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 items-center gap-6 border-t border-slate-200">
            {/* Left signature */}
            <div className="space-y-1 text-center sm:text-left">
              <div className="font-display text-base italic text-slate-800">
                Dr. Alistair Vance, Ph.D.
              </div>
              <div className="w-36 h-0.5 bg-slate-400 mx-auto sm:mx-0" />
              <p className="font-sans text-[10px] text-slate-500 uppercase tracking-wider">
                Director de Lingüística Aplicada
              </p>
            </div>

            {/* Center Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-amber-500 bg-amber-50 shadow-inner flex items-center justify-center p-1 overflow-hidden">
                <img
                  src="/src/assets/images/certificate_seal_gold_1790965928676.jpg"
                  alt="Sello Dorado de Excelencia Académica"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to stylized SVG
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="font-sans text-[9px] font-bold tracking-widest text-amber-900 uppercase mt-1">
                SELLO OFICIAL VERIFICADO
              </span>
            </div>

            {/* Right signature & Code */}
            <div className="space-y-1 text-center sm:text-right">
              <div className="font-sans text-xs font-mono font-bold text-slate-800">
                {certId}
              </div>
              <div className="w-36 h-0.5 bg-slate-400 mx-auto sm:ml-auto" />
              <p className="font-sans text-[10px] text-slate-500 uppercase tracking-wider">
                Fecha de Emisión: {issueDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isStandaloneTab) {
    return <div className="max-w-5xl mx-auto pb-12">{certificateContent}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        {certificateContent}
      </div>
    </div>
  );
};
