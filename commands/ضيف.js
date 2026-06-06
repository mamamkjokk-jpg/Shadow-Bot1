module.exports = async (api, event, args) => {
  const threadID = event.threadID;

  if (!args[1]) {
    return api.sendMessage(
      "❌ لازم تكتب ID المستخدم.\nمثال: !ضيف 100012345678",
      threadID
    );
  }

  const userID = args[1].trim();

  if (isNaN(userID)) {
    return api.sendMessage("❌ الـ ID يجب أن يكون أرقام فقط.\nمثال: !ضيف 100012345678", threadID);
  }

  try {
    await api.gcmember("add", userID, threadID);
    api.sendMessage(`✅ تم إضافة العضو بنجاح.\n🆔 ID: ${userID}`, threadID);
  } catch (err) {
    api.sendMessage(
      `❌ فشل الإضافة.\n━━━━━━━━━━━━━━\n• تأكد أن الـ ID صحيح\n• تأكد أن البوت أدمن في الجروب\n${err?.message ? "⚠️ " + err.message : ""}`,
      threadID
    );
  }
};
