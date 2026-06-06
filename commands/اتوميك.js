module.exports = (api, event, args, startTime, loadData, saveData, automicTimers, config) => {
  const threadID = event.threadID;
  const data = loadData();
  const prefix = data.prefix || "!";

  if (args[1] && args[1] === "ايقاف") {
    if (automicTimers[threadID]) {
      clearInterval(automicTimers[threadID]);
      delete automicTimers[threadID];
      return api.sendMessage("⛔ تم إيقاف الإرسال التلقائي.", threadID);
    }
    return api.sendMessage("❌ لا يوجد إرسال تلقائي نشط حالياً.", threadID);
  }

  if (automicTimers[threadID]) {
    return api.sendMessage(
      `⚠️ الإرسال التلقائي يعمل بالفعل.\nاكتب ${prefix}اتوميك ايقاف لإيقافه.`,
      threadID
    );
  }

  const selectedMsg = data.selectedMessage;

  if (!selectedMsg) {
    return api.sendMessage(
      `❌ لم تختر رسالة للإرسال التلقائي بعد.\n━━━━━━━━━━━━━━\n1. ردّ على رسالة واكتب ${prefix}حفظ\n2. ثم اكتب ${prefix}اتوميك`,
      threadID
    );
  }

  const preview = selectedMsg.length > 60 ? selectedMsg.slice(0, 60) + "..." : selectedMsg;

  api.sendMessage(
    `✅ بدأ الإرسال التلقائي.\n━━━━━━━━━━━━━━\n📨 الرسالة: "${preview}"\n⏱️ كل 15 ثانية — مرتين\n━━━━━━━━━━━━━━\nاكتب ${prefix}اتوميك ايقاف للإيقاف.`,
    threadID
  );

  automicTimers[threadID] = setInterval(() => {
    const currentData = loadData();
    const msg = currentData.selectedMessage;

    if (!msg) {
      clearInterval(automicTimers[threadID]);
      delete automicTimers[threadID];
      return api.sendMessage("⛔ توقف الإرسال التلقائي: لا توجد رسالة محددة.", threadID);
    }

    api.sendMessage(msg, threadID);
    setTimeout(() => {
      api.sendMessage(msg, threadID);
    }, 3000);

  }, 15000);
};
