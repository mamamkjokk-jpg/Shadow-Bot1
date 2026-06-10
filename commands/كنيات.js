module.exports = async (api, event, args) => {
  const threadID = event.threadID;

  if (!args[1]) {
    return api.sendMessage("❌ لازم تكتب الكنية.\nمثال: !كنيات شادو", threadID);
  }

  const nickname = args.slice(1).join(" ");

  let info;
  try {
    info = await api.getThreadInfo(threadID);
  } catch {
    return api.sendMessage("❌ فشل الحصول على معلومات الجروب.", threadID);
  }

  const participants = info.participantIDs || [];
  if (participants.length === 0) {
    return api.sendMessage("❌ ما قدرت أجيب قائمة الأعضاء.", threadID);
  }

  let done = 0;
  let failed = 0;

  for (const uid of participants) {
    try {
      await new Promise((resolve, reject) => {
        api.changeNickname(nickname, threadID, uid, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      done++;
    } catch {
      failed++;
    }
    await new Promise(r => setTimeout(r, 600));
  }

  api.sendMessage(`تم: ${done} ✔️  فشل: ${failed} ❌\nالكنية: "${nickname}"`, threadID);
};
