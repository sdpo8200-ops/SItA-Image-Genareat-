import React, { useState, useEffect, useRef } from 'react';
import { BusinessSettings, PhotoPreset, PrintSheetConfig } from '../types';
import { generateA4PrintSheet } from '../utils/printSheetGenerator';
import { Printer, Download, X, Copy, Scissors, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PrintSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoDataUrl: string;
  preset: PhotoPreset;
  dpi: number;
  business: BusinessSettings;
}

export const PrintSheetModal: React.FC<PrintSheetModalProps> = ({
  isOpen,
  onClose,
  photoDataUrl,
  preset,
  dpi,
  business,
}) => {
  const { language, t } = useLanguage();
  const [copies, setCopies] = useState<4 | 6 | 8 | 12>(8);
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const [showStudioHeader, setShowStudioHeader] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [sheetPreviewUrl, setSheetPreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen || !photoDataUrl) return;

    let isMounted = true;
    const generate = async () => {
      setIsGenerating(true);
      try {
        const config: PrintSheetConfig = {
          copies,
          paperSize: 'A4',
          showCropMarks,
          showStudioHeader,
          sheetOrientation: 'portrait',
        };

        const canvas = await generateA4PrintSheet(photoDataUrl, preset, dpi, config, business);
        if (!isMounted) return;
        canvasRef.current = canvas;
        setSheetPreviewUrl(canvas.toDataURL('image/jpeg', 0.95));
      } catch (err) {
        console.error('Print sheet generation failed:', err);
      } finally {
        if (isMounted) setIsGenerating(false);
      }
    };

    generate();

    return () => {
      isMounted = false;
    };
  }, [isOpen, photoDataUrl, preset, dpi, copies, showCropMarks, showStudioHeader, business]);

  if (!isOpen) return null;

  const handleDownload = (format: 'jpg' | 'png') => {
    if (!canvasRef.current) return;
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvasRef.current.toDataURL(mime, 0.98);
    const link = document.createElement('a');
    link.download = `SITA_A4_PrintSheet_${copies}_Copies_${preset.widthMm}x${preset.heightMm}mm.${format}`;
    link.href = dataUrl;
    link.click();
  };

  const handlePrint = () => {
    if (!sheetPreviewUrl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SITA AI Photo Studio - A4 Print Sheet</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              background: #fff;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            img {
              width: 100vw;
              height: 100vh;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <img src="${sheetPreviewUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-2xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {t.sheetModalTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.sheetModalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto flex-1">
          {/* Controls Column */}
          <div className="space-y-5 md:col-span-1">
            {/* Copies Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-sky-600" />
                {t.copiesCountLabel}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {([4, 6, 8, 12] as const).map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCopies(num)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      copies === num
                        ? 'border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-500 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {language === 'bn' ? `${num} কপি (${num} Copies)` : `${num} Copies`}
                  </button>
                ))}
              </div>
            </div>

            {/* Print Options */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.optionsLabel}
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCropMarks}
                  onChange={(e) => setShowCropMarks(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <Scissors className="w-4 h-4 text-slate-500" />
                <span>{t.cropMarksCheckbox}</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showStudioHeader}
                  onChange={(e) => setShowStudioHeader(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded-md border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <FileText className="w-4 h-4 text-slate-500" />
                <span>{t.studioHeaderCheckbox}</span>
              </label>
            </div>

            {/* Print Sheet Specs */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{t.specPaperSize}</span>
                <strong className="text-slate-800">A4 (210 × 297 mm)</strong>
              </div>
              <div className="flex justify-between">
                <span>{t.specPhotoSize}</span>
                <strong className="text-slate-800">
                  {preset.widthMm} × {preset.heightMm} mm
                </strong>
              </div>
              <div className="flex justify-between">
                <span>{t.printResolutionLabel}</span>
                <strong className="text-slate-800">{dpi} DPI</strong>
              </div>
              <div className="flex justify-between">
                <span>{t.specCuttingGap}</span>
                <strong className="text-slate-800">{t.spacingMm}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={isGenerating}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                <span>{t.printDirectBtn}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload('jpg')}
                  disabled={isGenerating}
                  className="py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t.downloadJpgSheet}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('png')}
                  disabled={isGenerating}
                  className="py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t.downloadPngSheet}</span>
                </button>
              </div>
            </div>
          </div>

          {/* A4 Sheet Preview Column */}
          <div className="md:col-span-2 flex flex-col items-center justify-center bg-slate-100/70 p-4 rounded-xl border border-slate-200 min-h-[380px]">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
                <span className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                <span>{t.renderingSheet}</span>
              </div>
            ) : sheetPreviewUrl ? (
              <div className="relative shadow-xl rounded-sm overflow-hidden border border-slate-300 max-h-[500px] aspect-[210/297] bg-white">
                <img
                  src={sheetPreviewUrl}
                  alt="A4 Print Sheet Preview"
                  className="w-full h-full object-contain block"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400">{t.previewFailed}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
