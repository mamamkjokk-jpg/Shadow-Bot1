const cooldowns = {};
const nickCooldowns = {};

module.exports = (api, event, config, loadData, saveData, automicTimers, BOT_ID) => {
  const data = loadData();
  const threadID = event.threadID;
  const botID = String(BOT_ID || api.getCurrentUserID());
  const devID = String(config.DEV_ID);
  const changerID = String(event.author || event.senderID || "");

  // Always protect bot's own nickname silently (regardless of protection toggle)
  if (event.logMessageType === "log:user-nickname") {
    const targetID = String(event.logMessageData?.participant_id || "");
    if (targetID === botID && changerID !== botID) {
      const now = Date.now();
      const last = nickCooldowns[`bot_${threadID}`] || 0;
      if (now - last > 8000) {
        nickCooldowns[`bot_${threadID}`] = now;
        setTimeout(() => {
          try { api.setNickname(config.BOT_NICK, threadID, botID); } catch {}
        }, 1500);
      }
      return;
    }
  }

  // Full group protection
  if (!data.protected || !data.protected[threadID]?.active) return;
  if (changerID === devID || changerID === botID) return;

  const protection = data.protected[threadID];
  const now = Date.now();
  const lastAction = cooldowns[threadID] || 0;
  if (now - lastAction < 4000) return;

  if (event.logMessageType === "log:thread-name") {
    const newName = event.logMessageData?.name;
    const oldName = protection.threadName;
    if (newName && newName !== oldName) {
      cooldowns[threadID] = now;
      api.gcname(oldName, threadID).catch(() => {});
    }
  }

  if (event.logMessageType === "log:user-nickname") {
    const targetID = String(event.logMessageData?.participant_id || "");
    const oldNick = protection.nicknames?.[targetID] ?? "";
    const newNick = event.logMessageData?.nickname ?? "";
    if (newNick !== oldNick) {
      cooldowns[threadID] = now;
      setTimeout(() => {
        try { api.setNickname(oldNick, threadID, targetID); } catch {}
      }, 1500);
    }
  }
};
