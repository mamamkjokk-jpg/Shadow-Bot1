module.exports = async (api, event, args, startTime, loadData, saveData, automicTimers, config, hostingInfo, botSentMessages, BOT_ID) => {
  const threadID = event.threadID;
  const botID = BOT_ID || api.getCurrentUserID();

  // Collect tracked IDs
  const tracked = [...(botSentMessages[threadID] || [])].reverse();

  // Try to fetch history to find older bot messages
  let historyIDs = [];
  try {
    const history = await api.getThreadHistory(threadID, 100, null);
    historyIDs = history
      .filter(m => m.type === "message" && String(m.senderID) === String(botID) && m.messageID)
      .map(m => m.messageID)
      .reverse();
  } catch {}

  // Merge (tracked first = newest, then history fills gaps)
  const seen = new Set();
  const toDelete = [];
  for (const id of [...tracked, ...historyIDs]) {
    if (!seen.has(id) && toDelete.length < 30) {
      seen.add(id);
      toDelete.push(id);
    }
  }

  if (toDelete.length === 0) return;

  for (const msgID of toDelete) {
    try { await api.unsendMessage(msgID); } catch {}
    await new Promise(r => setTimeout(r, 300));
  }

  // Clear tracked list
  botSentMessages[threadID] = [];
};
