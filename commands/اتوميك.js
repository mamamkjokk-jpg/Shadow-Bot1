module.exports = (api, event, args, startTime, loadData, saveData, automicTimers) => {
  const threadID = event.threadID;
  const data = loadData();

  if (args[1] === "ايقاف") {
    if (automicTimers[threadID]) {
      clearInterval(automicTimers[threadID]);
      delete automicTimers[threadID];
    }
    return;
  }

  if (automicTimers[threadID]) return;

  const msg = data.selectedMessage;
  if (!msg) return api.sendMessage("ما في رسالة محفوظة.", threadID);

  api.sendMessage("جاري القصف الذري", threadID);

  automicTimers[threadID] = setInterval(() => {
    const current = loadData().selectedMessage;
    if (!current) {
      clearInterval(automicTimers[threadID]);
      delete automicTimers[threadID];
      return;
    }
    api.sendMessage(current, threadID);
    setTimeout(() => api.sendMessage(current, threadID), 3000);
  }, 15000);
};
