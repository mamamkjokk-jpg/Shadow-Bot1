module.exports = async (api, event, args) => {
  const threadID = event.threadID;

  if (!args[1]) {
    return api.sendMessage("❌ لازم تكتب الكنية المطلوبة.\nمثال: !كنيات شادو", threadID);
  }

  const nickname = args.slice(1).join(" ");

  let info;
  try {
    info = await api.getThreadInfo(threadID);
  } catch (err) {
    return api.sendMessage("❌ فشل الحصول على معلومات الجروب.", threadID);
  }

  const participants = info.participantIDs || [];
  if (participants.length === 0) {
    return api.sendMessage("❌ ما قدرت أجيب قائمة الأعضاء.", threadID);
  }

  await api.sendMessage(`⏳ جاري تغيير كنيات ${participants.length} عضو...`, threadID);

  let done = 0;
  let failed = 0;

  for (const uid of participants) {
    try {
      await api.setNickname(nickname, threadID, uid);
      done++;
    } catch {
      failed++;
    }
    await new Promise(r => setTimeout(r, 500));
  }

  api.sendMessage(
    `✅ تم تغيير الكنيات!\n━━━━━━━━━━━━━━\n✔️ نجح: ${done}\n❌ فشل: ${failed}\n🏷️ الكنية: "${nickname}"`,
    threadID
  );
};
