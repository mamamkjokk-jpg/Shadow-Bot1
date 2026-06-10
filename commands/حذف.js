module.exports = async (api, event) => {
  const threadID = event.threadID;
  const reply = event.messageReply;

  if (!reply) return api.sendMessage("رد على الرسالة التي تريد حذفها.", threadID);

  const msgID = reply.messageID;
  if (!msgID) return;

  try {
    await api.unsendMessage(msgID);
  } catch (err) {
    api.sendMessage("فشل الحذف. البوت يقدر يحذف رسائله فقط.", threadID);
  }
};
