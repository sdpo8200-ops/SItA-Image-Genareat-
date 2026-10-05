export type Language = 'bn' | 'en';

export type Level = 'OFF' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface PhotoPreset {
  id: string;
  nameBn: string;
  nameEn: string;
  widthMm: number;
  heightMm: number;
  defaultDpi: number;
  descriptionBn: string;
  faceHeightRatio: number; // typical official ratio (e.g. 0.72 = 72% face height)
  topMarginRatio: number; // typical headroom (e.g. 0.10 = 10%)
}

export interface EnhancementSettings {
  beauty: Level;
  smoothSkin: Level;
  brightness: Level;
  contrast: Level;
  sharpness: Level;
  faceEnhance: Level;
  eyeEnhance: Level;
  teethEnhance: Level;
  hairEnhance: Level;
  beardEnhance: Level;
  noiseReduction: Level;
  skinTone: Level;
  colorCorrection: Level;
}

export type OutfitType =
  | 'original'
  | 'white_shirt'
  | 'blue_shirt'
  | 'navy_shirt'
  | 'formal_suit'
  | 'blazer'
  | 'panjabi'
  | 'hijab';

export interface OutfitOption {
  id: OutfitType;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  iconName: string;
}

export interface BackgroundColorOption {
  id: string;
  nameBn: string;
  nameEn: string;
  hex: string;
}

export interface FaceBoundingBox {
  x: number; // normalized 0..1
  y: number; // normalized 0..1
  width: number; // normalized 0..1
  height: number; // normalized 0..1
}

export interface FaceAnalysisResult {
  detected: boolean;
  box?: FaceBoundingBox;
  confidence: number;
  tiltAngle: number; // degrees
  eyeAlignment: 'straight' | 'slight_tilt' | 'tilted';
  headroomPct: number;
  lightingQuality: 'good' | 'shadows' | 'overexposed' | 'underexposed';
  messageBn: string;
  messageEn: string;
}

export interface TransformState {
  zoom: number; // 0.5 to 2.5, default 1.0
  panX: number; // in pixels
  panY: number; // in pixels
  rotation: number; // in degrees, -15 to +15
}

export interface PrintSheetConfig {
  copies: 4 | 6 | 8 | 12;
  paperSize: 'A4';
  showCropMarks: boolean;
  showStudioHeader: boolean;
  sheetOrientation: 'portrait' | 'landscape';
}

export interface BusinessSettings {
  businessNameBn: string;
  businessNameEn: string;
  subtitleBn: string;
  subtitleEn: string;
  addressBn: string;
  phone: string;
  whatsapp: string;
  footerTextBn: string;
  customLogoUrl?: string;
}

export type ProcessingStep =
  | 'idle'
  | 'analyzing'
  | 'removing_bg'
  | 'adjusting_face'
  | 'enhancing'
  | 'upscaling'
  | 'generating_outfit'
  | 'ready';
