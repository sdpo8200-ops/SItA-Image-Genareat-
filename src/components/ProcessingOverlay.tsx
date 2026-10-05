import React from 'react';
import { ProcessingStep } from '../types';
import { Sparkles, Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ProcessingOverlayProps {
  currentStep: ProcessingStep;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({ currentStep }) => {
  const { t } = useLanguage();

  if (currentStep === 'idle') return null;

  const STEPS: { id: ProcessingStep; label: string }[] = [
    { id: 'analyzing', label: t.stepAnalyzing },
    { id: 'removing_bg', label: t.stepRemovingBg },
    { id: 'adjusting_face', label: t.stepAdjustingFace },
    { id: 'enhancing', label: t.stepEnhancing },
    { id: 'upscaling', label: t.stepUpscaling },
  ];

  const currentIdx = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sky-100 text-center space-y-6">
        {/* Animated Glow Icon */}
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-sky-400 blur-lg opacity-40 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-lg">
            {currentStep === 'ready' ? (
              <Check className="w-8 h-8 text-white animate-bounce" />
            ) : (
              <Sparkles className="w-8 h-8 text-white animate-spin" />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            {currentStep === 'ready' ? t.stepReadyTitle : t.stepProcessingTitle}
          </h3>
          <p className="text-xs text-slate-500">
            {currentStep === 'ready' ? t.stepReadySubtitle : t.stepProcessingSubtitle}
          </p>
        </div>

        {/* Multi-Step Indicator */}
        <div className="space-y-2.5 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
          {STEPS.map((step, idx) => {
            const isDone = currentIdx > idx || currentStep === 'ready';
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 text-xs transition-all ${
                  isCurrent
                    ? 'text-sky-700 font-bold scale-[1.02]'
                    : isDone
                    ? 'text-emerald-700 font-medium'
                    : 'text-slate-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-700 font-bold'
                      : isCurrent
                      ? 'bg-sky-600 text-white font-bold'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3 h-3" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Privacy reminder inside modal */}
        <p className="text-[11px] text-slate-400">{t.processingPrivacyNote}</p>
      </div>
    </div>
  );
};
