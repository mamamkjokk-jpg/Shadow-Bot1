const cooldowns = {};

module.exports = (api, event, config, loadData, saveData) => {
  const data = loadData();
  const threadID = event.threadID;

  if (!data.protected || !data.protected[threadID]?.active) return;

  const protection = data.protected[threadID];
  const now = Date.now();
  const lastAction = cooldowns[threadID] || 0;

  if (now - lastAction < 5000) return;

  if (event.logMessageType === "log:thread-name") {
    const newName = event.logMessageData?.name;
    const oldName = protection.threadName;

    if (newName && newName !== oldName) {
      cooldowns[threadID] = now;
      api.gcname(oldName, threadID)
        .then(() => {
          api.sendMessage(`⚠️ تم استعادة اسم الجروب:\n"${oldName}"`, threadID);
        })
        .catch(() => {});
    }
  }

  if (event.logMessageType === "log:user-nickname") {
    const targetID = event.logMessageData?.participant_id;
    const oldNick = protection.nicknames?.[targetID] ?? "";
    const newNick = event.logMessageData?.nickname ?? "";

    if (newNick !== oldNick) {
      cooldowns[threadID] = now;
      setTimeout(() => {
        api.setNickname(oldNick, threadID, targetID)
          .then(() => {
            api.sendMessage(`⚠️ تم استعادة الكنية في الجروب.`, threadID);
          })
          .catch(() => {});
      }, 1500);
    }
  }
};
