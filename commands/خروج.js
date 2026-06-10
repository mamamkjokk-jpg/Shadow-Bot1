module.exports = async (api, event, args, startTime, loadData, saveData, automicTimers) => {
  const threadID = event.threadID;

  if (automicTimers[threadID]) {
    clearInterval(automicTimers[threadID]);
    delete automicTimers[threadID];
  }

  try {
    await api.sendMessage("إلى اللقاء.", threadID);
  } catch {}

  await new Promise(r => setTimeout(r, 1500));

  const botID = api.getCurrentUserID();
  try {
    await api.gcmember("remove", botID, threadID);
  } catch (e) {
    console.log("خطأ خروج:", e?.message);
  }
};
