const { createCanvas } = require("canvas");
const GifEncoder = require("gif-encoder-2");
const fs = require("fs");
const path = require("path");

function buildHelpGif(prefix) {
  const p = prefix || "!";
  const W = 680;
  const H = 420;
  const FRAMES = 72;
  const outPath = path.join(__dirname, "..", "assets", "help.gif");

  if (!fs.existsSync(path.join(__dirname, "..", "assets"))) {
    fs.mkdirSync(path.join(__dirname, "..", "assets"));
  }

  const encoder = new GifEncoder(W, H);
  const stream = fs.createWriteStream(outPath);
  encoder.createReadStream().pipe(stream);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(55);
  encoder.setQuality(5);

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // Commands list
  const cmds = [
    { cmd: `${p}حماية`, desc: "تفعيل الحماية" },
    { cmd: `${p}اسم`, desc: "تغيير الاسم" },
    { cmd: `${p}كنيات`, desc: "تغيير الكنيات" },
    { cmd: `${p}ضيف`, desc: "إضافة عضو" },
    { cmd: `${p}لينك`, desc: "رابط صورة" },
    { cmd: `${p}حفظ`, desc: "حفظ رسالة" },
    { cmd: `${p}اتوميك`, desc: "إرسال تلقائي" },
    { cmd: `${p}قروبات`, desc: "قائمة الجروبات" },
    { cmd: `${p}prefix`, desc: "البادئة" },
    { cmd: `${p}uptime`, desc: "حالة البوت" },
    { cmd: `${p}ping`, desc: "اختبار" },
    { cmd: `${p}خروج`, desc: "إخراج البوت" },
  ];

  // Particle pool (fixed seeds for determinism)
  const particles = Array.from({ length: 40 }, (_, i) => ({
    x: (i * 47 + 13) % W,
    y: (i * 83 + 31) % H,
    vx: ((i % 7) - 3) * 0.5,
    vy: -0.4 - (i % 5) * 0.3,
    size: 1.5 + (i % 4),
    hue: 20 + (i % 3) * 30,
  }));

  // Energy orb seeds
  const orbs = Array.from({ length: 6 }, (_, i) => ({
    angle: (i / 6) * Math.PI * 2,
    radius: 55 + i * 8,
    speed: 0.04 + i * 0.008,
    hue: 200 + i * 20,
  }));

  function lerp(a, b, t) { return a + (b - a) * t; }

  for (let f = 0; f < FRAMES; f++) {
    const t = f / FRAMES;
    const beat = Math.sin(t * Math.PI * 8);       // fast pulse
    const slow = Math.sin(t * Math.PI * 2);       // slow pulse
    const phase = t * Math.PI * 2;

    // ===========================
    // 1. BACKGROUND
    // ===========================
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, `hsl(240,${70 + slow * 8}%,${5 + slow * 3}%)`);
    bg.addColorStop(0.5, `hsl(260,60%,${8 + slow * 2}%)`);
    bg.addColorStop(1, `hsl(220,80%,${4 + slow * 2}%)`);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Hex grid subtle pattern
    ctx.strokeStyle = "rgba(100,80,200,0.06)";
    ctx.lineWidth = 0.5;
    const hs = 28;
    for (let gy = -hs; gy < H + hs; gy += hs * 1.5) {
      for (let gx = -hs; gx < W + hs; gx += hs * 1.73) {
        const ox = (Math.floor(gy / (hs * 1.5)) % 2) * (hs * 0.866);
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2 - Math.PI / 6;
          const hx = gx + ox + Math.cos(a) * hs * 0.5;
          const hy = gy + Math.sin(a) * hs * 0.5;
          k === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Scan line sweep
    const scanY = (f * 7) % H;
    const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
    scanGrad.addColorStop(0, "rgba(120,80,255,0)");
    scanGrad.addColorStop(0.5, "rgba(120,80,255,0.07)");
    scanGrad.addColorStop(1, "rgba(120,80,255,0)");
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanY - 20, W, 40);

    // ===========================
    // 2. PARTICLES
    // ===========================
    for (const par of particles) {
      par.x += par.vx;
      par.y += par.vy;
      if (par.y < -5) { par.y = H + 5; par.x = Math.random() * W; }
      if (par.x < 0) par.x = W;
      if (par.x > W) par.x = 0;
      const alpha = 0.3 + Math.abs(Math.sin(phase + par.x * 0.05)) * 0.6;
      ctx.beginPath();
      ctx.arc(par.x, par.y, par.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${par.hue},100%,70%,${alpha})`;
      ctx.fill();
    }

    // ===========================
    // 3. DIVIDER LINE (animated)
    // ===========================
    const divX = 390;
    const lineAlpha = 0.5 + beat * 0.3;
    const lineGrad = ctx.createLinearGradient(divX, 0, divX, H);
    lineGrad.addColorStop(0, `rgba(160,60,255,0)`);
    lineGrad.addColorStop(0.3, `rgba(220,80,255,${lineAlpha})`);
    lineGrad.addColorStop(0.7, `rgba(180,100,255,${lineAlpha})`);
    lineGrad.addColorStop(1, `rgba(160,60,255,0)`);
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(divX, 10);
    ctx.lineTo(divX, H - 10);
    ctx.stroke();

    // ===========================
    // 4. MARCO CHARACTER (left panel)
    // ===========================
    const cx = 195;
    const baseY = 290;
    // Combat animation states cycle
    const actionPhase = Math.floor(t * 4) % 4; // 0=stance,1=punch,2=kick,3=magic
    const subT = (t * 4) % 1;                  // 0..1 within current action
    const bob = Math.sin(phase * 2) * 4;        // body bob

    // ── Energy aura around Marco ──
    for (let layer = 3; layer >= 0; layer--) {
      const auraR = 70 + layer * 18 + slow * 12;
      const auraAlpha = (0.06 - layer * 0.012) * (1 + beat * 0.5);
      const auraHue = 270 + layer * 15 + f * 2;
      ctx.beginPath();
      ctx.arc(cx, baseY - 60, auraR, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${auraHue},100%,60%,${auraAlpha})`;
      ctx.fill();
    }

    // Orbiting energy orbs
    for (const orb of orbs) {
      orb.angle += orb.speed;
      const ox = cx + Math.cos(orb.angle) * orb.radius;
      const oy = (baseY - 60) + Math.sin(orb.angle) * orb.radius * 0.4;
      const orbAlpha = 0.5 + Math.sin(orb.angle * 2) * 0.4;
      const orbR = 3 + Math.sin(orb.angle) * 1.5;
      // Tail
      for (let k = 1; k <= 5; k++) {
        const ta = orb.angle - k * 0.15;
        const tx = cx + Math.cos(ta) * orb.radius;
        const ty = (baseY - 60) + Math.sin(ta) * orb.radius * 0.4;
        ctx.beginPath();
        ctx.arc(tx, ty, orbR * (1 - k * 0.15), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${orb.hue},100%,70%,${orbAlpha * (1 - k * 0.18)})`;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(ox, oy, orbR, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${orb.hue},100%,85%,${orbAlpha})`;
      ctx.shadowColor = `hsl(${orb.hue},100%,70%)`;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Shadow
    ctx.save();
    ctx.translate(cx, baseY + 8 + bob * 0.3);
    ctx.scale(1, 0.18);
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.fill();
    ctx.restore();

    // ── Leg positions based on action ──
    let lLegAngle = 0.1, rLegAngle = -0.1;
    let lArmAngle = -0.3, rArmAngle = 0.3;
    let punchExtend = 0;   // right arm punch extension
    let kickExtend = 0;    // right leg kick
    let bodyLean = 0;

    if (actionPhase === 1) { // PUNCH
      punchExtend = Math.sin(subT * Math.PI) * 40;
      bodyLean = Math.sin(subT * Math.PI) * 0.2;
      rArmAngle = -0.5 + Math.sin(subT * Math.PI) * 0.8;
      lArmAngle = 0.4;
    } else if (actionPhase === 2) { // KICK
      kickExtend = Math.sin(subT * Math.PI) * 45;
      bodyLean = -Math.sin(subT * Math.PI) * 0.15;
      rLegAngle = -0.6 + Math.sin(subT * Math.PI) * 1.2;
      lArmAngle = -0.5;
    } else if (actionPhase === 3) { // MAGIC
      lArmAngle = -0.8 + slow * 0.3;
      rArmAngle = -0.6 + beat * 0.2;
      // Magic blast particles
      for (let k = 0; k < 8; k++) {
        const ba = (k / 8) * Math.PI * 2 + phase * 3;
        const br = 15 + subT * 50;
        const bx = cx - 40 + Math.cos(ba) * br;
        const by = baseY - 120 + Math.sin(ba) * br;
        ctx.beginPath();
        ctx.arc(bx, by, 3 + Math.sin(subT * Math.PI + k) * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${280 + k * 10},100%,75%,${(1 - subT) * 0.8})`;
        ctx.fill();
      }
    } else { // STANCE — idle bob
      const idleArm = Math.sin(phase * 1.5) * 0.1;
      lArmAngle = -0.2 + idleArm;
      rArmAngle = 0.2 - idleArm;
      lLegAngle = 0.15;
      rLegAngle = -0.15;
    }

    const bodyX = cx + bodyLean * 15;
    const bodyBobY = baseY + bob;

    // ── Legs ──
    ctx.fillStyle = "#1a1a2e";
    // Left leg
    ctx.save();
    ctx.translate(bodyX - 14, bodyBobY - 5);
    ctx.rotate(lLegAngle);
    ctx.fillRect(-9, 0, 18, 68);
    ctx.restore();
    // Right leg
    ctx.save();
    ctx.translate(bodyX + 14, bodyBobY - 5);
    ctx.rotate(rLegAngle - kickExtend * 0.022);
    ctx.fillRect(-9, 0, 18, 68);
    ctx.restore();
    // Kick energy
    if (kickExtend > 10) {
      const kx = bodyX + 28 + kickExtend;
      const ky = bodyBobY + 50;
      const kg = ctx.createRadialGradient(kx, ky, 2, kx, ky, 20 + kickExtend * 0.3);
      kg.addColorStop(0, `rgba(255,200,50,${kickExtend / 50})`);
      kg.addColorStop(1, "rgba(255,100,0,0)");
      ctx.fillStyle = kg;
      ctx.beginPath();
      ctx.arc(kx, ky, 20 + kickExtend * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shoes
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.ellipse(bodyX - 14, bodyBobY + 65, 18, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bodyX + 14, bodyBobY + 65, 18, 8, 0, 0, Math.PI * 2); ctx.fill();

    // ── Hoodie body ──
    const hoodieR = ctx.createLinearGradient(bodyX - 42, 0, bodyX + 42, 0);
    hoodieR.addColorStop(0, `rgb(${180 + beat * 20},25,25)`);
    hoodieR.addColorStop(0.5, `rgb(${210 + beat * 20},35,35)`);
    hoodieR.addColorStop(1, `rgb(${160 + beat * 15},20,20)`);
    ctx.fillStyle = hoodieR;
    ctx.beginPath();
    ctx.roundRect(bodyX - 42, bodyBobY - 90, 84, 90, 6);
    ctx.fill();

    // Pocket
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath(); ctx.roundRect(bodyX - 20, bodyBobY - 22, 40, 20, 3); ctx.fill();
    // Zipper
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(bodyX, bodyBobY - 85); ctx.lineTo(bodyX, bodyBobY - 5); ctx.stroke();

    // ── Arms ──
    // Left arm
    ctx.fillStyle = `rgb(${190 + beat * 15},28,28)`;
    ctx.save();
    ctx.translate(bodyX - 42, bodyBobY - 75);
    ctx.rotate(lArmAngle);
    ctx.fillRect(-18, 0, 18, 65);
    ctx.restore();
    // Left fist
    ctx.fillStyle = "#f4c2a1";
    ctx.beginPath();
    ctx.arc(
      bodyX - 42 + Math.sin(lArmAngle) * 65,
      bodyBobY - 75 + Math.cos(lArmAngle) * 65,
      10, 0, Math.PI * 2
    );
    ctx.fill();

    // Right arm
    ctx.fillStyle = `rgb(${190 + beat * 15},28,28)`;
    ctx.save();
    ctx.translate(bodyX + 42, bodyBobY - 75);
    ctx.rotate(rArmAngle);
    ctx.fillRect(0, 0, 18, 65);
    ctx.restore();
    // Right fist
    const rfx = bodyX + 42 + Math.sin(rArmAngle) * 65 + punchExtend;
    const rfy = bodyBobY - 75 + Math.cos(rArmAngle) * 65;
    ctx.fillStyle = "#f4c2a1";
    ctx.beginPath(); ctx.arc(rfx, rfy, 10, 0, Math.PI * 2); ctx.fill();
    // Punch impact
    if (punchExtend > 15) {
      const pg = ctx.createRadialGradient(rfx, rfy, 2, rfx, rfy, 18 + punchExtend * 0.4);
      pg.addColorStop(0, `rgba(255,180,0,${punchExtend / 40})`);
      pg.addColorStop(1, "rgba(255,80,0,0)");
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(rfx, rfy, 18 + punchExtend * 0.4, 0, Math.PI * 2); ctx.fill();
    }

    // ── Neck ──
    ctx.fillStyle = "#f4c2a1";
    ctx.fillRect(bodyX - 10, bodyBobY - 105, 20, 20);

    // ── Head ──
    ctx.fillStyle = "#f4c2a1";
    ctx.beginPath();
    ctx.ellipse(bodyX, bodyBobY - 135, 36, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head shading
    ctx.fillStyle = "rgba(180,100,70,0.1)";
    ctx.beginPath();
    ctx.ellipse(bodyX + 10, bodyBobY - 130, 22, 30, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // ── Hair ──
    ctx.fillStyle = "#2d1200";
    ctx.beginPath();
    ctx.ellipse(bodyX, bodyBobY - 168, 36, 18, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Side hair
    ctx.beginPath(); ctx.ellipse(bodyX - 30, bodyBobY - 150, 12, 22, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bodyX + 30, bodyBobY - 150, 12, 22, 0.4, 0, Math.PI * 2); ctx.fill();
    // Hair spike
    const spikeWave = slow * 5;
    ctx.beginPath();
    ctx.moveTo(bodyX - 6, bodyBobY - 178 - spikeWave);
    ctx.quadraticCurveTo(bodyX + 8 + beat * 3, bodyBobY - 196 - spikeWave, bodyX + 14, bodyBobY - 174);
    ctx.quadraticCurveTo(bodyX + 4, bodyBobY - 168, bodyX - 6, bodyBobY - 178 - spikeWave);
    ctx.fill();

    // ── Eyes ──
    const blink = (f % 44 > 41) ? 0.1 : 1;
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.ellipse(bodyX - 12, bodyBobY - 138, 7, 8 * blink, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bodyX + 12, bodyBobY - 138, 7, 8 * blink, 0, 0, Math.PI * 2); ctx.fill();
    // Pupils - intense combat look
    ctx.fillStyle = actionPhase !== 0 ? "#ff3300" : "#2d1200";
    ctx.beginPath(); ctx.ellipse(bodyX - 12, bodyBobY - 138, 3.5, 4.5 * blink, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bodyX + 12, bodyBobY - 138, 3.5, 4.5 * blink, 0, 0, Math.PI * 2); ctx.fill();
    // Eye glow when attacking
    if (actionPhase !== 0) {
      ctx.fillStyle = `rgba(255,80,0,${0.3 + beat * 0.2})`;
      ctx.beginPath(); ctx.arc(bodyX - 12, bodyBobY - 138, 9, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(bodyX + 12, bodyBobY - 138, 9, 0, Math.PI * 2); ctx.fill();
    }
    // Eye shine
    ctx.fillStyle = "white";
    ctx.beginPath(); ctx.arc(bodyX - 10, bodyBobY - 141, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bodyX + 14, bodyBobY - 141, 1.5, 0, Math.PI * 2); ctx.fill();

    // Eyebrows — angry in combat
    ctx.strokeStyle = "#2d1200";
    ctx.lineWidth = 2.5; ctx.lineCap = "round";
    const browTilt = actionPhase !== 0 ? 0.3 : 0;
    ctx.beginPath();
    ctx.moveTo(bodyX - 20, bodyBobY - 150 - browTilt * 4);
    ctx.quadraticCurveTo(bodyX - 12, bodyBobY - 154 + browTilt * 4, bodyX - 4, bodyBobY - 150);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bodyX + 4, bodyBobY - 150);
    ctx.quadraticCurveTo(bodyX + 12, bodyBobY - 154 + browTilt * 4, bodyX + 20, bodyBobY - 150 - browTilt * 4);
    ctx.stroke();

    // Mouth — gritted teeth in combat
    if (actionPhase !== 0 && subT < 0.7) {
      ctx.strokeStyle = "#c0705a";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bodyX - 8, bodyBobY - 122);
      ctx.lineTo(bodyX + 8, bodyBobY - 122);
      ctx.stroke();
      // Teeth
      ctx.fillStyle = "white";
      for (let k = -3; k <= 3; k++) {
        ctx.fillRect(bodyX + k * 2.5 - 1, bodyBobY - 124, 2, 3);
      }
    } else {
      ctx.strokeStyle = "#c0705a";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(bodyX, bodyBobY - 118, 9, 0.1, Math.PI - 0.1);
      ctx.stroke();
    }

    // ===========================
    // 5. GROUND SHOCKWAVE (on attack)
    // ===========================
    if ((actionPhase === 1 || actionPhase === 2) && subT > 0.4 && subT < 0.8) {
      const swT = (subT - 0.4) / 0.4;
      const swR = swT * 80;
      const swAlpha = (1 - swT) * 0.6;
      for (let ring = 0; ring < 3; ring++) {
        const rr = swR - ring * 15;
        if (rr < 0) continue;
        ctx.beginPath();
        ctx.ellipse(cx, baseY + 12, rr, rr * 0.2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,${150 + ring * 30},0,${swAlpha - ring * 0.15})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // ===========================
    // 6. NAME PLATE (below Marco)
    // ===========================
    ctx.save();
    ctx.shadowColor = `rgba(220,80,255,${0.6 + beat * 0.4})`;
    ctx.shadowBlur = 12 + beat * 8;
    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "#e040fb";
    ctx.textAlign = "center";
    ctx.fillText("ᴹᵃʳᶜᵒ", cx, baseY + 38 + bob * 0.3);
    ctx.restore();

    ctx.font = "11px sans-serif";
    ctx.fillStyle = `rgba(200,160,255,${0.5 + slow * 0.3})`;
    ctx.textAlign = "center";
    ctx.fillText("Star vs. The Forces of Evil", cx, baseY + 54);

    // Action label
    const actionLabels = ["قتال", "لكمة!", "ركلة!", "سحر!"];
    if (actionPhase !== 0) {
      ctx.save();
      ctx.font = `bold ${14 + beat * 3}px sans-serif`;
      ctx.fillStyle = `hsla(${30 + actionPhase * 40},100%,65%,${0.7 + beat * 0.3})`;
      ctx.shadowColor = `hsla(${30 + actionPhase * 40},100%,65%,0.8)`;
      ctx.shadowBlur = 15;
      ctx.textAlign = "center";
      ctx.fillText(actionLabels[actionPhase], cx, baseY - 175 + slow * 5);
      ctx.restore();
    }

    // ===========================
    // 7. COMMANDS PANEL (right)
    // ===========================
    const panelX = divX + 10;
    const panelW = W - panelX - 8;

    // Panel bg
    const panelBg = ctx.createLinearGradient(panelX, 0, panelX + panelW, H);
    panelBg.addColorStop(0, "rgba(10,6,28,0.92)");
    panelBg.addColorStop(1, "rgba(18,10,40,0.92)");
    ctx.fillStyle = panelBg;
    ctx.beginPath();
    ctx.roundRect(panelX, 8, panelW, H - 16, 8);
    ctx.fill();

    // Panel border
    ctx.strokeStyle = `rgba(${160 + beat * 40},80,255,${0.4 + beat * 0.3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(panelX, 8, panelW, H - 16, 8);
    ctx.stroke();

    // Title
    ctx.save();
    ctx.shadowColor = `rgba(230,180,255,${0.7 + beat * 0.3})`;
    ctx.shadowBlur = 10;
    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#e040fb";
    ctx.textAlign = "right";
    ctx.fillText("⚔  قائمة الأوامر", panelX + panelW - 10, 30);
    ctx.restore();

    // Underline
    ctx.strokeStyle = `rgba(200,80,255,${0.4 + slow * 0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 10, 38);
    ctx.lineTo(panelX + panelW - 10, 38);
    ctx.stroke();

    // Commands
    let cy2 = 54;
    for (let i = 0; i < cmds.length; i++) {
      const highlight = Math.floor(t * cmds.length) % cmds.length === i;
      ctx.textAlign = "right";

      if (highlight) {
        ctx.fillStyle = `rgba(220,160,255,${0.08 + beat * 0.05})`;
        ctx.beginPath();
        ctx.roundRect(panelX + 4, cy2 - 12, panelW - 8, 26, 4);
        ctx.fill();
      }

      ctx.font = `bold 12px sans-serif`;
      ctx.fillStyle = highlight
        ? `hsl(${280 + beat * 20},100%,${75 + beat * 10}%)`
        : "rgba(200,170,240,0.9)";
      if (highlight) {
        ctx.shadowColor = "rgba(220,100,255,0.8)";
        ctx.shadowBlur = 8;
      }
      ctx.fillText(cmds[i].cmd, panelX + panelW - 10, cy2);
      ctx.shadowBlur = 0;

      ctx.font = "10px sans-serif";
      ctx.fillStyle = "rgba(160,140,200,0.7)";
      ctx.fillText(cmds[i].desc, panelX + panelW - 10, cy2 + 12);

      cy2 += 28;
    }

    // Footer
    ctx.font = "9px sans-serif";
    ctx.fillStyle = `rgba(130,100,180,${0.4 + slow * 0.2})`;
    ctx.textAlign = "center";
    ctx.fillText("للمطور فقط", panelX + panelW / 2, H - 14);

    // ===========================
    // 8. VIGNETTE
    // ===========================
    const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.25, W / 2, H / 2, H * 0.8);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, "rgba(0,0,0,0.5)");
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

module.exports = buildHelpGif;
