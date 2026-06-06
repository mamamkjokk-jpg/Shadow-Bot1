const os = require("os");

module.exports = (api, event, args, startTime, loadData, saveData, automicTimers, config, hostingInfo) => {
  const diff = Date.now() - startTime;
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / 60000) % 60;
  const hours = Math.floor(diff / 3600000) % 24;
  const days = Math.floor(diff / 86400000);

  let uptime = "";
  if (days > 0) uptime += `${days}ي `;
  if (hours > 0) uptime += `${hours}س `;
  if (minutes > 0) uptime += `${minutes}د `;
  uptime += `${seconds}ث`;

  const data = loadData();

  const memUsed = Math.round(process.memoryUsage().rss / 1024 / 1024);
  const memHeap = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
  const totalMem = Math.round(os.totalmem() / 1024 / 1024);
  const freeMem = Math.round(os.freemem() / 1024 / 1024);

  const platform = hostingInfo?.platform || os.platform();
  const arch = hostingInfo?.arch || os.arch();
  const nodeVer = hostingInfo?.node || process.version;

  const protectedCount = Object.values(data.protected || {}).filter(p => p.active).length;
  const automicCount = Object.keys(automicTimers).length;
  const savedCount = (data.savedMessages || []).length;
  const prefix = data.prefix || "!";
  const freeMode = data.freePrefix ? "حرة ✅" : "مقيدة ❌";

  const cpuLoad = os.loadavg();

  const msg =
`╔══════════════════╗
║   ${config.BOT_NAME} — حالة البوت   ║
╚══════════════════╝

⏱️ مدة التشغيل: ${uptime.trim()}

🖥️ معلومات الاستضافة:
  • النظام: ${platform} (${arch})
  • Node.js: ${nodeVer}
  • الجهاز: ${os.hostname()}
  • CPU: ${os.cpus()[0]?.model?.trim() || "غير معروف"}
  • تحميل CPU: ${cpuLoad[0].toFixed(2)} | ${cpuLoad[1].toFixed(2)} | ${cpuLoad[2].toFixed(2)}

💾 الذاكرة:
  • استخدام البوت: ${memUsed} MB
  • الـ Heap: ${memHeap} MB
  • إجمالي RAM: ${totalMem} MB
  • متاح: ${freeMem} MB

🔧 إعدادات البوت:
  • البادئة: "${prefix}" (${freeMode})
  • الحماية مفعلة في: ${protectedCount} جروب
  • الإرسال التلقائي: ${automicCount > 0 ? `${automicCount} جروب ✅` : "غير نشط ❌"}
  • الرسائل المحفوظة: ${savedCount}

📊 PID: ${process.pid}`;

  api.sendMessage(msg, event.threadID);
};
