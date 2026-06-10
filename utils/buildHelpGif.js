const { createCanvas, createImageData } = require("canvas");
const GifEncoder = require("gif-encoder-2");
const omggif = require("omggif");
const fs = require("fs");
const path = require("path");

function buildHelpGif(prefix) {
  const p = prefix || "!";
  const rawPath = path.join(__dirname, "..", "assets", "marco_raw.gif");
  const outPath = path.join(__dirname, "..", "assets", "help.gif");

  if (!fs.existsSync(rawPath)) {
    throw new Error("marco_raw.gif not found");
  }

  const rawBuf = fs.readFileSync(rawPath);
  const gr = new omggif.GifReader(new Uint8Array(rawBuf));

  const srcW = gr.width;
  const srcH = gr.height;
  const frameCount = gr.numFrames();

  // Commands panel on the right
  const panelW = 270;
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

  // Commands list
  const cmds = [
    { cmd: `${p}حماية`,        desc: "تفعيل/إيقاف الحماية" },
    { cmd: `${p}اسم [اسم]`,    desc: "تغيير اسم الجروب" },
    { cmd: `${p}كنيات [كنية]`, desc: "تغيير كل الكنيات" },
    { cmd: `${p}ضيف [ID]`,     desc: "إضافة عضو" },
    { cmd: `${p}لينك`,         desc: "(ردّ) رابط الصورة" },
    { cmd: `${p}حفظ`,          desc: "(ردّ) حفظ رسالة" },
    { cmd: `${p}اتوميك`,       desc: "إرسال كل 15 ثانية" },
    { cmd: `${p}قروبات`,       desc: "قائمة الجروبات" },
    { cmd: `${p}prefix`,       desc: "إعدادات البادئة" },
    { cmd: `${p}uptime`,       desc: "حالة البوت" },
    { cmd: `${p}ping`,         desc: "اختبار الاتصال" },
    { cmd: `${p}خروج`,         desc: "إخراج البوت" },
  ];

  // Composite frame buffer (holds previous state for disposal)
  const composite = new Uint8ClampedArray(srcW * srcH * 4);

  for (let f = 0; f < frameCount; f++) {
    const fi = gr.frameInfo(f);
    const delay = Math.max((fi.delay || 8) * 10, 30);
    encoder.setDelay(delay);

    // Decode frame directly into composite buffer (omggif blits full canvas)
    gr.decodeAndBlitFrameRGBA(f, composite);

    // ── Draw GIF frame on left ──
    const imgData = createImageData(new Uint8ClampedArray(composite), srcW, srcH);
    ctx.putImageData(imgData, 0, 0);

    // ── Commands panel on right ──
    const px = srcW;
    const t = f / frameCount;
    const pulse = Math.sin(t * Math.PI * 8);
    const slow  = Math.sin(t * Math.PI * 2);

    // Panel background
    const panelGrad = ctx.createLinearGradient(px, 0, px + panelW, totalH);
    panelGrad.addColorStop(0, "rgba(6,4,18,0.97)");
    panelGrad.addColorStop(1, "rgba(14,8,32,0.97)");
    ctx.fillStyle = panelGrad;
    ctx.fillRect(px, 0, panelW, totalH);

    // Animated left border
    const borderGrad = ctx.createLinearGradient(0, 0, 0, totalH);
    borderGrad.addColorStop(0,   `rgba(160,60,255,0)`);
    borderGrad.addColorStop(0.3, `rgba(220,80,255,${0.6 + pulse * 0.3})`);
    borderGrad.addColorStop(0.7, `rgba(180,100,255,${0.5 + pulse * 0.3})`);
    borderGrad.addColorStop(1,   `rgba(160,60,255,0)`);
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(px + 1, 10);
    ctx.lineTo(px + 1, totalH - 10);
    ctx.stroke();

    // Floating particles in panel
    for (let k = 0; k < 10; k++) {
      const py2 = ((k * 83 + f * (k % 3 === 0 ? 2 : 1)) % (totalH + 10)) - 5;
      const px2 = px + 10 + (k * 47) % (panelW - 20);
      const a = 0.1 + Math.abs(Math.sin(t * Math.PI * 4 + k)) * 0.25;
      const hue = 260 + k * 15;
      ctx.beginPath();
      ctx.arc(px2, py2, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue},100%,70%,${a})`;
      ctx.fill();
    }

    // Title
    ctx.save();
    ctx.shadowColor = `rgba(200,80,255,${0.7 + pulse * 0.3})`;
    ctx.shadowBlur = 10 + Math.abs(pulse) * 6;
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#e040fb";
    ctx.textAlign = "right";
    ctx.fillText("⚔  قائمة الأوامر", px + panelW - 12, 28);
    ctx.restore();

    // Underline
    ctx.strokeStyle = `rgba(200,80,255,${0.3 + slow * 0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 10, 36);
    ctx.lineTo(px + panelW - 10, 36);
    ctx.stroke();

    // Commands
    const highlight = Math.floor(t * cmds.length) % cmds.length;
    let cy = 52;
    for (let i = 0; i < cmds.length; i++) {
      const isHl = i === highlight;

      if (isHl) {
        ctx.fillStyle = `rgba(180,80,255,${0.1 + Math.abs(pulse) * 0.06})`;
        ctx.beginPath();
        ctx.roundRect(px + 6, cy - 12, panelW - 12, 26, 3);
        ctx.fill();
      }

      ctx.textAlign = "right";
      ctx.font = "bold 12px sans-serif";
      ctx.fillStyle = isHl
        ? `hsl(${285 + pulse * 10},100%,${78 + Math.abs(pulse) * 8}%)`
        : "rgba(210,185,245,0.88)";
      if (isHl) {
        ctx.shadowColor = "rgba(220,100,255,0.9)";
        ctx.shadowBlur = 7;
      }
      ctx.fillText(cmds[i].cmd, px + panelW - 12, cy);
      ctx.shadowBlur = 0;

      ctx.font = "10px sans-serif";
      ctx.fillStyle = "rgba(155,130,195,0.65)";
      ctx.fillText(cmds[i].desc, px + panelW - 12, cy + 12);

      cy += 28;
    }

    // Footer
    ctx.font = "9px sans-serif";
    ctx.fillStyle = `rgba(120,90,170,${0.4 + slow * 0.15})`;
    ctx.textAlign = "center";
    ctx.fillText("للمطور فقط", px + panelW / 2, totalH - 8);

    // Scan line effect (subtle)
    const scanY = (f * 6) % totalH;
    ctx.fillStyle = "rgba(140,80,255,0.04)";
    ctx.fillRect(px, scanY, panelW, 3);

    encoder.addFrame(ctx);
  }

  encoder.finish();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(outPath));
    stream.on("error", reject);
  });
}

module.exports = buildHelpGif;
