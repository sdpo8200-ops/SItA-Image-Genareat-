/**
 * Generates an ultra clean sample official portrait canvas on the fly
 * with realistic skin tones, dark hair, eyes, and white shirt.
 */
export function generateSamplePortrait(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 750;
  const ctx = canvas.getContext('2d')!;

  // Light neutral background
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(0, 0, 600, 750);

  // Body / Shoulders (Dark Navy Suit)
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.ellipse(300, 720, 240, 200, 0, 0, Math.PI * 2);
  ctx.fill();

  // White Shirt Collar
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(250, 520);
  ctx.lineTo(300, 610);
  ctx.lineTo(350, 520);
  ctx.closePath();
  ctx.fill();

  // Red Tie
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.moveTo(292, 580);
  ctx.lineTo(308, 580);
  ctx.lineTo(315, 750);
  ctx.lineTo(285, 750);
  ctx.closePath();
  ctx.fill();

  // Neck
  ctx.fillStyle = '#E0A97E';
  ctx.fillRect(265, 460, 70, 80);

  // Neck Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(265, 460, 70, 30);

  // Head Oval
  ctx.fillStyle = '#F5C6A5';
  ctx.beginPath();
  ctx.ellipse(300, 330, 115, 150, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cheeks subtle blush
  ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
  ctx.beginPath();
  ctx.ellipse(240, 360, 30, 20, 0, 0, Math.PI * 2);
  ctx.ellipse(360, 360, 30, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#1F2421';
  ctx.beginPath();
  ctx.ellipse(300, 240, 125, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(200, 290, 35, 70, -0.2, 0, Math.PI * 2);
  ctx.ellipse(400, 290, 35, 70, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(235, 295);
  ctx.quadraticCurveTo(255, 288, 275, 296);
  ctx.moveTo(325, 296);
  ctx.quadraticCurveTo(345, 288, 365, 295);
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(255, 320, 18, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(345, 320, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Iris
  ctx.fillStyle = '#3E2723';
  ctx.beginPath();
  ctx.arc(255, 320, 7, 0, Math.PI * 2);
  ctx.arc(345, 320, 7, 0, Math.PI * 2);
  ctx.fill();

  // Pupil & Highlights
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(255, 320, 4, 0, Math.PI * 2);
  ctx.arc(345, 320, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(253, 318, 2, 0, Math.PI * 2);
  ctx.arc(343, 318, 2, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.strokeStyle = '#D99B75';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 315);
  ctx.lineTo(296, 365);
  ctx.lineTo(306, 368);
  ctx.stroke();

  // Lips (Neutral official expression)
  ctx.fillStyle = '#D47A70';
  ctx.beginPath();
  ctx.ellipse(300, 410, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#B35850';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(278, 410);
  ctx.lineTo(322, 410);
  ctx.stroke();

  // Ears
  ctx.fillStyle = '#E8B693';
  ctx.beginPath();
  ctx.ellipse(185, 335, 14, 28, -0.1, 0, Math.PI * 2);
  ctx.ellipse(415, 335, 14, 28, 0.1, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toDataURL('image/jpeg', 0.95);
}
