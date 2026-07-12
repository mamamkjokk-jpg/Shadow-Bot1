module.exports = (api, event, config, loadData, saveData, automicTimers, BOT_ID, startTime) => {
  if (event.logMessageType !== "log:subscribe") return;

  const threadID = event.threadID;
  const botID = String(BOT_ID || api.getCurrentUserID());
  const added = event.logMessageData?.addedParticipants || [];
  const botJoined = added.some(p => String(p.userFbId || p.id || "") === botID);

  if (!botJoined) return;

  // ── Set nicknames ──────────────────────────────────────
  setTimeout(() => {
    try { api.setNickname(config.BOT_NICK, threadID, botID); } catch {}
  }, 2000);

  setTimeout(async () => {
    try {
      const info = await api.getThreadInfo(threadID);
      const members = (info.participantIDs || []).map(String);
      for (const devID of config.DEV_IDS) {
        if (members.includes(String(devID))) {
          api.setNickname(config.DEV_NICK, threadID, devID);
        }
      }
    } catch {}
  }, 2500);

  // ── Step 1: رسالة انصعو ────────────────────────────────
  setTimeout(() => {
    try {
      const announce =
`🌑━━━━━━━━━━━━━━━━━━━━━━━━━━━━🌑

𝒶𝓃𝓈𝒶𝒶𝑜 𝓁𝒾 𝓈𝒶𝓎𝒾𝒹 𝒶𝓁-𝓏𝒽𝓁𝒶𝓁 𝓈𝒽𝒶𝒹
انصعو لسيد الظلال شاد أثناء حضوره 👁️

🌑━━━━━━━━━━━━━━━━━━━━━━━━━━━━🌑`;

      api.sendMessage(announce, threadID, (err, msgInfo) => {
        if (!err && msgInfo?.messageID) {
          // حذف رسالة انصعو بعد 5 ثواني
          setTimeout(() => {
            try { api.unsendMessage(msgInfo.messageID); } catch {}
          }, 5000);
        }
      });
    } catch {}
  }, 3500);

  // ── Step 2: رسالة معلومات البوت ────────────────────────
  setTimeout(() => {
    try {
      const data = loadData();
      const prefix = data.prefix || "!";

      const diff = Date.now() - (startTime || Date.now());
      const totalSec = Math.floor(diff / 1000);
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      const uptime = [
        h > 0 ? `${h}𝗵` : "",
        m > 0 ? `${m}𝗺` : "",
        `${s}𝘀`
      ].filter(Boolean).join(" ");

      const devIDsList = config.DEV_IDS.map(id => `  ◈ ${id}`).join("\n");

      const info =
`╔══〔 𝘿𝙞𝙖𝙗𝙡𝙤𝙨 𝘽𝙤𝙩 〕══╗

🤖  𝗡𝗮𝗺𝗲 : 𝘿𝙞𝙖𝙗𝙡𝙤𝙨 𝘽𝙤𝙩
👑  𝗗𝗲𝘃  : 𝚂𝚑𝚊𝚍𝚘𝚠
🆔  𝗗𝗲𝘃 𝗜𝗗𝘀 :
${devIDsList}
⏱️  𝗨𝗽𝘁𝗶𝗺𝗲 : ${uptime}
📌  𝗣𝗿𝗲𝗳𝗶𝘅 : ${prefix}
🛡️  𝗣𝗿𝗼𝘁𝗲𝗰𝘁𝗶𝗼𝗻 : 𝗔𝗰𝘁𝗶𝘃𝗲 ✅
🔒  𝗦𝘁𝗮𝘁𝘂𝘀 : 𝗢𝗻𝗹𝗶𝗻𝗲 🟢
💬  𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 𝟭.𝟬.𝟬

╚══════════════════════╝`;

      api.sendMessage(info, threadID);
    } catch {}
  }, 5500);
};
