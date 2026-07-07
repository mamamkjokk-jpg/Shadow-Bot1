module.exports = (api, event, config, loadData, saveData, automicTimers, BOT_ID, startTime) => {
  if (event.logMessageType !== "log:subscribe") return;

  const threadID = event.threadID;
  const botID = String(BOT_ID || api.getCurrentUserID());
  const added = event.logMessageData?.addedParticipants || [];
  const botJoined = added.some(p => String(p.userFbId || p.id || "") === botID);

  if (!botJoined) return;

  // Set bot and dev nicknames
  setTimeout(() => {
    try { api.setNickname(config.BOT_NICK, threadID, botID); } catch {}
  }, 2000);

  setTimeout(async () => {
    try {
      const info = await api.getThreadInfo(threadID);
      if ((info.participantIDs || []).map(String).includes(String(config.DEV_ID))) {
        api.setNickname(config.DEV_NICK, threadID, config.DEV_ID);
      }
    } catch {}
  }, 2500);

  // Send welcome message after nicknames are set
  setTimeout(() => {
    try {
      const data = loadData();
      const prefix = data.prefix || "!";
      const diff = Date.now() - (startTime || Date.now());
      const s = Math.floor(diff / 1000) % 60;
      const m = Math.floor(diff / 60000) % 60;
      const h = Math.floor(diff / 3600000);
      const uptime = `${h > 0 ? h + "s " : ""}${m > 0 ? m + "m " : ""}${s}s`;

      const msg =
`${config.BOT_NAME}
dev: ${config.DEV_NAME}
prefix: ${prefix}
uptime: ${uptime}`;

      api.sendMessage(msg, threadID);
    } catch {}
  }, 4000);
};
