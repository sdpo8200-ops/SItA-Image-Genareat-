import React from 'react';
import { PHOTO_PRESETS } from '../constants/presets';
import { PhotoPreset } from '../types';
import { calculateOutputPixels } from '../utils/imageMath';
import { Sliders, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PresetSelectorProps {
  selectedPreset: PhotoPreset;
  onSelectPreset: (preset: PhotoPreset) => void;
  dpi: number;
  onChangeDpi: (dpi: number) => void;
  customWidthMm: number;
  customHeightMm: number;
  onChangeCustomDimensions: (w: number, h: number) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  dpi,
  onChangeDpi,
  customWidthMm,
  customHeightMm,
  onChangeCustomDimensions,
}) => {
  const { language, t } = useLanguage();
  const currentW = selectedPreset.id === 'custom' ? customWidthMm : selectedPreset.widthMm;
  const currentH = selectedPreset.id === 'custom' ? customHeightMm : selectedPreset.heightMm;
  const { widthPx, heightPx } = calculateOutputPixels(currentW, currentH, dpi);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-sky-600" />
          {t.presetSectionTitle}
        </label>
        <span className="text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
          {widthPx} × {heightPx} px
        </span>
      </div>

      {/* Preset Grid Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PHOTO_PRESETS.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          const displayName = language === 'bn' ? preset.nameBn : preset.nameEn;
          const secondaryName = language === 'bn' ? preset.nameEn : `${preset.widthMm}mm × ${preset.heightMm}mm`;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`p-2.5 text-left rounded-xl border transition-all text-xs flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/70 shadow-xs ring-1 ring-sky-500'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-1 w-full">
                <span className="font-semibold text-slate-800">{displayName}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {preset.id === 'custom'
                    ? (language === 'bn' ? 'কাস্টম সাইজ' : 'Custom Dimensions')
                    : `${preset.widthMm}mm × ${preset.heightMm}mm`}
                </span>
                <span className="text-slate-400">{secondaryName}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom size inputs if 'custom' is active */}
      {selectedPreset.id === 'custom' && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <p className="text-xs font-semibold text-slate-700">{t.customSizeBoxTitle}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">{t.widthMmLabel}</label>
              <input
                type="number"
                min="10"
                max="300"
                value={customWidthMm}
                onChange={(e) =>
                  onChangeCustomDimensions(Math.max(10, Number(e.target.value) || 10), customHeightMm)
                }
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-600 block mb-1">{t.heightMmLabel}</label>
              <input
                type="number"
                min="10"
                max="300"
                value={customHeightMm}
                onChange={(e) =>
                  onChangeCustomDimensions(customWidthMm, Math.max(10, Number(e.target.value) || 10))
                }
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* DPI Selector and Resolution Summary */}
      <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-700 font-medium">{t.printResolutionLabel}</span>
          <select
            value={dpi}
            onChange={(e) => onChangeDpi(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-sky-500 cursor-pointer"
          >
            <option value={150}>{t.dpiWeb}</option>
            <option value={300}>{t.dpiStandard}</option>
            <option value={600}>{t.dpiUltra}</option>
          </select>
        </div>
        <span className="text-[11px] text-slate-500">
          {t.outputLabel} <strong className="text-slate-700 font-bold">{widthPx}×{heightPx}</strong> {t.pixelsUnit}
        </span>
      </div>
    </div>
  );
};
