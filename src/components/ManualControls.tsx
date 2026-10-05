import React from 'react';
import { TransformState } from '../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Focus,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ManualControlsProps {
  transform: TransformState;
  onChangeTransform: (newTransform: TransformState) => void;
  onAutoAdjust: () => void;
  showGuides: boolean;
  onToggleGuides: () => void;
}

export const ManualControls: React.FC<ManualControlsProps> = ({
  transform,
  onChangeTransform,
  onAutoAdjust,
  showGuides,
  onToggleGuides,
}) => {
  const { t } = useLanguage();
  const step = 8;

  const handlePan = (dx: number, dy: number) => {
    onChangeTransform({
      ...transform,
      panX: transform.panX + dx,
      panY: transform.panY + dy,
    });
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.5, Math.min(2.5, Number((transform.zoom + delta).toFixed(2))));
    onChangeTransform({
      ...transform,
      zoom: newZoom,
    });
  };

  const handleRotate = (newDeg: number) => {
    onChangeTransform({
      ...transform,
      rotation: Math.max(-15, Math.min(15, newDeg)),
    });
  };

  return (
    <div className="border border-slate-200 bg-white rounded-2xl p-4 space-y-4 shadow-xs">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onAutoAdjust}
          className="flex-1 py-2 px-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Focus className="w-4 h-4" />
          <span>{t.autoAdjustFaceBtn}</span>
        </button>

        <button
          type="button"
          onClick={onToggleGuides}
          className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            showGuides
              ? 'border-sky-500 bg-sky-50 text-sky-700'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
          title={t.guideRulerBtn}
        >
          {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{t.guideRulerBtn}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Zoom Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <ZoomIn className="w-3.5 h-3.5 text-sky-600" /> {t.zoomLabel}
            </span>
            <span className="font-mono text-slate-500 text-[11px]">{Math.round(transform.zoom * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleZoom(-0.05)}
              className="p-1 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.02"
              value={transform.zoom}
              onChange={(e) => handleZoom(Number(e.target.value) - transform.zoom)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <button
              type="button"
              onClick={() => handleZoom(0.05)}
              className="p-1 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Rotation Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5 text-sky-600" /> {t.rotateLabel}
            </span>
            <span className="font-mono text-slate-500 text-[11px]">{transform.rotation}°</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleRotate(transform.rotation - 1)}
              className="p-1 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="-15"
              max="15"
              step="0.5"
              value={transform.rotation}
              onChange={(e) => handleRotate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <button
              type="button"
              onClick={() => handleRotate(transform.rotation + 1)}
              className="p-1 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pan Direction Pad */}
        <div className="space-y-1.5">
          <span className="font-semibold text-slate-700 text-xs block">{t.panLabel}</span>
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => handlePan(-step, 0)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 text-xs flex items-center gap-0.5 cursor-pointer"
              title={t.panLeft}
            >
              <ArrowLeft className="w-3 h-3" />
            </button>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => handlePan(0, -step)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 text-xs flex items-center justify-center cursor-pointer"
                title={t.panUp}
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handlePan(0, step)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 text-xs flex items-center justify-center cursor-pointer"
                title={t.panDown}
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => handlePan(step, 0)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 text-xs flex items-center gap-0.5 cursor-pointer"
              title={t.panRight}
            >
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
