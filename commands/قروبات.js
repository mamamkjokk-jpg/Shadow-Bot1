const pendingNav = {};

module.exports = async (api, event, args, startTime, loadData, saveData, automicTimers, config) => {
  const threadID = event.threadID;
  const senderID = event.senderID;
  const data = loadData();
  const prefix = data.prefix || "!";

  if (args[1] && !isNaN(parseInt(args[1]))) {
    const cache = pendingNav[senderID];
    if (!cache || !cache.threads) {
      return api.sendMessage(`❌ انتهت الصلاحية. اكتب ${prefix}قروبات من جديد.`, threadID);
    }

    const num = parseInt(args[1]) - 1;
    if (num < 0 || num >= cache.threads.length) {
      return api.sendMessage(`❌ اختر رقماً من 1 إلى ${cache.threads.length}.`, threadID);
    }

    const chosen = cache.threads[num];
    delete pendingNav[senderID];

    api.sendMessage(`✅ تم الدخول إلى: ${chosen.name || "بدون اسم"}`, threadID);

    try {
      await api.sendMessage("رحبو بالقائد المبجل شادو", chosen.threadID);
    } catch {
      api.sendMessage("❌ فشل الإرسال للجروب المختار.", threadID);
    }
    return;
  }

  try {
    const threads = await api.getThreadList(30, null, ["INBOX"]);

    if (!threads || threads.length === 0) {
      return api.sendMessage("❌ البوت مش في أي جروب.", threadID);
    }

    const groups = threads.filter(t => t.isGroup);

    if (groups.length === 0) {
      return api.sendMessage("❌ البوت مش في أي جروب.", threadID);
    }

    pendingNav[senderID] = { threads: groups };
    setTimeout(() => { delete pendingNav[senderID]; }, 90000);

    const list = groups
      .map((g, i) => `${i + 1}. ${g.name || "بدون اسم"} (${g.participantIDs?.length || 0} عضو)`)
      .join("\n");

    api.sendMessage(
      `الجروبات (${groups.length}):\n━━━━━━━━━━━━━━\n${list}\n━━━━━━━━━━━━━━\n${prefix}قروبات [رقم] للدخول`,
      threadID
    );
  } catch (err) {
    api.sendMessage("❌ فشل جلب القائمة.", threadID);
    console.log("خطأ قروبات:", err?.message);
  }
};
