import { BusinessSettings, PhotoPreset, PrintSheetConfig } from '../types';
import { calculateOutputPixels } from './imageMath';

/**
 * Generates an A4 print sheet canvas at 300 DPI with crop marks and studio headers
 */
export async function generateA4PrintSheet(
  photoDataUrl: string,
  preset: PhotoPreset,
  dpi: number,
  config: PrintSheetConfig,
  business: BusinessSettings
): Promise<HTMLCanvasElement> {
  // A4 dimensions in mm: 210 x 297
  const a4WidthMm = config.sheetOrientation === 'landscape' ? 297 : 210;
  const a4HeightMm = config.sheetOrientation === 'landscape' ? 210 : 297;

  // Pixel size at selected DPI (default 300)
  const a4WidthPx = Math.round((a4WidthMm / 25.4) * dpi);
  const a4HeightPx = Math.round((a4HeightMm / 25.4) * dpi);

  const canvas = document.createElement('canvas');
  canvas.width = a4WidthPx;
  canvas.height = a4HeightPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context for print canvas');

  // Background white
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, a4WidthPx, a4HeightPx);

  // Load the individual passport photo
  const photoImg = new Image();
  photoImg.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    photoImg.onload = () => resolve();
    photoImg.onerror = (err) => reject(err);
    photoImg.src = photoDataUrl;
  });

  const { widthPx: photoW, heightPx: photoH } = calculateOutputPixels(
    preset.widthMm,
    preset.heightMm,
    dpi
  );

  // Studio Header Height (in pixels)
  let headerHeightPx = 0;
  if (config.showStudioHeader) {
    headerHeightPx = Math.round((20 / 25.4) * dpi); // ~20mm top header

    // Draw delicate studio header banner
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, a4WidthPx, headerHeightPx);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = Math.max(1, Math.round(dpi / 150));
    ctx.beginPath();
    ctx.moveTo(0, headerHeightPx);
    ctx.lineTo(a4WidthPx, headerHeightPx);
    ctx.stroke();

    ctx.fillStyle = '#0F172A';
    ctx.font = `bold ${Math.round(dpi * 0.05)}px "Hind Siliguri", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `${business.businessNameBn} - ${business.businessNameEn}`,
      Math.round((12 / 25.4) * dpi),
      headerHeightPx * 0.38
    );

    ctx.fillStyle = '#475569';
    ctx.font = `${Math.round(dpi * 0.035)}px "Hind Siliguri", sans-serif`;
    ctx.fillText(
      `${business.addressBn} | মোবাইল: ${business.phone} | হোয়াটসঅ্যাপ: ${business.whatsapp}`,
      Math.round((12 / 25.4) * dpi),
      headerHeightPx * 0.72
    );

    // Right-hand side date & preset info
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748B';
    ctx.font = `${Math.round(dpi * 0.032)}px sans-serif`;
    const today = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    ctx.fillText(
      `${preset.nameBn} (${preset.widthMm}mm × ${preset.heightMm}mm) | ${dpi} DPI | ${today}`,
      a4WidthPx - Math.round((12 / 25.4) * dpi),
      headerHeightPx * 0.55
    );
  }

  // Determine grid layout based on number of copies
  // 4 copies: 2x2 or 4x1
  // 6 copies: 3x2
  // 8 copies: 4x2
  // 12 copies: 4x3
  let cols = 2;
  let rows = 2;
  if (config.copies === 6) {
    cols = 3;
    rows = 2;
  } else if (config.copies === 8) {
    cols = 4;
    rows = 2;
  } else if (config.copies === 12) {
    cols = 4;
    rows = 3;
  }

  // Gap between photos: 6mm (~71 px at 300 dpi)
  const gapPx = Math.round((6 / 25.4) * dpi);
  const totalGridW = cols * photoW + (cols - 1) * gapPx;
  const totalGridH = rows * photoH + (rows - 1) * gapPx;

  // Center the grid in the printable region below header
  const startX = Math.round((a4WidthPx - totalGridW) / 2);
  const availableH = a4HeightPx - headerHeightPx;
  const startY = headerHeightPx + Math.round((availableH - totalGridH) / 2);

  // Draw each photo copy with optional cutting lines / crop marks
  const cropMarkLen = Math.round((3.5 / 25.4) * dpi); // 3.5mm crop lines
  const cropMarkOffset = Math.round((1.5 / 25.4) * dpi);

  let placed = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (placed >= config.copies) break;

      const px = startX + c * (photoW + gapPx);
      const py = startY + r * (photoH + gapPx);

      // Draw photo image
      ctx.drawImage(photoImg, px, py, photoW, photoH);

      // Draw subtle light hairline border around photo
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = Math.max(1, Math.round(dpi / 300));
      ctx.strokeRect(px, py, photoW, photoH);

      // Draw crop marks / cutting lines if enabled
      if (config.showCropMarks) {
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = Math.max(1, Math.round(dpi / 300));

        // Top-left
        ctx.beginPath();
        ctx.moveTo(px - cropMarkOffset - cropMarkLen, py);
        ctx.lineTo(px - cropMarkOffset, py);
        ctx.moveTo(px, py - cropMarkOffset - cropMarkLen);
        ctx.lineTo(px, py - cropMarkOffset);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(px + photoW + cropMarkOffset, py);
        ctx.lineTo(px + photoW + cropMarkOffset + cropMarkLen, py);
        ctx.moveTo(px + photoW, py - cropMarkOffset - cropMarkLen);
        ctx.lineTo(px + photoW, py - cropMarkOffset);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(px - cropMarkOffset - cropMarkLen, py + photoH);
        ctx.lineTo(px - cropMarkOffset, py + photoH);
        ctx.moveTo(px, py + photoH + cropMarkOffset);
        ctx.lineTo(px, py + photoH + cropMarkOffset + cropMarkLen);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(px + photoW + cropMarkOffset, py + photoH);
        ctx.lineTo(px + photoW + cropMarkOffset + cropMarkLen, py + photoH);
        ctx.moveTo(px + photoW, py + photoH + cropMarkOffset);
        ctx.lineTo(px + photoW, py + photoH + cropMarkOffset + cropMarkLen);
        ctx.stroke();
      }

      placed++;
    }
  }

  // Footer notes at bottom of A4
  ctx.fillStyle = '#94A3B8';
  ctx.font = `${Math.round(dpi * 0.03)}px "Hind Siliguri", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(
    `সফটওয়্যার প্রিন্ট শিট - স্বপন আইটি একাডেমি AI Photo Studio | কাটিং মার্ক অনুযায়ী সাবধানে ছবি কেটে নিন`,
    a4WidthPx / 2,
    a4HeightPx - Math.round((8 / 25.4) * dpi)
  );

  return canvas;
}
