import { EnhancementSettings, Level } from '../types';

/**
 * Maps OFF / LOW / MEDIUM / HIGH to numerical weight
 */
function levelToValue(level: Level, low: number, med: number, high: number): number {
  switch (level) {
    case 'LOW':
      return low;
    case 'MEDIUM':
      return med;
    case 'HIGH':
      return high;
    case 'OFF':
    default:
      return 0;
  }
}

/**
 * Applies fine-tuned portrait enhancements onto a 2D canvas context
 * Strictly preserves facial features, age, gender, and structural identity.
 */
export function applyCanvasEnhancements(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  enhancements: EnhancementSettings
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Calculate enhancement coefficients
  const brightnessBoost = levelToValue(enhancements.brightness, 6, 14, 24);
  const contrastFactor = 1 + levelToValue(enhancements.contrast, 0.05, 0.12, 0.22);
  const skinSmoothWeight = levelToValue(enhancements.smoothSkin, 0.15, 0.35, 0.55);
  const beautyWeight = levelToValue(enhancements.beauty, 0.1, 0.25, 0.4);
  const eyeEnhance = levelToValue(enhancements.eyeEnhance, 0.05, 0.12, 0.2);
  const teethEnhance = levelToValue(enhancements.teethEnhance, 0.05, 0.1, 0.18);
  const hairEnhance = levelToValue(enhancements.hairEnhance, 0.08, 0.16, 0.25);
  const noiseReduction = levelToValue(enhancements.noiseReduction, 0.1, 0.2, 0.35);
  const skinToneBalance = levelToValue(enhancements.skinTone, 0.05, 0.1, 0.18);
  const colorCorrection = levelToValue(enhancements.colorCorrection, 0.05, 0.1, 0.18);

  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    if (a < 10) continue; // skip transparent pixels

    // 1. Color Balance & Tone
    if (colorCorrection > 0) {
      // Subtle auto white balance warm neutral adjustment
      const avg = (r + g + b) / 3;
      r = r * (1 - colorCorrection * 0.3) + avg * (colorCorrection * 0.3);
      g = g * (1 - colorCorrection * 0.1) + avg * (colorCorrection * 0.1);
      b = b * (1 - colorCorrection * 0.2) + avg * (colorCorrection * 0.2);
    }

    // 2. Brightness
    if (brightnessBoost !== 0) {
      r += brightnessBoost;
      g += brightnessBoost;
      b += brightnessBoost;
    }

    // 3. Contrast adjustment centered around 128
    if (contrastFactor !== 1) {
      r = 128 + (r - 128) * contrastFactor;
      g = 128 + (g - 128) * contrastFactor;
      b = 128 + (b - 128) * contrastFactor;
    }

    // 4. Skin Tone Detection & Subtle Smoothing / Warmth
    // Standard skin tone chrominance heuristic
    const isSkin = r > 70 && g > 40 && b > 20 && r > g && g > b && r - b > 15;
    if (isSkin) {
      if (skinSmoothWeight > 0 || beautyWeight > 0) {
        const factor = (skinSmoothWeight + beautyWeight) * 0.15;
        // Softly brighten skin midtones slightly without washing out
        r = r * (1 + factor * 0.08);
        g = g * (1 + factor * 0.06);
        b = b * (1 + factor * 0.04);
      }
      if (skinToneBalance > 0) {
        // Evening out redness or uneven lighting
        const targetG = (r + b) * 0.52;
        g = g * (1 - skinToneBalance * 0.2) + targetG * (skinToneBalance * 0.2);
      }
    }

    // 5. Hair & Beard Enhance (subtly deepens darker areas)
    if ((hairEnhance > 0 || enhancements.beardEnhance !== 'OFF') && r < 70 && g < 70 && b < 70) {
      const darkFactor = 1 - (hairEnhance + levelToValue(enhancements.beardEnhance, 0.05, 0.12, 0.2)) * 0.25;
      r *= darkFactor;
      g *= darkFactor;
      b *= darkFactor;
    }

    // 6. Eye & Teeth Brightening for near-white tones
    if ((eyeEnhance > 0 || teethEnhance > 0) && r > 180 && g > 180 && b > 170) {
      const whiteBoost = (eyeEnhance + teethEnhance) * 15;
      r = Math.min(255, r + whiteBoost);
      g = Math.min(255, g + whiteBoost);
      b = Math.min(255, b + whiteBoost * 1.1);
    }

    // Clamp values between 0 and 255
    data[i] = Math.max(0, Math.min(255, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }

  ctx.putImageData(imgData, 0, 0);

  // 7. Sharpness via subtle unsharp convolution
  const sharpnessWeight = levelToValue(enhancements.sharpness, 0.15, 0.35, 0.6);
  if (sharpnessWeight > 0) {
    applyUnsharpMask(ctx, width, height, sharpnessWeight);
  }
}

/**
 * 3x3 Laplacian unsharp mask for crisp eye, eyelash, and collar clarity
 */
function applyUnsharpMask(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number
) {
  const original = ctx.getImageData(0, 0, w, h);
  const src = original.data;
  const output = ctx.createImageData(w, h);
  const dst = output.data;

  // 3x3 Laplacian kernel
  const kCenter = 1 + 4 * amount;
  const kEdge = -amount;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;

      for (let c = 0; c < 3; c++) {
        const top = ((y - 1) * w + x) * 4 + c;
        const bottom = ((y + 1) * w + x) * 4 + c;
        const left = (y * w + (x - 1)) * 4 + c;
        const right = (y * w + (x + 1)) * 4 + c;
        const center = idx + c;

        const val =
          src[center] * kCenter +
          (src[top] + src[bottom] + src[left] + src[right]) * kEdge;

        dst[center] = Math.max(0, Math.min(255, Math.round(val)));
      }
      dst[idx + 3] = src[idx + 3];
    }
  }

  ctx.putImageData(output, 0, 0);
}
