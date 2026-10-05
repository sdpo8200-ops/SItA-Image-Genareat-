import React, { useState } from 'react';
import { Maximize2, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface UpscaleSectionProps {
  originalWidth: number;
  originalHeight: number;
  onTriggerUpscale: (factor: 2 | 4) => Promise<void>;
  isUpscaling: boolean;
  upscaledFactor: number | null;
}

export const UpscaleSection: React.FC<UpscaleSectionProps> = ({
  originalWidth,
  originalHeight,
  onTriggerUpscale,
  isUpscaling,
  upscaledFactor,
}) => {
  const { t } = useLanguage();
  const [selectedFactor, setSelectedFactor] = useState<2 | 4>(2);

  const handleApply = async () => {
    await onTriggerUpscale(selectedFactor);
  };

  return (
    <div className="border border-slate-200 bg-white rounded-2xl p-4 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
            <Maximize2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t.upscaleSectionTitle}
            </h3>
            <p className="text-[11px] text-slate-500">{t.upscaleSubtitle}</p>
          </div>
        </div>

        {upscaledFactor && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {upscaledFactor}× {t.upscaleActiveTag}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setSelectedFactor(2)}
          disabled={isUpscaling}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
            selectedFactor === 2
              ? 'border-sky-500 bg-sky-50/80 ring-1 ring-sky-500 shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="block text-base font-bold text-slate-800">{t.upscale2xTitle}</span>
          <span className="block text-[11px] text-slate-500 mt-0.5">
            {originalWidth * 2} × {originalHeight * 2} px
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFactor(4)}
          disabled={isUpscaling}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
            selectedFactor === 4
              ? 'border-sky-500 bg-sky-50/80 ring-1 ring-sky-500 shadow-xs'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          }`}
        >
          <span className="block text-base font-bold text-slate-800">{t.upscale4xTitle}</span>
          <span className="block text-[11px] text-slate-500 mt-0.5">
            {originalWidth * 4} × {originalHeight * 4} px
          </span>
        </button>
      </div>

      {/* Resolution Compare Stats */}
      <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block">{t.originalResolution}</span>
          <strong className="text-slate-700 font-semibold">{originalWidth} × {originalHeight} px</strong>
        </div>

        <ArrowRight className="w-4 h-4 text-sky-500" />

        <div className="text-right">
          <span className="text-[10px] text-slate-500 block">{t.enhancedResolution}</span>
          <strong className="text-sky-700 font-bold">
            {originalWidth * selectedFactor} × {originalHeight * selectedFactor} px
          </strong>
        </div>
      </div>

      <button
        type="button"
        onClick={handleApply}
        disabled={isUpscaling}
        className="w-full py-2 px-3 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
      >
        {isUpscaling ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t.upscaleRunning}</span>
          </>
        ) : (
          <>
            <Maximize2 className="w-4 h-4" />
            <span>{selectedFactor}× {t.upscaleRunBtn}</span>
          </>
        )}
      </button>
    </div>
  );
};
