import React, { useState } from 'react';
import { EnhancementSettings, Level } from '../types';
import { Sparkles, ShieldCheck, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface EnhancementPanelProps {
  enhancements: EnhancementSettings;
  onChangeEnhancement: (key: keyof EnhancementSettings, value: Level) => void;
  onResetAll: () => void;
}

interface EnhancementFieldDef {
  key: keyof EnhancementSettings;
  labelKey:
    | 'enhBeauty'
    | 'enhSmoothSkin'
    | 'enhBrightness'
    | 'enhContrast'
    | 'enhSharpness'
    | 'enhFaceEnhance'
    | 'enhEyeEnhance'
    | 'enhTeethEnhance'
    | 'enhHairEnhance'
    | 'enhBeardEnhance'
    | 'enhNoiseReduction'
    | 'enhSkinTone'
    | 'enhColorCorrection';
  descKey:
    | 'enhBeautyDesc'
    | 'enhSmoothSkinDesc'
    | 'enhBrightnessDesc'
    | 'enhContrastDesc'
    | 'enhSharpnessDesc'
    | 'enhFaceEnhanceDesc'
    | 'enhEyeEnhanceDesc'
    | 'enhTeethEnhanceDesc'
    | 'enhHairEnhanceDesc'
    | 'enhBeardEnhanceDesc'
    | 'enhNoiseReductionDesc'
    | 'enhSkinToneDesc'
    | 'enhColorCorrectionDesc';
}

const ENHANCEMENT_FIELDS: EnhancementFieldDef[] = [
  { key: 'beauty', labelKey: 'enhBeauty', descKey: 'enhBeautyDesc' },
  { key: 'smoothSkin', labelKey: 'enhSmoothSkin', descKey: 'enhSmoothSkinDesc' },
  { key: 'brightness', labelKey: 'enhBrightness', descKey: 'enhBrightnessDesc' },
  { key: 'contrast', labelKey: 'enhContrast', descKey: 'enhContrastDesc' },
  { key: 'sharpness', labelKey: 'enhSharpness', descKey: 'enhSharpnessDesc' },
  { key: 'faceEnhance', labelKey: 'enhFaceEnhance', descKey: 'enhFaceEnhanceDesc' },
  { key: 'eyeEnhance', labelKey: 'enhEyeEnhance', descKey: 'enhEyeEnhanceDesc' },
  { key: 'teethEnhance', labelKey: 'enhTeethEnhance', descKey: 'enhTeethEnhanceDesc' },
  { key: 'hairEnhance', labelKey: 'enhHairEnhance', descKey: 'enhHairEnhanceDesc' },
  { key: 'beardEnhance', labelKey: 'enhBeardEnhance', descKey: 'enhBeardEnhanceDesc' },
  { key: 'noiseReduction', labelKey: 'enhNoiseReduction', descKey: 'enhNoiseReductionDesc' },
  { key: 'skinTone', labelKey: 'enhSkinTone', descKey: 'enhSkinToneDesc' },
  { key: 'colorCorrection', labelKey: 'enhColorCorrection', descKey: 'enhColorCorrectionDesc' },
];

const LEVELS: Level[] = ['OFF', 'LOW', 'MEDIUM', 'HIGH'];

export const EnhancementPanel: React.FC<EnhancementPanelProps> = ({
  enhancements,
  onChangeEnhancement,
  onResetAll,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);

  const getLevelLabel = (lvl: Level) => {
    switch (lvl) {
      case 'OFF':
        return t.levelOff;
      case 'LOW':
        return t.levelLow;
      case 'MEDIUM':
        return t.levelMed;
      case 'HIGH':
        return t.levelHigh;
    }
  };

  return (
    <div className="border border-slate-200 bg-white rounded-2xl p-4 space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              {t.enhanceSectionTitle}
            </h3>
            <p className="text-[11px] text-slate-500">{t.enhanceSectionSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetAll}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={t.resetAllTooltip}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Safety Badge */}
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-800">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{t.safeguardNotice}</span>
      </div>

      {/* List of Controls */}
      {isOpen && (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {ENHANCEMENT_FIELDS.map((item) => {
            const currentVal = enhancements[item.key];
            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50/70 hover:bg-slate-100/60 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{t[item.labelKey]}</p>
                  <p className="text-[10px] text-slate-500 truncate">{t[item.descKey]}</p>
                </div>

                {/* Level segmented button */}
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shrink-0 shadow-2xs">
                  {LEVELS.map((lvl) => {
                    const isSelected = currentVal === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => onChangeEnhancement(item.key, lvl)}
                        className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {getLevelLabel(lvl)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
