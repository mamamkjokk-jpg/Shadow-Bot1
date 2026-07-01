module.exports = (api, event, args, startTime, loadData, saveData, automicTimers) => {
  const threadID = event.threadID;
  const key = "b_" + threadID;

  if (args[1] === "ايقاف") {
    if (automicTimers[key]) {
      clearInterval(automicTimers[key]);
      delete automicTimers[key];
    }
    return;
  }

  if (automicTimers[key]) return;

  // !بيس [interval_seconds] [text...]
  const interval = parseInt(args[1]);
  if (!interval || interval < 1) return api.sendMessage("مثال: !بيس 30 نص الرسالة", threadID);

  const msg = args.slice(2).join(" ");
  if (!msg) return api.sendMessage("مثال: !بيس 30 نص الرسالة", threadID);

  automicTimers[key] = setInterval(() => {
    api.sendMessage(msg, threadID);
    setTimeout(() => api.sendMessage(msg, threadID), 3000);
  }, interval * 1000);
};
