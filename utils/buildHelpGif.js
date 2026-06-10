const { createCanvas, createImageData } = require("canvas");
const GifEncoder = require("gif-encoder-2");
const omggif = require("omggif");
const fs = require("fs");
const path = require("path");

function buildHelpGif(prefix) {
  const rawPath = path.join(__dirname, "..", "assets", "marco_raw.gif");
  const outPath = path.join(__dirname, "..", "assets", "help.gif");

  const rawBuf = fs.readFileSync(rawPath);
  const gr = new omggif.GifReader(new Uint8Array(rawBuf));

  const srcW = gr.width;
  const srcH = gr.height;
  const frameCount = gr.numFrames();

  // Panel for commands on the right side
  const panelW = 260;
  const totalW = srcW + panelW;
  const totalH = srcH;

  const encoder = new GifEncoder(totalW, totalH);
  const stream = fs.createWriteStream(outPath);
  encoder.createReadStream().pipe(stream);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setQuality(8);

  const canvas = createCanvas(totalW, totalH);
  const ctx = canvas.getContext("2d");

  // Compose commands text lines
  const p = prefix || "!";
  const sections = [
    { label: "ᴹᵃʳᶜᵒ Bot", isTitle: true },
    { label: "" },
    { label: `${p}حماية`, sub: "الحماية" },
    { label: `${p}اسم [اسم]`, sub: "تغيير الاسم" },
    { label: `${p}كنيات [كنية]`, sub: "تغيير الكنيات" },
    { label: `${p}ضيف [ID]`, sub: "إضافة عضو" },
    { label: `${p}لينك`, sub: "(ردّ) رابط صورة" },
    { label: "" },
    { label: `${p}حفظ`, sub: "(ردّ) حفظ رسالة" },
    { label: `${p}اتوميك`, sub: "إرسال تلقائي" },
    { label: `${p}قروبات`, sub: "قائمة الجروبات" },
    { label: "" },
    { label: `${p}prefix`, sub: "إعدادات البادئة" },
    { label: `${p}uptime`, sub: "حالة البوت" },
    { label: `${p}ping`, sub: "اختبار الاتصال" },
    { label: `${p}خروج`, sub: "إخراج البوت" },
  ];

  // Pre-render the static panel backdrop onto an offscreen canvas
  const panelCanvas = createCanvas(panelW, totalH);
  const pCtx = panelCanvas.getContext("2d");

  // Dark gradient background for panel
  const grad = pCtx.createLinearGradient(0, 0, 0, totalH);
  grad.addColorStop(0, "rgba(8,6,20,0.97)");
  grad.addColorStop(1, "rgba(15,10,35,0.97)");
  pCtx.fillStyle = grad;
  pCtx.fillRect(0, 0, panelW, totalH);

  // Left border glow line
  pCtx.strokeStyle = "rgba(180,80,255,0.7)";
  pCtx.lineWidth = 2;
  pCtx.beginPath();
  pCtx.moveTo(2, 8);
  pCtx.lineTo(2, totalH - 8);
  pCtx.stroke();

  // Draw static text
  let ty = 22;
  pCtx.textAlign = "right";
  for (const sec of sections) {
    if (!sec.label) { ty += 8; continue; }
    if (sec.isTitle) {
      pCtx.font = "bold 17px sans-serif";
      pCtx.fillStyle = "#f0c040";
      pCtx.shadowColor = "rgba(240,192,64,0.6)";
      pCtx.shadowBlur = 8;
      pCtx.fillText(sec.label, panelW - 10, ty);
      pCtx.shadowBlur = 0;
      ty += 22;
      // Underline
      pCtx.strokeStyle = "rgba(240,192,64,0.5)";
      pCtx.lineWidth = 1;
      pCtx.beginPath();
      pCtx.moveTo(10, ty - 6);
      pCtx.lineTo(panelW - 10, ty - 6);
      pCtx.stroke();
      ty += 4;
      continue;
    }
    // Command label
    pCtx.font = "bold 12px sans-serif";
    pCtx.fillStyle = "#c084fc";
    pCtx.fillText(sec.label, panelW - 10, ty);
    ty += 14;
    if (sec.sub) {
      pCtx.font = "11px sans-serif";
      pCtx.fillStyle = "rgba(200,200,220,0.75)";
      pCtx.fillText(sec.sub, panelW - 10, ty);
      ty += 16;
    }
  }
  // Bottom credit
  pCtx.font = "10px sans-serif";
  pCtx.fillStyle = "rgba(150,130,200,0.5)";
  pCtx.fillText("للمطور فقط", panelW - 10, totalH - 10);

  const panelImageData = pCtx.getImageData(0, 0, panelW, totalH);

  // Previous frame compositing buffer
  let prevPixels = new Uint8ClampedArray(srcW * srcH * 4);

  for (let f = 0; f < frameCount; f++) {
    const fi = gr.frameInfo(f);
    const delay = (fi.delay || 8) * 10; // convert cs to ms
    encoder.setDelay(Math.max(delay, 20));

    // Decode this frame's pixels into a temporary buffer
    const framePx = new Uint8ClampedArray(srcW * srcH * 4);
    gr.decodeAndBlitFrameRGBA(f, framePx);

    // Composite: if disposal is "restore to background", clear previous
    const composite = new Uint8ClampedArray(srcW * srcH * 4);
    // Simple: use current frame pixels (omggif blits onto full canvas)
    composite.set(framePx);

    // Clear canvas
    ctx.clearRect(0, 0, totalW, totalH);

    // Draw the GIF frame on the left
    const imgData = createImageData(composite, srcW, srcH);
    ctx.putImageData(imgData, 0, 0);

    // Draw the command panel on the right
    ctx.putImageData(panelImageData, srcW, 0);

    // Animated shimmer on panel border
    const shimmer = Math.sin((f / frameCount) * Math.PI * 6);
    ctx.strokeStyle = `rgba(${180 + shimmer * 40},${80 + shimmer * 30},255,${0.5 + shimmer * 0.3})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(srcW + 2, 8);
    ctx.lineTo(srcW + 2, totalH - 8);
    ctx.stroke();

    encoder.addFrame(ctx);
    prevPixels = composite;
  }

  encoder.finish();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(outPath));
    stream.on("error", reject);
  });
}

module.exports = buildHelpGif;
