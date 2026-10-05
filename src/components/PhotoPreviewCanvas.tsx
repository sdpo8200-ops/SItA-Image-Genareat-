import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { EnhancementSettings, PhotoPreset, TransformState } from '../types';
import { calculateOutputPixels } from '../utils/imageMath';
import { applyCanvasEnhancements } from '../utils/portraitProcessor';
import { useLanguage } from '../context/LanguageContext';

export interface PhotoCanvasRef {
  getFinalDataUrl: (format?: 'image/jpeg' | 'image/png', quality?: number) => string;
  getCanvas: () => HTMLCanvasElement | null;
}

interface PhotoPreviewCanvasProps {
  originalImage: string;
  cutoutImage: string | null;
  backgroundColor: string;
  isTransparentBg: boolean;
  preset: PhotoPreset;
  dpi: number;
  transform: TransformState;
  enhancements: EnhancementSettings;
  showGuides: boolean;
  onCanvasRendered?: (dataUrl: string) => void;
}

export const PhotoPreviewCanvas = forwardRef<PhotoCanvasRef, PhotoPreviewCanvasProps>(
  (
    {
      originalImage,
      cutoutImage,
      backgroundColor,
      isTransparentBg,
      preset,
      dpi,
      transform,
      enhancements,
      showGuides,
      onCanvasRendered,
    },
    ref
  ) => {
    const { language, t } = useLanguage();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRendering, setIsRendering] = useState(false);

    const { widthPx, heightPx } = calculateOutputPixels(preset.widthMm, preset.heightMm, dpi);

    useImperativeHandle(ref, () => ({
      getFinalDataUrl: (format = 'image/jpeg', quality = 0.96) => {
        if (!canvasRef.current) return '';
        return canvasRef.current.toDataURL(format, quality);
      },
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      let isMounted = true;
      const render = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setIsRendering(true);

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Set dimensions
        canvas.width = widthPx;
        canvas.height = heightPx;

        // 1. Draw Background
        if (isTransparentBg) {
          ctx.clearRect(0, 0, widthPx, heightPx);
        } else {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, widthPx, heightPx);
        }

        // 2. Load and Draw Foreground (cutout or original)
        const imgSrcToLoad = cutoutImage || originalImage;
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = imgSrcToLoad;
        });

        if (!isMounted) return;

        // Save context state for transform
        ctx.save();

        // Calculate aspect fill
        const imgAspect = img.width / img.height;
        const targetAspect = widthPx / heightPx;

        let baseW = widthPx;
        let baseH = heightPx;

        if (imgAspect > targetAspect) {
          // image is wider
          baseH = heightPx;
          baseW = heightPx * imgAspect;
        } else {
          // image is taller
          baseW = widthPx;
          baseH = widthPx / imgAspect;
        }

        // Translate to center, apply rotation and zoom, then translate back
        ctx.translate(widthPx / 2 + transform.panX, heightPx / 2 + transform.panY);
        ctx.rotate((transform.rotation * Math.PI) / 180);
        ctx.scale(transform.zoom, transform.zoom);

        // Draw image centered
        ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);

        // Restore before enhancements
        ctx.restore();

        // 3. Apply Fine-Tuned Enhancements (Smooth Skin, Eye Clarity, Unsharp Mask, Contrast)
        applyCanvasEnhancements(ctx, widthPx, heightPx, enhancements);

        // 4. Render Official Guide Overlay if requested
        if (showGuides) {
          ctx.save();

          // Crown headroom line (approx 8-10% from top)
          const crownY = heightPx * (preset.topMarginRatio || 0.10);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
          ctx.lineWidth = Math.max(1, Math.round(dpi / 200));
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(0, crownY);
          ctx.lineTo(widthPx, crownY);
          ctx.stroke();

          // Eye level line (approx 42-45% from top)
          const eyeY = heightPx * 0.43;
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.75)';
          ctx.beginPath();
          ctx.moveTo(0, eyeY);
          ctx.lineTo(widthPx, eyeY);
          ctx.stroke();

          // Chin line (approx 75-80% from top)
          const chinY = heightPx * ((preset.topMarginRatio || 0.10) + (preset.faceHeightRatio || 0.70));
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
          ctx.beginPath();
          ctx.moveTo(0, chinY);
          ctx.lineTo(widthPx, chinY);
          ctx.stroke();

          // Center symmetry line
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(widthPx / 2, 0);
          ctx.lineTo(widthPx / 2, heightPx);
          ctx.stroke();

          // Visual Guide Legend
          ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
          ctx.fillRect(8, 8, Math.min(widthPx - 16, 180), 54);
          ctx.fillStyle = '#FFFFFF';
          const fontFace = language === 'bn' ? '"Hind Siliguri", sans-serif' : '"Plus Jakarta Sans", sans-serif';
          ctx.font = `${Math.max(10, Math.round(dpi * 0.03))}px ${fontFace}`;
          ctx.fillText(`• ${t.crownGuide}`, 14, 22);
          ctx.fillText(`• ${t.eyesGuide}`, 14, 38);
          ctx.fillText(`• ${t.chinGuide}`, 14, 54);

          ctx.restore();
        }

        // Notify parent with final rendered data URL
        const finalUrl = canvas.toDataURL('image/jpeg', 0.95);
        onCanvasRendered?.(finalUrl);
        setIsRendering(false);
      };

      render();

      return () => {
        isMounted = false;
      };
    }, [
      originalImage,
      cutoutImage,
      backgroundColor,
      isTransparentBg,
      preset,
      dpi,
      transform,
      enhancements,
      showGuides,
      widthPx,
      heightPx,
      language,
      t,
    ]);

    const displayName = language === 'bn' ? preset.nameBn : preset.nameEn;

    return (
      <div className="relative flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-100/80 rounded-2xl border border-slate-200 shadow-inner overflow-hidden min-h-[360px] sm:min-h-[460px]">
        {/* Canvas container with aspect ratio */}
        <div
          className="relative max-w-full shadow-2xl rounded-lg overflow-hidden transition-all bg-white border border-slate-300"
          style={{
            aspectRatio: `${widthPx} / ${heightPx}`,
            maxHeight: '440px',
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain block"
            style={{
              maxHeight: '440px',
            }}
          />

          {isRendering && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-2xs flex items-center justify-center">
              <span className="text-[10px] font-semibold text-slate-700 bg-white/80 px-2 py-1 rounded-full shadow-xs">
                {t.canvasProcessing}
              </span>
            </div>
          )}
        </div>

        {/* Footer Info Badge */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 font-semibold shadow-2xs">
            {displayName}
          </span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 shadow-2xs">
            {preset.widthMm}mm × {preset.heightMm}mm
          </span>
          <span className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 shadow-2xs">
            {widthPx} × {heightPx} px @ {dpi} DPI
          </span>
        </div>
      </div>
    );
  }
);

PhotoPreviewCanvas.displayName = 'PhotoPreviewCanvas';
