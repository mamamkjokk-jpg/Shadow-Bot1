module.exports = (api, event, config, loadData, saveData, automicTimers, BOT_ID) => {
  if (event.logMessageType !== "log:subscribe") return;

  const threadID = event.threadID;
  const botID = String(BOT_ID || api.getCurrentUserID());
  const added = event.logMessageData?.addedParticipants || [];
  const botJoined = added.some(p => String(p.userFbId || p.id || "") === botID);

  // Set bot nickname when bot joins, or always update on any subscribe event
  setTimeout(() => {
    try { api.setNickname(config.BOT_NICK, threadID, botID); } catch {}
  }, 2000);

  // Set DEV nickname
  setTimeout(async () => {
    try {
      const info = await api.getThreadInfo(threadID);
      const ids = info.participantIDs || [];
      if (ids.map(String).includes(String(config.DEV_ID))) {
        const currentNick = info.nicknames?.[config.DEV_ID] ?? "";
        if (currentNick !== config.DEV_NICK) {
          api.setNickname(config.DEV_NICK, threadID, config.DEV_ID);
        }
      }
    } catch {}
  }, 3000);
};
