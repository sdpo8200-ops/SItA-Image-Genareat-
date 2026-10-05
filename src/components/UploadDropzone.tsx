import React, { useState, useRef } from 'react';
import { Upload, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { generateSamplePortrait } from '../utils/sampleImages';
import { useLanguage } from '../context/LanguageContext';

interface UploadDropzoneProps {
  onImageSelected: (dataUrl: string, fileInfo: { name: string; size: number }) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onImageSelected }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcess = (file: File) => {
    setError(null);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError(t.errInvalidFormat);
      return;
    }

    // 15MB limit
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(t.errSizeLimit);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onImageSelected(dataUrl, { name: file.name, size: file.size });
      }
    };
    reader.onerror = () => {
      setError(t.errReadFailed);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUseSample = () => {
    const sampleDataUrl = generateSamplePortrait();
    onImageSelected(sampleDataUrl, { name: 'sample_portrait.jpg', size: 1024 * 350 });
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-sky-500 bg-sky-50/80 scale-[1.01]'
            : 'border-slate-300 hover:border-sky-400 bg-white hover:bg-sky-50/20 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              validateAndProcess(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
            <Upload className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-800">
              {t.dropzoneTitle}
            </p>
            <p className="text-xs text-slate-500">
              {t.dropzoneFormats}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {t.badgeFaceDetect}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {t.badgeRealBg}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {t.badgeOfficialCrop}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Try with sample button */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-100 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <span className="text-slate-700 font-medium">{t.noPhotoPrompt}</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleUseSample();
          }}
          className="px-3 py-1.5 bg-white hover:bg-sky-600 hover:text-white text-sky-700 border border-sky-200 rounded-lg font-semibold transition-all shadow-xs cursor-pointer"
        >
          {t.trySampleBtn}
        </button>
      </div>
    </div>
  );
};
