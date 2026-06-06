module.exports = (api, event, args, startTime, loadData, saveData) => {
  const data = loadData();
  const threadID = event.threadID;

  const currentPrefix = data.prefix || "!";
  const freePrefix = data.freePrefix || false;

  if (!args[1]) {
    return api.sendMessage(
      `⚙️ إعدادات البادئة:\n━━━━━━━━━━━━━━\n📌 البادئة الحالية: "${currentPrefix}"\n🔓 البادئة الحرة: ${freePrefix ? "مفعّلة ✅" : "مغلقة ❌"}\n━━━━━━━━━━━━━━\nالأوامر:\n• prefix on — تفعيل البادئة الحرة\n• prefix off — إيقاف البادئة الحرة\n• prefix [رمز] — تغيير البادئة`,
      threadID
    );
  }

  const sub = args[1].toLowerCase();

  if (sub === "on") {
    data.freePrefix = true;
    saveData(data);
    return api.sendMessage(
      "✅ تم تفعيل البادئة الحرة.\nيمكنك الآن استخدام الأوامر بدون بادئة مباشرة.",
      threadID
    );
  }

  if (sub === "off") {
    data.freePrefix = false;
    saveData(data);
    return api.sendMessage(
      `✅ تم إيقاف البادئة الحرة.\nيجب استخدام البادئة "${data.prefix}" قبل كل أمر.`,
      threadID
    );
  }

  const newPrefix = args[1];
  if (newPrefix.length > 3) {
    return api.sendMessage("❌ البادئة يجب أن تكون رمزاً واحداً أو اثنين فقط.", threadID);
  }

  data.prefix = newPrefix;
  saveData(data);
  api.sendMessage(
    `✅ تم تغيير البادئة إلى: "${newPrefix}"\nمثال: ${newPrefix}help`,
    threadID
  );
};
