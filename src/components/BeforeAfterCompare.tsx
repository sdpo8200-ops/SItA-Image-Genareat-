import React, { useState } from 'react';
import { FaceAnalysisResult, PhotoPreset } from '../types';
import { ShieldCheck, Sparkles, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BeforeAfterCompareProps {
  originalImage: string;
  processedImage: string | null;
  analysis: FaceAnalysisResult | null;
  preset: PhotoPreset;
}

export const BeforeAfterCompare: React.FC<BeforeAfterCompareProps> = ({
  originalImage,
  processedImage,
  analysis,
  preset,
}) => {
  const { language, t } = useLanguage();
  const [mobileTab, setMobileTab] = useState<'processed' | 'original'>('processed');

  const presetName = language === 'bn' ? preset.nameBn : preset.nameEn;
  const analysisMessage = analysis
    ? language === 'bn'
      ? analysis.messageBn
      : analysis.messageEn
    : '';

  return (
    <div className="border border-slate-200 bg-white rounded-2xl p-4 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-sky-600" />
          {t.compareSectionTitle}
        </h3>

        {/* Mobile Tab Switcher */}
        <div className="flex sm:hidden bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setMobileTab('original')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              mobileTab === 'original' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
            }`}
          >
            {t.tabOriginal}
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('processed')}
            className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
              mobileTab === 'processed' ? 'bg-white text-sky-700 shadow-2xs font-semibold' : 'text-slate-500'
            }`}
          >
            {t.tabProcessed}
          </button>
        </div>
      </div>

      {/* Desktop Side-by-Side View */}
      <div className="hidden sm:grid grid-cols-2 gap-3">
        {/* Before */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>{t.originalLabel}</span>
            <span className="text-slate-400">{t.originalUploaded}</span>
          </div>
          <div className="h-44 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-1">
            <img
              src={originalImage}
              alt="Original"
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xs"
            />
          </div>
        </div>

        {/* After */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className="text-sky-700 font-bold flex items-center gap-1 truncate">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="truncate">{t.processedLabel}</span>
            </span>
            <span className="text-emerald-600 font-semibold text-[10px] truncate max-w-[90px]">
              {presetName}
            </span>
          </div>
          <div className="h-44 rounded-xl border border-sky-200 bg-sky-50/40 overflow-hidden flex items-center justify-center p-1 relative">
            {processedImage ? (
              <img
                src={processedImage}
                alt="Processed"
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xs"
              />
            ) : (
              <span className="text-xs text-slate-400 animate-pulse">{t.canvasProcessing}</span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tabbed View */}
      <div className="sm:hidden">
        {mobileTab === 'original' ? (
          <div className="h-56 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center p-2">
            <img src={originalImage} alt="Original" className="max-h-full max-w-full object-contain rounded-lg" />
          </div>
        ) : (
          <div className="h-56 rounded-xl border border-sky-200 bg-sky-50/40 overflow-hidden flex items-center justify-center p-2">
            {processedImage ? (
              <img src={processedImage} alt="Processed" className="max-h-full max-w-full object-contain rounded-lg" />
            ) : (
              <span className="text-xs text-slate-400">{t.canvasProcessing}</span>
            )}
          </div>
        )}
      </div>

      {/* Face Analysis Quality Card */}
      {analysis && (
        <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              {t.faceAnalysisTitle}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
              {Math.round(analysis.confidence * 100)}% {t.faceAccuracy}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">{analysisMessage}</p>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-slate-500 border-t border-sky-100">
            <div>
              {t.alignmentLabel}{' '}
              <strong className="text-slate-700">
                {analysis.eyeAlignment === 'straight' ? t.alignmentStraight : t.alignmentTilted}
              </strong>
            </div>
            <div>
              {t.lightingLabel}{' '}
              <strong className="text-slate-700">
                {analysis.lightingQuality === 'good' ? t.lightingGood : t.lightingPoor}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
