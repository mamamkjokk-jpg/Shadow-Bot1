module.exports = async (api, event, args, startTime, loadData, saveData, automicTimers) => {
  const threadID = event.threadID;

  if (automicTimers[threadID]) {
    clearInterval(automicTimers[threadID]);
    delete automicTimers[threadID];
  }

  await api.sendMessage(
    "⚔️ اللورد شادو يغادر الميدان...\nإلى اللقاء.",
    threadID
  );

  const botID = api.getCurrentUserID();
  try {
    if (typeof api.leaveThread === "function") {
      api.leaveThread(threadID, (err) => {
        if (err) {
          api.removeUserFromGroup(botID, threadID, () => {});
        }
      });
    } else {
      api.removeUserFromGroup(botID, threadID, (err) => {
        if (err) console.log("خطأ خروج:", err);
      });
    }
  } catch (e) {
    console.log("خطأ خروج:", e);
  }
};
