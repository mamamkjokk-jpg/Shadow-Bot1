const { createCanvas } = require("canvas");
const GifEncoder = require("gif-encoder-2");
const fs = require("fs");
const path = require("path");

function generateHelpGif(prefix) {
  const width = 520;
  const lines = [
    { text: "ᴹᵃʳᶜᵒ — قائمة الأوامر", size: 22, color: "#f0c040", bold: true },
    { text: "", size: 10 },
    { text: "الحماية", size: 15, color: "#a78bfa", bold: true },
    { text: `  ${prefix}حماية — تفعيل/إيقاف حماية الاسم والكنيات`, size: 13, color: "#e2e8f0" },
    { text: "", size: 10 },
    { text: "تعديل الجروب", size: 15, color: "#a78bfa", bold: true },
    { text: `  ${prefix}اسم [الاسم] — تغيير اسم الجروب`, size: 13, color: "#e2e8f0" },
    { text: `  ${prefix}كنيات [الكنية] — تغيير كل الكنيات`, size: 13, color: "#e2e8f0" },
    { text: `  ${prefix}ضيف [ID] — إضافة عضو`, size: 13, color: "#e2e8f0" },
    { text: "", size: 10 },
    { text: "الرسائل", size: 15, color: "#a78bfa", bold: true },
    { text: `  ${prefix}حفظ — (ردّ) حفظ رسالة للاتوميك`, size: 13, color: "#e2e8f0" },
    { text: `  ${prefix}حفظ قائمة — عرض الرسائل`, size: 13, color: "#e2e8f0" },
    { text: `  ${prefix}حفظ اختيار [رقم] — تغيير رسالة الاتوميك`, size: 13, color: "#e2e8f0" },
    { text: "", size: 10 },
    { text: "الإرسال التلقائي", size: 15, color: "#a78bfa", bold: true },
    { text: `  ${prefix}اتوميك — بدء الإرسال كل 15 ثانية`, size: 13, color: "#e2e8f0" },
    { text: `  ${prefix}اتوميك ايقاف — إيقاف`, size: 13, color: "#e2e8f0" },
    { text: "", size: 10 },
    { text: "الجروبات والأخرى", size: 15, color: "#a78bfa", bold: true },
    { text: `  ${prefix}قروبات — قائمة الجروبات`, size: 13, color: "#e2e8f0" },
    { text: `  ${prefix}prefix — إعدادات البادئة`, size: 13, color: "#e2e8f0" },
    { text: `  ${prefix}uptime — حالة البوت`, size: 13, color: "#e2e8f0" },
    { text: `  ${prefix}ping — اختبار الاتصال`, size: 13, color: "#e2e8f0" },
    { text: `  ${prefix}خروج — إخراج البوت`, size: 13, color: "#e2e8f0" },
    { text: "", size: 10 },
    { text: "جميع الأوامر للمطور فقط", size: 13, color: "#94a3b8" },
  ];

  const paddingY = 18;
  const paddingX = 24;
  const lineGap = 6;
  let totalHeight = paddingY;
  for (const l of lines) totalHeight += (l.size || 13) + lineGap;
  totalHeight += paddingY;

  const frames = 30;
  const gifPath = path.join(__dirname, "..", "assets", "help.gif");

  if (!fs.existsSync(path.join(__dirname, "..", "assets"))) {
    fs.mkdirSync(path.join(__dirname, "..", "assets"));
  }

  const encoder = new GifEncoder(width, totalHeight);
  const stream = fs.createWriteStream(gifPath);
  encoder.createReadStream().pipe(stream);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(80);
  encoder.setQuality(5);

  const canvas = createCanvas(width, totalHeight);
  const ctx = canvas.getContext("2d");

  for (let f = 0; f < frames; f++) {
    const shimmer = Math.sin((f / frames) * Math.PI * 2);

    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, width, totalHeight);

    const borderAlpha = 0.5 + shimmer * 0.4;
    ctx.strokeStyle = `rgba(167, 139, 250, ${borderAlpha})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, width - 8, totalHeight - 8);

    let y = paddingY;
    for (const line of lines) {
      if (!line.text) { y += (line.size || 10) + lineGap; continue; }
      ctx.font = `${line.bold ? "bold " : ""}${line.size || 13}px sans-serif`;
      ctx.fillStyle = line.color || "#e2e8f0";

      if (line.bold && line.size >= 20) {
        const glow = Math.abs(shimmer);
        ctx.shadowColor = `rgba(240, 192, 64, ${glow * 0.8})`;
        ctx.shadowBlur = 10 + glow * 8;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.textAlign = "right";
      ctx.fillText(line.text, width - paddingX, y + (line.size || 13));
      ctx.textAlign = "left";
      ctx.shadowBlur = 0;
      y += (line.size || 13) + lineGap;
    }

    encoder.addFrame(ctx);
  }

  encoder.finish();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(gifPath));
    stream.on("error", reject);
  });
}

module.exports = generateHelpGif;
