import React from 'react';
import { OUTFIT_OPTIONS } from '../constants/presets';
import { OutfitType } from '../types';
import { Shirt, AlertCircle, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface OutfitSelectorProps {
  selectedOutfit: OutfitType;
  onSelectOutfit: (outfit: OutfitType) => void;
  isProcessingOutfit: boolean;
}

export const OutfitSelector: React.FC<OutfitSelectorProps> = ({
  selectedOutfit,
  onSelectOutfit,
  isProcessingOutfit,
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="border border-slate-200 bg-white rounded-2xl p-4 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
            <Shirt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>{t.outfitSectionTitle}</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {t.outfitOptionalTag}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">{t.outfitSubtitle}</p>
          </div>
        </div>

        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          {t.outfitGeneratedTag}
        </span>
      </div>

      {/* Grid of Outfit choices */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {OUTFIT_OPTIONS.map((outfit) => {
          const isSelected = selectedOutfit === outfit.id;
          const outfitName = language === 'bn' ? outfit.nameBn : outfit.nameEn;
          const outfitDesc = language === 'bn' ? outfit.nameEn : outfit.descriptionBn;

          return (
            <button
              key={outfit.id}
              type="button"
              onClick={() => onSelectOutfit(outfit.id)}
              disabled={isProcessingOutfit}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/80 ring-1 ring-sky-500 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              } ${isProcessingOutfit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-xs text-slate-800">{outfitName}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-sky-600" />}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                {outfitDesc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Official Outfit Disclaimer */}
      <div className="flex items-start gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
        <AlertCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>{t.outfitDisclaimerTitle}</strong> {t.outfitDisclaimerText}
        </p>
      </div>
    </div>
  );
};
