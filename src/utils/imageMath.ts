import { FaceBoundingBox, PhotoPreset, TransformState } from '../types';

/**
 * Calculates output dimensions in pixels from physical size in millimeters and DPI.
 * Standard formula: (mm / 25.4) * DPI
 * Example: 40mm x 50mm at 300 DPI = ~472 x 591 pixels
 */
export function calculateOutputPixels(widthMm: number, heightMm: number, dpi: number = 300) {
  const widthPx = Math.round((widthMm / 25.4) * dpi);
  const heightPx = Math.round((heightMm / 25.4) * dpi);
  return { widthPx, heightPx };
}

/**
 * Generate standardized filename for downloads
 */
export function getStandardFilename(
  preset: PhotoPreset,
  dpi: number,
  format: 'jpg' | 'png',
  prefix: string = 'SITA_AI_Photo'
): string {
  const cleanW = Math.round(preset.widthMm);
  const cleanH = Math.round(preset.heightMm);
  return `${prefix}_${cleanW}x${cleanH}mm_${dpi}DPI.${format}`;
}

/**
 * Calculate optimal crop and centering transform based on detected face coordinates
 * Ensures official headroom (approx 8-12%) and chin/eye positioning.
 */
export function computeAutoFaceTransform(
  imageWidth: number,
  imageHeight: number,
  faceBox: FaceBoundingBox,
  targetAspect: number, // targetWidth / targetHeight
  preset: PhotoPreset
): TransformState {
  // Face box coordinates in pixels
  const fX = faceBox.x * imageWidth;
  const fY = faceBox.y * imageHeight;
  const fW = faceBox.width * imageWidth;
  const fH = faceBox.height * imageHeight;

  const faceCenterX = fX + fW / 2;
  const faceCenterY = fY + fH / 2;

  // For official passport photos, the face height should occupy around 65% to 75% of the frame
  const targetFaceRatio = preset.faceHeightRatio || 0.70;
  const targetHeadroomRatio = preset.topMarginRatio || 0.10;

  // Required frame height so face height is targetFaceRatio of total height
  const idealFrameHeight = fH / targetFaceRatio;
  const idealFrameWidth = idealFrameHeight * targetAspect;

  // Compute zoom scale relative to natural fitting
  const naturalCoverScale = Math.max(targetAspect / (imageWidth / imageHeight), 1);
  const zoom = Math.max(0.6, Math.min(2.5, (imageHeight / idealFrameHeight) * (1 / naturalCoverScale)));

  // Center the face horizontally
  const imageCenterX = imageWidth / 2;
  const panX = (imageCenterX - faceCenterX) * 0.9;

  // Headroom positioning: we want top of head at approx headroomRatio from the top
  const headTopY = Math.max(0, fY - fH * 0.2);
  const idealTopInFrame = idealFrameHeight * targetHeadroomRatio;
  const imageCenterY = imageHeight / 2;
  const panY = (imageCenterY - (headTopY + idealFrameHeight * 0.45)) * 0.9;

  return {
    zoom: Number(zoom.toFixed(2)),
    panX: Math.round(panX),
    panY: Math.round(panY),
    rotation: 0,
  };
}

/**
 * Converts a data URL / base64 string to a Blob
 */
export function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Formats bytes into human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
