/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudentProvider, useStudent } from './context/StudentContext';
import { Navbar } from './components/Navbar';
import { RoadmapView } from './components/RoadmapView';
import { QuizEngine } from './components/QuizEngine';
import { LevelResultModal } from './components/LevelResultModal';
import { TimelineVisualizer } from './components/TimelineVisualizer';
import { TheoryModal } from './components/TheoryModal';
import { CertificateModal } from './components/CertificateModal';
import { MistakesReviewModal } from './components/MistakesReviewModal';
import { StudentWelcomeModal } from './components/StudentWelcomeModal';
import { LevelInfo } from './types';
import { LEVELS } from './data/tensesTheory';

function MainApp() {
  const { profile, recordLevelCompletion } = useStudent();
  const [currentTab, setCurrentTab] = useState<'roadmap' | 'timeline' | 'theory' | 'mistakes' | 'certificate'>('roadmap');
  const [activeLevel, setActiveLevel] = useState<LevelInfo | null>(null);
  const [theoryModalTense, setTheoryModalTense] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(!profile.studentName);

  // Result state
  const [lastQuizResult, setLastQuizResult] = useState<{
    show: boolean;
    level: LevelInfo;
    score: number;
    total: number;
    passed: boolean;
  } | null>(null);

  const handleSelectLevel = (level: LevelInfo) => {
    setActiveLevel(level);
  };

  const handleQuizComplete = (score: number, total: number, passed: boolean) => {
    if (!activeLevel) return;
    recordLevelCompletion(activeLevel.id, score, total, passed);
    setLastQuizResult({
      show: true,
      level: activeLevel,
      score,
      total,
      passed,
    });
  };

  const handleRetryCurrentLevel = () => {
    setLastQuizResult(null);
    // Restart active level with fresh shuffle
    if (activeLevel) {
      setActiveLevel({ ...activeLevel });
    }
  };

  const handleContinueNextLevel = () => {
    const currentIdx = activeLevel?.index ?? 0;
    setLastQuizResult(null);
    setActiveLevel(null);
    // If there is a next level, set it or return to roadmap
    const nextLevel = LEVELS[currentIdx + 1];
    if (nextLevel) {
      setActiveLevel(nextLevel);
    } else {
      setCurrentTab('roadmap');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setActiveLevel(null);
          setLastQuizResult(null);
          setCurrentTab(tab);
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Active Quiz in progress */}
        {activeLevel ? (
          <QuizEngine
            level={activeLevel}
            onExit={() => setActiveLevel(null)}
            onComplete={handleQuizComplete}
            onOpenTheory={(tId) => setTheoryModalTense(tId || 'simple-present')}
          />
        ) : (
          <>
            {/* View by selected navigation tab */}
            {currentTab === 'roadmap' && (
              <RoadmapView
                onSelectLevel={handleSelectLevel}
                onOpenTheory={(tId) => setTheoryModalTense(tId || 'simple-present')}
                onOpenCertificate={() => setCurrentTab('certificate')}
              />
            )}

            {currentTab === 'timeline' && <TimelineVisualizer />}

            {currentTab === 'theory' && <TheoryModal isStandaloneTab={true} />}

            {currentTab === 'mistakes' && <MistakesReviewModal isStandaloneTab={true} />}

            {currentTab === 'certificate' && <CertificateModal isStandaloneTab={true} />}
          </>
        )}
      </main>

      {/* Quiz Completion Result Modal */}
      {lastQuizResult?.show && (
        <LevelResultModal
          level={lastQuizResult.level}
          score={lastQuizResult.score}
          total={lastQuizResult.total}
          passed={lastQuizResult.passed}
          onRetry={handleRetryCurrentLevel}
          onContinue={handleContinueNextLevel}
          onOpenCertificate={() => {
            setLastQuizResult(null);
            setActiveLevel(null);
            setCurrentTab('certificate');
          }}
          onOpenTheory={() => {
            const firstTense = lastQuizResult.level.tenses[0];
            setTheoryModalTense(firstTense);
          }}
        />
      )}

      {/* Quick Theory Drawer Modal when triggered from Roadmap */}
      {theoryModalTense && (
        <TheoryModal
          initialTenseId={theoryModalTense}
          onClose={() => setTheoryModalTense(null)}
        />
      )}

      {/* Student Welcome / Profile Identification Modal */}
      <StudentWelcomeModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-medium text-slate-400">
            Tiempos Verbales Master · Plataforma Pedagógica de Progresión Secuencial Estricta
          </p>
          <div className="flex items-center justify-center gap-3 text-slate-400">
            <span>12 Tiempos Verbales en Inglés</span>
            <span aria-hidden="true">·</span>
            <span>Respuestas Dinámicamente Intercaladas</span>
            <span aria-hidden="true">·</span>
            <span>Certificación CEFR C1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StudentProvider>
      <MainApp />
    </StudentProvider>
  );
}
