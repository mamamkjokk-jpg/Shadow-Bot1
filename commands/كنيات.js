module.exports = async (api, event, args, startTime, loadData, saveData, automicTimers, config, hostingInfo, botSentMessages, BOT_ID) => {
  const threadID = event.threadID;
  if (!args[1]) return;

  const nickname = args.slice(1).join(" ");
  const skip = new Set([String(config.DEV_ID), String(BOT_ID || "")]);

  let info;
  try { info = await api.getThreadInfo(threadID); } catch { return; }

  for (const uid of (info.participantIDs || [])) {
    if (skip.has(String(uid))) continue;
    try { await api.setNickname(nickname, threadID, uid); } catch {}
    await new Promise(r => setTimeout(r, 800));
  }
};
