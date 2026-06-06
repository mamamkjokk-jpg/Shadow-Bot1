const pendingNav = {};

module.exports = async (api, event, args, startTime, loadData, saveData, automicTimers, config) => {
  const threadID = event.threadID;
  const senderID = event.senderID;
  const data = loadData();
  const prefix = data.prefix || "!";

  if (args[1] && !isNaN(parseInt(args[1]))) {
    const cache = pendingNav[senderID];
    if (!cache || !cache.threads) {
      return api.sendMessage("❌ انتهت صلاحية القائمة. اكتب !قروبات من جديد.", threadID);
    }

    const num = parseInt(args[1]) - 1;
    if (num < 0 || num >= cache.threads.length) {
      return api.sendMessage(`❌ الرقم غير صحيح. اختر من 1 إلى ${cache.threads.length}.`, threadID);
    }

    const chosen = cache.threads[num];
    delete pendingNav[senderID];

    await api.sendMessage(
      `🔗 الدخول إلى: ${chosen.name || "جروب بدون اسم"}\nجاري إرسال رسالة الدخول...`,
      threadID
    );

    try {
      await api.sendMessage(
        "✦ ══════════════════ ✦\n⚔️  تَسجيلُ دُخولِ اللّوردِ المُقَدَّسِ شادو\n👑  البوتُ حَلَّ ضيفاً عليكُم\n✦ ══════════════════ ✦",
        chosen.threadID
      );
    } catch {
      api.sendMessage("❌ فشل الإرسال — ربما البوت مش في هذا الجروب.", threadID);
    }

    return;
  }

  await api.sendMessage("⏳ جاري جلب قائمة الجروبات...", threadID);

  try {
    const threads = await api.getThreadList(30, null, ["INBOX"]);

    const groups = threads.filter(t => t.isGroup);

    if (groups.length === 0) {
      return api.sendMessage("❌ البوت مش في أي جروب حالياً.", threadID);
    }

    pendingNav[senderID] = { threads: groups, time: Date.now() };

    const list = groups.map((g, i) => {
      const name = g.name || "بدون اسم";
      const count = g.participantIDs?.length || 0;
      return `${i + 1}. ${name} (${count} عضو)`;
    }).join("\n");

    api.sendMessage(
      `📋 الجروبات اللي فيها البوت (${groups.length}):\n━━━━━━━━━━━━━━\n${list}\n━━━━━━━━━━━━━━\n💡 ${prefix}قروبات [رقم] للدخول وإرسال رسالة الترحيب.`,
      threadID
    );

    setTimeout(() => { delete pendingNav[senderID]; }, 60000);
  } catch (err) {
    api.sendMessage("❌ فشل جلب القائمة.\n" + (err?.message || ""), threadID);
  }
};
