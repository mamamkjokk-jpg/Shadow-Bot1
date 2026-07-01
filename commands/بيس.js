module.exports = async (api, event, args) => {
  const threadID = event.threadID;
  const reply = event.messageReply;

  if (!reply || !reply.body) return api.sendMessage("رد على رسالة واكتب الأمر مع العدد.", threadID);

  const count = parseInt(args[1]);
  if (!count || count < 1 || count > 200) return api.sendMessage("اكتب عدد بين 1 و 200.", threadID);

  const msg = reply.body;
  for (let i = 0; i < count; i++) {
    try { await api.sendMessage(msg, threadID); } catch {}
    if (i < count - 1) await new Promise(r => setTimeout(r, 500));
  }
};
