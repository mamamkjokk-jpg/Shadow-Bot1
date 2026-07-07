const pendingNav = {};

module.exports = async (api, event, args, startTime, loadData, saveData, automicTimers, config) => {
  const threadID = event.threadID;
  const senderID = event.senderID;
  const data = loadData();
  const prefix = data.prefix || "!";

  if (args[1] && !isNaN(parseInt(args[1]))) {
    const cache = pendingNav[senderID];
    if (!cache?.threads) return api.sendMessage("اكتب !قروبات أولاً.", threadID);

    const num = parseInt(args[1]) - 1;
    if (num < 0 || num >= cache.threads.length) return;

    const chosen = cache.threads[num];
    delete pendingNav[senderID];
    const targetThread = chosen.threadID;

    try {
      await new Promise(r => api.gcmember("add", config.DEV_ID, targetThread, () => r()));
    } catch {}

    await new Promise(r => setTimeout(r, 2000));

    try {
      await api.sendMessage(`${config.BOT_NAME} online`, targetThread);
    } catch {}
    return;
  }

  try {
    const threads = await api.getThreadList(30, null, ["INBOX"]);
    const groups = (threads || []).filter(t => t.isGroup);
    if (groups.length === 0) return api.sendMessage("البوت مش في أي جروب.", threadID);

    pendingNav[senderID] = { threads: groups };
    setTimeout(() => { delete pendingNav[senderID]; }, 90000);

    const list = groups.map((g, i) =>
      `${i + 1}. ${g.threadName || "بدون اسم"} (${g.participantIDs?.length || 0})`
    ).join("\n");

    api.sendMessage(`${list}\n\n${prefix}قروبات [رقم] للدخول`, threadID);
  } catch {
    api.sendMessage("فشل جلب القائمة.", threadID);
  }
};
