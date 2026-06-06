module.exports = (api, event, args) => {
  const threadID = event.threadID;

  if (!args[1]) {
    return api.sendMessage("❌ لازم تكتب الكنية المطلوبة.\nمثال: !كنيات شادو", threadID);
  }

  const nickname = args.slice(1).join(" ");

  api.getThreadInfo(threadID, (err, info) => {
    if (err || !info) {
      return api.sendMessage("❌ فشل الحصول على معلومات الجروب.", threadID);
    }

    const participants = info.participantIDs || [];
    if (participants.length === 0) {
      return api.sendMessage("❌ ما قدرت أجيب قائمة الأعضاء.", threadID);
    }

    api.sendMessage(`⏳ جاري تغيير كنيات ${participants.length} عضو...`, threadID);

    let done = 0;
    let failed = 0;

    const next = (index) => {
      if (index >= participants.length) {
        return api.sendMessage(
          `✅ تم تغيير الكنيات!\n━━━━━━━━━━━━━━\n✔️ نجح: ${done}\n❌ فشل: ${failed}\n🏷️ الكنية: "${nickname}"`,
          threadID
        );
      }

      const uid = participants[index];
      api.changeNickname(nickname, threadID, uid, (err) => {
        if (err) failed++;
        else done++;
        setTimeout(() => next(index + 1), 500);
      });
    };

    next(0);
  });
};
