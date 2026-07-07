const cooldowns = {};
const nickCooldowns = {};

module.exports = (api, event, config, loadData, saveData, automicTimers, BOT_ID) => {
  const data = loadData();
  const threadID = event.threadID;
  const botID = String(BOT_ID || api.getCurrentUserID());
  const devID = String(config.DEV_ID);
  const changerID = String(event.author || event.senderID || "");

  // قفل الإضافة — re-add anyone who leaves
  if (event.logMessageType === "log:unsubscribe") {
    if (data.locked?.[threadID]) {
      const leftID = String(
        event.logMessageData?.leftParticipantFbId ||
        event.logMessageData?.participantId ||
        event.author || ""
      );
      if (leftID && leftID !== botID) {
        setTimeout(() => {
          try { api.gcmember("add", leftID, threadID); } catch {}
        }, 1000);
      }
    }
    return;
  }

  // Protect bot and dev nicknames (always, regardless of protection toggle)
  if (event.logMessageType === "log:user-nickname") {
    const targetID = String(event.logMessageData?.participant_id || "");
    const now = Date.now();

    if (targetID === botID && changerID !== botID) {
      const key = `bot_${threadID}`;
      if (now - (nickCooldowns[key] || 0) > 8000) {
        nickCooldowns[key] = now;
        setTimeout(() => {
          try { api.setNickname(config.BOT_NICK, threadID, botID); } catch {}
        }, 1500);
      }
      return;
    }

    if (targetID === devID && changerID !== botID && changerID !== devID) {
      const key = `dev_${threadID}`;
      if (now - (nickCooldowns[key] || 0) > 8000) {
        nickCooldowns[key] = now;
        setTimeout(() => {
          try { api.setNickname(config.DEV_NICK, threadID, devID); } catch {}
        }, 1500);
      }
      return;
    }
  }

  // Full group protection
  if (!data.protected?.[threadID]?.active) return;
  if (changerID === devID || changerID === botID) return;

  const protection = data.protected[threadID];
  const now = Date.now();
  if (now - (cooldowns[threadID] || 0) < 4000) return;

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
