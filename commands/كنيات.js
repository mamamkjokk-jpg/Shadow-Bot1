module.exports = async (api, event, args) => {
  const threadID = event.threadID;
  if (!args[1]) return;

  const nickname = args.slice(1).join(" ");

  let info;
  try { info = await api.getThreadInfo(threadID); } catch { return; }

  const participants = info.participantIDs || [];

  for (const uid of participants) {
    try { await api.setNickname(nickname, threadID, uid); } catch {}
    await new Promise(r => setTimeout(r, 800));
  }
};
