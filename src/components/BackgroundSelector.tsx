import React from 'react';
import { BACKGROUND_COLORS } from '../constants/presets';
import { Palette, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BackgroundSelectorProps {
  selectedColorHex: string;
  onSelectColor: (hex: string) => void;
  isTransparent: boolean;
  onToggleTransparent: (val: boolean) => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  selectedColorHex,
  onSelectColor,
  isTransparent,
  onToggleTransparent,
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-sky-600" />
          {t.bgSectionTitle}
        </label>
        <span className="text-[11px] text-slate-500 font-mono">
          {isTransparent ? t.transparentBadge : selectedColorHex.toUpperCase()}
        </span>
      </div>

      {/* Color swatches */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {BACKGROUND_COLORS.map((bg) => {
          const isSelected = !isTransparent && selectedColorHex.toLowerCase() === bg.hex.toLowerCase();
          const colorName = language === 'bn' ? bg.nameBn : bg.nameEn;

          return (
            <button
              key={bg.id}
              type="button"
              onClick={() => {
                onToggleTransparent(false);
                onSelectColor(bg.hex);
              }}
              title={`${colorName} (${bg.hex})`}
              className={`group relative h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-sky-500 ring-offset-2 border-sky-400 scale-105 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:scale-102'
              }`}
              style={{ backgroundColor: bg.hex }}
            >
              {isSelected && (
                <Check
                  className={`w-4 h-4 ${
                    bg.hex === '#FFFFFF' || bg.hex === '#F8F8F8' || bg.hex === '#EAF6FF' || bg.hex === '#EAF7EA'
                      ? 'text-slate-800'
                      : 'text-white'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Transparent & Custom Color Picker row */}
      <div className="flex items-center gap-3 pt-1">
        {/* Transparent background toggle */}
        <button
          type="button"
          onClick={() => onToggleTransparent(!isTransparent)}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
            isTransparent
              ? 'border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-500'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
          }`}
        >
          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-[conic-gradient(#cbd5e1_90deg,#fff_90deg_180deg,#cbd5e1_180deg_270deg,#fff_270deg)] inline-block" />
          <span>{t.transparentBg}</span>
        </button>

        {/* Custom Color input */}
        <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition-colors">
          <input
            type="color"
            value={selectedColorHex}
            onChange={(e) => {
              onToggleTransparent(false);
              onSelectColor(e.target.value);
            }}
            className="w-4 h-4 rounded-full border-0 p-0 cursor-pointer"
          />
          <span>{t.customColorBtn}</span>
        </label>
      </div>
    </div>
  );
};
