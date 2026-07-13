const os = require("os");

module.exports = (api, event, args, startTime, loadData, saveData, automicTimers, config) => {
  const diff = Date.now() - startTime;
  const totalSec = Math.floor(diff / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const uptime = [
    d > 0 ? `${d}𝗱` : "",
    h > 0 ? `${h}𝗵` : "",
    m > 0 ? `${m}𝗺` : "",
    `${s}𝘀`
  ].filter(Boolean).join(" ");

  const data = loadData();
  const prefix    = data.prefix || "!";
  const admins    = (data.admins || []).length;
  const locked    = Object.keys(data.locked  || {}).length;
  const protected_ = Object.keys(data.protected || {}).length;

  const mem      = Math.round(process.memoryUsage().rss / 1024 / 1024);
  const freeRam  = Math.round(os.freemem() / 1024 / 1024);
  const totalRam = Math.round(os.totalmem() / 1024 / 1024);
  const cpu      = os.cpus()[0]?.model?.split(" ").slice(0, 3).join(" ") || "N/A";
  const platform = os.platform();
  const nodeVer  = process.version;

  const activeTimers = Object.keys(automicTimers || {}).length;

  const msg =
`╔══〔 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦 〕══╗

🤖  𝗕𝗼𝘁  : ${config.BOT_NAME}
👑  𝗗𝗲𝘃  : ${config.DEV_NAME}
📌  𝗣𝗿𝗲𝗳𝗶𝘅 : ${prefix}
💬  𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 𝟭.𝟬.𝟬

⏱️  𝗨𝗽𝘁𝗶𝗺𝗲 : ${uptime}
🧠  𝗥𝗔𝗠 𝗨𝘀𝗲𝗱 : ${mem} MB
💾  𝗥𝗔𝗠 𝗙𝗿𝗲𝗲 : ${freeRam}/${totalRam} MB

👥  𝗔𝗱𝗺𝗶𝗻𝘀 : ${admins}
🔒  𝗟𝗼𝗰𝗸𝗲𝗱 : ${locked} جروب
🛡️  𝗣𝗿𝗼𝘁𝗲𝗰𝘁𝗲𝗱 : ${protected_} جروب
⚡  𝗧𝗶𝗺𝗲𝗿𝘀 : ${activeTimers} نشط

🖥️  𝗡𝗼𝗱𝗲 : ${nodeVer}
💻  𝗢𝗦 : ${platform}
🔧  𝗖𝗣𝗨 : ${cpu}

╚════════════════════╝`;

  api.sendMessage(msg, event.threadID);
};
