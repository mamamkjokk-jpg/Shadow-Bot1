module.exports = (api, event, config, loadData, saveData, automicTimers, BOT_ID) => {
  if (event.logMessageType !== "log:subscribe") return;
  const threadID = event.threadID;
  const botID = BOT_ID || api.getCurrentUserID();
  // Set bot nickname silently
  setTimeout(() => {
    try { api.setNickname(config.BOT_NICK, threadID, botID); } catch {}
  }, 2000);
};
