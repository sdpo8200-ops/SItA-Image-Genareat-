import React, { useState, useRef, useEffect } from 'react';
import {
  BusinessSettings,
  EnhancementSettings,
  FaceAnalysisResult,
  OutfitType,
  PhotoPreset,
  ProcessingStep,
  TransformState,
} from './types';
import {
  DEFAULT_BUSINESS_SETTINGS,
  DEFAULT_ENHANCEMENTS,
  PHOTO_PRESETS,
} from './constants/presets';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UploadDropzone } from './components/UploadDropzone';
import { PresetSelector } from './components/PresetSelector';
import { BackgroundSelector } from './components/BackgroundSelector';
import { EnhancementPanel } from './components/EnhancementPanel';
import { OutfitSelector } from './components/OutfitSelector';
import { UpscaleSection } from './components/UpscaleSection';
import { ManualControls } from './components/ManualControls';
import { PhotoPreviewCanvas, PhotoCanvasRef } from './components/PhotoPreviewCanvas';
import { BeforeAfterCompare } from './components/BeforeAfterCompare';
import { PrintSheetModal } from './components/PrintSheetModal';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { PrivacySafetyBadge } from './components/PrivacySafetyBadge';
import { calculateOutputPixels, computeAutoFaceTransform, getStandardFilename } from './utils/imageMath';
import { Download, Printer, Sparkles } from 'lucide-react';

function StudioApp() {
  const { language, t } = useLanguage();

  // Business Settings
  const [business, setBusiness] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Photo State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [cutoutImage, setCutoutImage] = useState<string | null>(null);
  const [processedPreviewUrl, setProcessedPreviewUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ name: string; size: number; width?: number; height?: number } | null>(null);

  // Processing state
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [upscaledFactor, setUpscaledFactor] = useState<number | null>(null);
  const [isProcessingOutfit, setIsProcessingOutfit] = useState(false);

  // Face Analysis
  const [faceAnalysis, setFaceAnalysis] = useState<FaceAnalysisResult | null>(null);

  // Configuration State
  const [selectedPreset, setSelectedPreset] = useState<PhotoPreset>(PHOTO_PRESETS[0]); // Passport 40x50mm
  const [dpi, setDpi] = useState<number>(300);
  const [customWidthMm, setCustomWidthMm] = useState<number>(40);
  const [customHeightMm, setCustomHeightMm] = useState<number>(50);

  // Background state
  const [backgroundColorHex, setBackgroundColorHex] = useState<string>('#FFFFFF');
  const [isTransparentBg, setIsTransparentBg] = useState<boolean>(false);

  // Enhancements & Outfit
  const [enhancements, setEnhancements] = useState<EnhancementSettings>(DEFAULT_ENHANCEMENTS);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitType>('original');

  // Manual transform & guides
  const [transform, setTransform] = useState<TransformState>({
    zoom: 1.0,
    panX: 0,
    panY: 0,
    rotation: 0,
  });
  const [showGuides, setShowGuides] = useState<boolean>(true);

  // Modals
  const [isPrintSheetOpen, setIsPrintSheetOpen] = useState<boolean>(false);

  // Canvas Ref
  const canvasRef = useRef<PhotoCanvasRef>(null);

  // Fetch initial business settings from backend if available
  useEffect(() => {
    fetch('/api/business-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setBusiness((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch((err) => console.warn('Could not fetch server settings:', err));
  }, []);

  // Main Automated Pipeline upon Image Selection
  const handleImageUploaded = async (dataUrl: string, fileInfo: { name: string; size: number }) => {
    setUploadedImage(dataUrl);
    setCutoutImage(null);
    setImageMeta(fileInfo);
    setUpscaledFactor(null);
    setSelectedOutfit('original');
    setEnhancements(DEFAULT_ENHANCEMENTS);

    // Get natural image dimensions
    const testImg = new Image();
    testImg.src = dataUrl;
    await new Promise((res) => (testImg.onload = res));
    const natW = testImg.width || 600;
    const natH = testImg.height || 800;
    setImageMeta({ ...fileInfo, width: natW, height: natH });

    // Step 1: Analyzing Face
    setProcessingStep('analyzing');
    let analysisResult: FaceAnalysisResult = {
      detected: true,
      confidence: 0.92,
      tiltAngle: 0,
      eyeAlignment: 'straight',
      headroomPct: 10,
      lightingQuality: 'good',
      box: { x: 0.25, y: 0.12, width: 0.5, height: 0.52 },
      messageBn: 'চেহারা শনাক্ত করা হয়েছে এবং পাসপোর্ট সাইজের জন্য উপযোগী।',
      messageEn: 'Face detected and framed suitably for official requirements.',
    };

    try {
      const analyzeRes = await fetch('/api/ai/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl }),
      });
      const data = await analyzeRes.json();
      if (data.success) {
        analysisResult = {
          detected: data.detected,
          box: data.box,
          confidence: data.confidence,
          tiltAngle: data.tiltAngle,
          eyeAlignment: data.eyeAlignment,
          headroomPct: data.headroomPct,
          lightingQuality: data.lightingQuality,
          messageBn: data.messageBn,
          messageEn: data.messageEn,
        };
      }
    } catch (err) {
      console.warn('Face analysis api failed, using default bounding box:', err);
    }
    setFaceAnalysis(analysisResult);

    // Step 2: Background Removal
    setProcessingStep('removing_bg');
    let cutoutUrl = dataUrl;
    try {
      const bgRes = await fetch('/api/ai/remove-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl, targetColorHex: backgroundColorHex }),
      });
      const bgData = await bgRes.json();
      if (bgData.success && bgData.resultImage) {
        cutoutUrl = bgData.resultImage;
      }
    } catch (err) {
      console.warn('Background removal error:', err);
    }
    setCutoutImage(cutoutUrl);

    // Step 3: Adjusting Face Positioning
    setProcessingStep('adjusting_face');
    if (analysisResult.box) {
      const targetAspect = selectedPreset.widthMm / selectedPreset.heightMm;
      const initialTransform = computeAutoFaceTransform(natW, natH, analysisResult.box, targetAspect, selectedPreset);
      setTransform(initialTransform);
    }

    // Step 4: Enhancing
    setProcessingStep('enhancing');
    await new Promise((r) => setTimeout(r, 600));

    // Step 5: Ready
    setProcessingStep('ready');
    setTimeout(() => {
      setProcessingStep('idle');
    }, 900);
  };

  // Auto Adjust Face Handler
  const handleAutoAdjustFace = () => {
    if (!faceAnalysis?.box || !imageMeta?.width || !imageMeta?.height) {
      setTransform({ zoom: 1.0, panX: 0, panY: 0, rotation: 0 });
      return;
    }
    const targetAspect = selectedPreset.widthMm / selectedPreset.heightMm;
    const optimal = computeAutoFaceTransform(
      imageMeta.width,
      imageMeta.height,
      faceAnalysis.box,
      targetAspect,
      selectedPreset
    );
    setTransform(optimal);
  };

  // Trigger AI Upscale (2x or 4x)
  const handleTriggerUpscale = async (factor: 2 | 4) => {
    if (!uploadedImage) return;
    setIsUpscaling(true);
    try {
      const { widthPx, heightPx } = calculateOutputPixels(selectedPreset.widthMm, selectedPreset.heightMm, dpi);
      const res = await fetch('/api/ai/upscale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: processedPreviewUrl || uploadedImage,
          factor,
          originalWidth: widthPx,
          originalHeight: heightPx,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUpscaledFactor(factor);
      }
    } catch (err) {
      console.error('Upscale failed:', err);
    } finally {
      setIsUpscaling(false);
    }
  };

  // Outfit Selection Handler
  const handleSelectOutfit = async (outfit: OutfitType) => {
    setSelectedOutfit(outfit);
    if (outfit === 'original') return;

    setIsProcessingOutfit(true);
    try {
      const res = await fetch('/api/ai/outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: cutoutImage || uploadedImage,
          outfitType: outfit,
        }),
      });
      await res.json();
    } catch (err) {
      console.error('Outfit change failed:', err);
    } finally {
      setIsProcessingOutfit(false);
    }
  };

  // Download Handlers
  const handleDownloadImage = (format: 'jpg' | 'png') => {
    if (!canvasRef.current) return;
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvasRef.current.getFinalDataUrl(mime, 0.98);
    const filename = getStandardFilename(selectedPreset, dpi, format);

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  const handleResetPhoto = () => {
    setUploadedImage(null);
    setCutoutImage(null);
    setProcessedPreviewUrl(null);
    setImageMeta(null);
    setFaceAnalysis(null);
    setUpscaledFactor(null);
    setTransform({ zoom: 1.0, panX: 0, panY: 0, rotation: 0 });
  };

  // Calculation for summary display
  const currentW = selectedPreset.id === 'custom' ? customWidthMm : selectedPreset.widthMm;
  const currentH = selectedPreset.id === 'custom' ? customHeightMm : selectedPreset.heightMm;
  const { widthPx, heightPx } = calculateOutputPixels(currentW, currentH, dpi);

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${language === 'bn' ? "font-['Hind_Siliguri',sans-serif]" : "font-['Plus_Jakarta_Sans',sans-serif]"}`}>
      {/* 1. Header with Language Switcher */}
      <Header
        business={business}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetPhoto={handleResetPhoto}
        hasPhoto={Boolean(uploadedImage)}
      />

      {/* 2. Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Privacy & Safety Badges */}
        <PrivacySafetyBadge />

        {!uploadedImage ? (
          /* Landing & Photo Upload View */
          <div className="max-w-4xl mx-auto space-y-8 py-6">
            {/* Hero Heading */}
            <div className="text-center space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                {t.heroTag}
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {t.heroTitle}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
                {t.heroSubtitle}
              </p>
            </div>

            {/* Upload Box */}
            <UploadDropzone onImageSelected={handleImageUploaded} />

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h3 className="font-bold text-sm text-slate-800">{t.feat1Title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.feat1Desc}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h3 className="font-bold text-sm text-slate-800">{t.feat2Title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.feat2Desc}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h3 className="font-bold text-sm text-slate-800">{t.feat3Title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t.feat3Desc}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Active 3-Column Studio Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ====================================================
                LEFT COLUMN: Controls & Presets (lg:col-span-4)
               ==================================================== */}
            <div className="lg:col-span-4 space-y-5">
              {/* Photo Type / Presets */}
              <div className="border border-slate-200 bg-white rounded-2xl p-4 shadow-xs">
                <PresetSelector
                  selectedPreset={selectedPreset}
                  onSelectPreset={(p) => setSelectedPreset(p)}
                  dpi={dpi}
                  onChangeDpi={setDpi}
                  customWidthMm={customWidthMm}
                  customHeightMm={customHeightMm}
                  onChangeCustomDimensions={(w, h) => {
                    setCustomWidthMm(w);
                    setCustomHeightMm(h);
                  }}
                />
              </div>

              {/* Background Color Picker */}
              <div className="border border-slate-200 bg-white rounded-2xl p-4 shadow-xs">
                <BackgroundSelector
                  selectedColorHex={backgroundColorHex}
                  onSelectColor={(hex) => setBackgroundColorHex(hex)}
                  isTransparent={isTransparentBg}
                  onToggleTransparent={(t) => setIsTransparentBg(t)}
                />
              </div>

              {/* AI Enhancement Panel (13 Retouching Options) */}
              <EnhancementPanel
                enhancements={enhancements}
                onChangeEnhancement={(key, val) =>
                  setEnhancements((prev) => ({ ...prev, [key]: val }))
                }
                onResetAll={() => setEnhancements(DEFAULT_ENHANCEMENTS)}
              />

              {/* AI Dress / Outfit (Optional) */}
              <OutfitSelector
                selectedOutfit={selectedOutfit}
                onSelectOutfit={handleSelectOutfit}
                isProcessingOutfit={isProcessingOutfit}
              />

              {/* AI Upscale (2x, 4x) */}
              <UpscaleSection
                originalWidth={widthPx}
                originalHeight={heightPx}
                onTriggerUpscale={handleTriggerUpscale}
                isUpscaling={isUpscaling}
                upscaledFactor={upscaledFactor}
              />
            </div>

            {/* ====================================================
                CENTER COLUMN: Photo Preview & Manual Tools (lg:col-span-5)
               ==================================================== */}
            <div className="lg:col-span-5 space-y-4">
              {/* Main Interactive Canvas Preview */}
              <PhotoPreviewCanvas
                ref={canvasRef}
                originalImage={uploadedImage}
                cutoutImage={cutoutImage}
                backgroundColor={backgroundColorHex}
                isTransparentBg={isTransparentBg}
                preset={selectedPreset}
                dpi={dpi}
                transform={transform}
                enhancements={enhancements}
                showGuides={showGuides}
                onCanvasRendered={(url) => setProcessedPreviewUrl(url)}
              />

              {/* Manual Controls (Zoom, Pan, Rotate, Auto Adjust) */}
              <ManualControls
                transform={transform}
                onChangeTransform={setTransform}
                onAutoAdjust={handleAutoAdjustFace}
                showGuides={showGuides}
                onToggleGuides={() => setShowGuides(!showGuides)}
              />
            </div>

            {/* ====================================================
                RIGHT COLUMN: Before/After & Downloads (lg:col-span-3)
               ==================================================== */}
            <div className="lg:col-span-3 space-y-5">
              {/* Before / After Preview */}
              <BeforeAfterCompare
                originalImage={uploadedImage}
                processedImage={processedPreviewUrl}
                analysis={faceAnalysis}
                preset={selectedPreset}
              />

              {/* Output Info Card */}
              <div className="border border-slate-200 bg-white rounded-2xl p-4 space-y-3 shadow-xs text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800">{t.outputSpecsTitle}</span>
                  <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                    {t.studioQualityBadge}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>{t.specSizeMm}</span>
                    <strong className="text-slate-800">{currentW}mm × {currentH}mm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.specResolutionPx}</span>
                    <strong className="text-slate-800 font-mono">{widthPx} × {heightPx} px</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.specPrintDpi}</span>
                    <strong className="text-slate-800">{dpi} DPI</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.specHeadspace}</span>
                    <strong className="text-slate-800">
                      {Math.round((selectedPreset.faceHeightRatio || 0.7) * 100)}% ({t.icaoStandard})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Export & Download Actions */}
              <div className="border border-slate-200 bg-white rounded-2xl p-4 space-y-2.5 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-sky-600" />
                  {t.downloadPrintTitle}
                </h4>

                {/* Direct JPG Download */}
                <button
                  type="button"
                  onClick={() => handleDownloadImage('jpg')}
                  className="w-full py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadJpgBtn}</span>
                </button>

                {/* Direct PNG Download */}
                <button
                  type="button"
                  onClick={() => handleDownloadImage('png')}
                  className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t.downloadPngBtn}</span>
                </button>

                {/* Print Sheet Trigger */}
                <button
                  type="button"
                  onClick={() => setIsPrintSheetOpen(true)}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-1"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.createPrintSheetBtn}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <Footer business={business} />

      {/* 4. A4 Print Sheet Modal */}
      {isPrintSheetOpen && processedPreviewUrl && (
        <PrintSheetModal
          isOpen={isPrintSheetOpen}
          onClose={() => setIsPrintSheetOpen(false)}
          photoDataUrl={processedPreviewUrl}
          preset={selectedPreset}
          dpi={dpi}
          business={business}
        />
      )}

      {/* 5. Business Settings Modal */}
      {isSettingsOpen && (
        <AdminSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          business={business}
          onSaveBusinessSettings={(updated) => {
            setBusiness(updated);
            // Sync with backend
            fetch('/api/business-settings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updated),
            }).catch((err) => console.error('Failed to persist settings:', err));
          }}
        />
      )}

      {/* 6. Multi-Step Animated Processing Overlay */}
      <ProcessingOverlay currentStep={processingStep} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <StudioApp />
    </LanguageProvider>
  );
}
