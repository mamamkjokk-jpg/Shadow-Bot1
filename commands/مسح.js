module.exports = async (api, event, args, startTime, loadData, saveData, automicTimers, config, hostingInfo, botSentMessages) => {
  const threadID = event.threadID;
  const ids = (botSentMessages[threadID] || []).slice();

  if (ids.length === 0) return;

  // Delete from newest to oldest
  const toDelete = ids.reverse().slice(0, 30);

  for (const msgID of toDelete) {
    try {
      await api.unsendMessage(msgID);
    } catch {}
    await new Promise(r => setTimeout(r, 300));
  }

  // Clear tracked list for this thread
  botSentMessages[threadID] = [];
};
