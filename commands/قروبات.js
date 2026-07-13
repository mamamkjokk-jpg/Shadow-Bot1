const pendingNav = {};

module.exports = async (api, event, args, startTime, loadData, saveData, automicTimers, config) => {
  const threadID = event.threadID;
  const senderID = event.senderID;
  const data = loadData();
  const prefix = data.prefix || "!";

  // !قروبات [رقم] خروج  ← خروج من جروب محدد
  if (args[1] && !isNaN(parseInt(args[1])) && args[2] === "خروج") {
    const cache = pendingNav[senderID];
    if (!cache?.threads) return api.sendMessage("اكتب !قروبات أولاً.", threadID);

    const num = parseInt(args[1]) - 1;
    if (num < 0 || num >= cache.threads.length) return;

    const chosen = cache.threads[num];
    delete pendingNav[senderID];
    const targetThread = chosen.threadID;
    const groupName = chosen.threadName || "الجروب";

    if (automicTimers[targetThread]) {
      clearInterval(automicTimers[targetThread]);
      delete automicTimers[targetThread];
    }

    try {
      await api.sendMessage("لقد اكتفيت من ركوب الأطفال 🚪", targetThread);
    } catch {}

    await new Promise(r => setTimeout(r, 1500));

    const botID = api.getCurrentUserID();
    try {
      await api.gcmember("remove", botID, targetThread);
      api.sendMessage(`✅ خرجت من: ${groupName}`, threadID);
    } catch (e) {
      api.sendMessage(`❌ فشل الخروج من: ${groupName}`, threadID);
      console.log("خطأ خروج قروبات:", e?.message);
    }
    return;
  }

  // !قروبات [رقم]  ← ضيف المطور للجروب
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

  // !قروبات  ← عرض القائمة
  try {
    const threads = await api.getThreadList(30, null, ["INBOX"]);
    const groups = (threads || []).filter(t => t.isGroup);
    if (groups.length === 0) return api.sendMessage("البوت مش في أي جروب.", threadID);

    pendingNav[senderID] = { threads: groups };
    setTimeout(() => { delete pendingNav[senderID]; }, 90000);

    const list = groups.map((g, i) =>
      `${i + 1}. ${g.threadName || "بدون اسم"} (${g.participantIDs?.length || 0} عضو)`
    ).join("\n");

    api.sendMessage(
      `${list}\n\n${prefix}قروبات [رقم] ← ضيف مطور\n${prefix}قروبات [رقم] خروج ← خروج البوت`,
      threadID
    );
  } catch {
    api.sendMessage("فشل جلب القائمة.", threadID);
  }
};
