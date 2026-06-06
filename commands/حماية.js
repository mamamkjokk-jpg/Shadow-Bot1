module.exports = (api, event, args, startTime, loadData, saveData) => {
  const data = loadData();
  const threadID = event.threadID;

  if (!data.protected) data.protected = {};

  const isOn = data.protected[threadID]?.active;

  if (isOn) {
    data.protected[threadID].active = false;
    saveData(data);
    return api.sendMessage("🔓 تم إيقاف الحماية في هذا الجروب.", threadID);
  }

  api.getThreadInfo(threadID, (err, info) => {
    if (err || !info) return api.sendMessage("❌ فشل الحصول على معلومات الجروب.", threadID);

    const nicknames = {};
    const ids = info.participantIDs || [];
    for (const uid of ids) {
      const userInfo = (info.userInfo || []).find(u => u.id === uid);
      nicknames[uid] = userInfo?.name || "";
    }

    data.protected[threadID] = {
      active: true,
      threadName: info.threadName || "",
      nicknames
    };

    saveData(data);
    api.sendMessage(
      `🛡️ تم تفعيل الحماية.\n━━━━━━━━━━━━━━\n📌 اسم الجروب: ${info.threadName || "بدون اسم"}\n👥 عدد الأعضاء: ${ids.length}\n━━━━━━━━━━━━━━\nأي تغيير في الاسم أو الكنية سيُعاد تلقائياً.`,
      threadID
    );
  });
};
