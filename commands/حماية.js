module.exports = async (api, event, args, startTime, loadData, saveData) => {
  const data = loadData();
  const threadID = event.threadID;

  if (!data.protected) data.protected = {};

  const isOn = data.protected[threadID]?.active;

  if (isOn) {
    data.protected[threadID].active = false;
    saveData(data);
    return api.sendMessage("🔓 تم إيقاف الحماية.", threadID);
  }

  let info;
  try {
    info = await api.getThreadInfo(threadID);
  } catch (err) {
    return api.sendMessage("❌ فشل الحصول على معلومات الجروب.", threadID);
  }

  const nicknames = {};
  const ids = info.participantIDs || [];

  for (const uid of ids) {
    const userInfo = Array.isArray(info.userInfo)
      ? info.userInfo.find(u => String(u.id) === String(uid))
      : null;
    const nick = info.nicknames?.[uid] || userInfo?.name || "";
    nicknames[uid] = nick;
  }

  const threadName = info.threadName || info.name || "";

  data.protected[threadID] = {
    active: true,
    threadName,
    nicknames
  };

  saveData(data);
  api.sendMessage(
    `🛡️ تم تفعيل الحماية.\n📌 الاسم: ${threadName || "بدون اسم"}\n👥 أعضاء: ${ids.length}`,
    threadID
  );
};
