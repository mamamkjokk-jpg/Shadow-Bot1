const { createCanvas } = require("canvas");
const GifEncoder = require("gif-encoder-2");
const fs = require("fs");
const path = require("path");

function generateMarcoGif() {
  const W = 480;
  const H = 560;
  const outPath = path.join(__dirname, "..", "assets", "marco.gif");

  if (!fs.existsSync(path.join(__dirname, "..", "assets"))) {
    fs.mkdirSync(path.join(__dirname, "..", "assets"));
  }

  const encoder = new GifEncoder(W, H);
  const stream = fs.createWriteStream(outPath);
  encoder.createReadStream().pipe(stream);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(50);
  encoder.setQuality(3);

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const FRAMES = 48;

  for (let f = 0; f < FRAMES; f++) {
    const t = f / FRAMES;
    const pulse = Math.sin(t * Math.PI * 2);
    const pulse2 = Math.sin(t * Math.PI * 4);
    const wave = Math.sin(t * Math.PI * 2);

    // === BG gradient (night sky) ===
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `hsl(240,${60 + pulse * 8}%,${8 + pulse * 3}%)`);
    grad.addColorStop(0.5, `hsl(250,50%,${12 + pulse * 2}%)`);
    grad.addColorStop(1, `hsl(260,40%,${6 + pulse * 2}%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // === Stars ===
    const starSeeds = [
      [40,30],[90,55],[160,20],[220,45],[300,25],[360,60],[420,35],[60,80],
      [130,90],[200,70],[280,85],[350,40],[410,75],[20,110],[100,120],[170,100],
      [250,115],[330,95],[390,125],[450,105],[70,140],[140,160],[210,135],
      [290,150],[370,140],[440,155],[30,170],[110,180],[180,165],[260,175],
    ];
    for (const [sx, sy] of starSeeds) {
      const twinkle = Math.sin(t * Math.PI * 4 + sx * 0.3) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 1 + twinkle * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.3 + twinkle * 0.7})`;
      ctx.fill();
    }

    // === Magic sparkles floating ===
    for (let i = 0; i < 8; i++) {
      const angle = (t * Math.PI * 2) + (i * Math.PI / 4);
      const rx = 185 + Math.cos(angle) * (110 + pulse2 * 20);
      const ry = 210 + Math.sin(angle) * (110 + pulse2 * 20) - Math.abs(wave) * 10;
      const alpha = 0.3 + Math.abs(Math.sin(t * Math.PI * 2 + i)) * 0.7;
      const hue = (i * 45 + f * 4) % 360;
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5 + Math.abs(pulse2) * 2, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue},100%,75%,${alpha})`;
      ctx.fill();
    }

    // === Glow circle behind Marco ===
    const glowR = ctx.createRadialGradient(W / 2, 220, 30, W / 2, 220, 160 + pulse * 20);
    glowR.addColorStop(0, `rgba(180,60,60,${0.25 + pulse * 0.1})`);
    glowR.addColorStop(0.5, `rgba(120,30,180,${0.12 + pulse * 0.05})`);
    glowR.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glowR;
    ctx.beginPath();
    ctx.arc(W / 2, 220, 180 + pulse * 20, 0, Math.PI * 2);
    ctx.fill();

    // ============================
    // MARCO CHARACTER (stylized)
    // ============================
    const cx = W / 2;
    const bodyY = 195 + wave * 4;

    // Shadow under feet
    ctx.save();
    ctx.translate(cx, 430 + wave * 2);
    ctx.scale(1, 0.2);
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();
    ctx.restore();

    // ── Legs ──
    ctx.fillStyle = "#1a1a2e";
    // left leg
    ctx.fillRect(cx - 30, bodyY + 115, 22, 70);
    // right leg
    ctx.fillRect(cx + 8, bodyY + 115, 22, 70);

    // Shoes
    ctx.fillStyle = "#111";
    // left shoe
    ctx.beginPath();
    ctx.ellipse(cx - 19, bodyY + 188, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // right shoe
    ctx.beginPath();
    ctx.ellipse(cx + 19, bodyY + 188, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Hoodie body (red) ──
    const hoodieR = 200 + Math.floor(pulse * 15);
    ctx.fillStyle = `rgb(${hoodieR},30,30)`;
    ctx.beginPath();
    ctx.roundRect(cx - 45, bodyY + 35, 90, 90, 8);
    ctx.fill();

    // Hoodie darker shadow side
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.roundRect(cx + 5, bodyY + 35, 40, 90, [0, 8, 8, 0]);
    ctx.fill();

    // Hoodie pocket
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.roundRect(cx - 22, bodyY + 95, 44, 25, 4);
    ctx.fill();

    // Hoodie front zipper line
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, bodyY + 40);
    ctx.lineTo(cx, bodyY + 122);
    ctx.stroke();

    // ── Arms ──
    const armSwing = Math.sin(t * Math.PI * 2) * 8;
    // left arm
    ctx.fillStyle = `rgb(${hoodieR},30,30)`;
    ctx.save();
    ctx.translate(cx - 45, bodyY + 50);
    ctx.rotate(-0.15 + armSwing * 0.02);
    ctx.fillRect(-20, 0, 20, 65);
    ctx.restore();
    // right arm
    ctx.save();
    ctx.translate(cx + 45, bodyY + 50);
    ctx.rotate(0.15 - armSwing * 0.02);
    ctx.fillRect(0, 0, 20, 65);
    ctx.restore();

    // Left hand (skin)
    ctx.fillStyle = "#f4c2a1";
    ctx.beginPath();
    ctx.arc(cx - 56, bodyY + 115 + armSwing, 11, 0, Math.PI * 2);
    ctx.fill();
    // Right hand
    ctx.beginPath();
    ctx.arc(cx + 56, bodyY + 115 - armSwing, 11, 0, Math.PI * 2);
    ctx.fill();

    // ── Neck ──
    ctx.fillStyle = "#f4c2a1";
    ctx.fillRect(cx - 11, bodyY + 18, 22, 22);

    // ── Head ──
    ctx.fillStyle = "#f4c2a1";
    ctx.beginPath();
    ctx.ellipse(cx, bodyY - 15, 38, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head shading
    ctx.fillStyle = "rgba(200,120,80,0.12)";
    ctx.beginPath();
    ctx.ellipse(cx + 10, bodyY - 10, 25, 32, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // ── Hair (dark brown, messy) ──
    ctx.fillStyle = "#3d1f00";
    // Main hair mass
    ctx.beginPath();
    ctx.ellipse(cx, bodyY - 48, 38, 20, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Side hair left
    ctx.beginPath();
    ctx.ellipse(cx - 32, bodyY - 35, 12, 22, -0.4, 0, Math.PI * 2);
    ctx.fill();
    // Side hair right
    ctx.beginPath();
    ctx.ellipse(cx + 32, bodyY - 35, 12, 22, 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Tuft/spike
    ctx.beginPath();
    ctx.moveTo(cx - 8, bodyY - 62);
    ctx.quadraticCurveTo(cx + 5 + pulse * 3, bodyY - 80, cx + 12, bodyY - 60);
    ctx.quadraticCurveTo(cx + 2, bodyY - 55, cx - 8, bodyY - 62);
    ctx.fill();

    // ── Eyes ──
    const blink = (f % 40 > 37) ? 0.15 : 1;
    // whites
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(cx - 13, bodyY - 18, 8, 9 * blink, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 13, bodyY - 18, 8, 9 * blink, 0, 0, Math.PI * 2);
    ctx.fill();
    // pupils (brown)
    ctx.fillStyle = "#3d1f00";
    ctx.beginPath();
    ctx.ellipse(cx - 13, bodyY - 18, 4, 5 * blink, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 13, bodyY - 18, 4, 5 * blink, 0, 0, Math.PI * 2);
    ctx.fill();
    // shine
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cx - 11, bodyY - 20, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 15, bodyY - 20, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = "#3d1f00";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - 20, bodyY - 29);
    ctx.quadraticCurveTo(cx - 13, bodyY - 32, cx - 6, bodyY - 29);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 6, bodyY - 29);
    ctx.quadraticCurveTo(cx + 13, bodyY - 32, cx + 20, bodyY - 29);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = "rgba(180,100,70,0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, bodyY - 10);
    ctx.quadraticCurveTo(cx + 5, bodyY - 5, cx + 3, bodyY - 3);
    ctx.stroke();

    // Smile
    ctx.strokeStyle = "#c0705a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, bodyY + 2, 10, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Cheek blush
    ctx.fillStyle = "rgba(255,150,120,0.25)";
    ctx.beginPath();
    ctx.ellipse(cx - 22, bodyY, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 22, bodyY, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ============================
    // TEXT
    // ============================
    // Glow effect on title
    ctx.save();
    ctx.shadowColor = `rgba(255,80,80,${0.6 + pulse * 0.4})`;
    ctx.shadowBlur = 18 + pulse * 10;
    ctx.font = "bold 30px sans-serif";
    ctx.fillStyle = "#ff4444";
    ctx.textAlign = "center";
    ctx.fillText("ᴹᵃʳᶜᵒ", cx, 380 + wave * 2);
    ctx.restore();

    ctx.font = "16px sans-serif";
    ctx.fillStyle = `rgba(220,200,255,${0.7 + pulse * 0.3})`;
    ctx.textAlign = "center";
    ctx.fillText("Star vs. The Forces of Evil", cx, 408 + wave);

    // Bottom decorative line
    const lineAlpha = 0.4 + pulse * 0.3;
    ctx.strokeStyle = `rgba(200,80,80,${lineAlpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(60, 425);
    ctx.lineTo(W - 60, 425);
    ctx.stroke();

    // Small stars at line ends
    for (const sx of [55, W - 55]) {
      ctx.beginPath();
      ctx.arc(sx, 425, 3 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,150,150,${0.5 + pulse * 0.5})`;
      ctx.fill();
    }

    // Subtle vignette
    const vig = ctx.createRadialGradient(cx, H / 2, H * 0.3, cx, H / 2, H * 0.75);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    encoder.addFrame(ctx);
  }

  encoder.finish();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(outPath));
    stream.on("error", reject);
  });
}

module.exports = generateMarcoGif;
