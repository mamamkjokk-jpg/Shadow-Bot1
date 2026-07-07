module.exports = (api, event, args, startTime, loadData, saveData) => {
  const threadID = event.threadID;
  const data = loadData();
  if (!data.savedMessages) data.savedMessages = [];

  if (args[1] === "حذف") {
    const num = parseInt(args[2], 10);
    if (!num || num < 1 || num > data.savedMessages.length) return;
    const removed = data.savedMessages.splice(num - 1, 1)[0];
    if (data.selectedMessage === removed) data.selectedMessage = data.savedMessages[0] || null;
    saveData(data);
    return;
  }

  if (args[1] === "اختيار") {
    const num = parseInt(args[2], 10);
    if (!num || num < 1 || num > data.savedMessages.length) return;
    data.selectedMessage = data.savedMessages[num - 1];
    saveData(data);
    return api.sendMessage(`الرسالة ${num} محددة للاتوميك.`, threadID);
  }

  if (!event.messageReply) {
    const msgs = data.savedMessages;
    if (msgs.length === 0) return api.sendMessage("لا توجد رسائل محفوظة.", threadID);
    const selected = data.selectedMessage;
    const list = msgs.map((m, i) => `${i + 1}. ${m.slice(0, 50)}${m === selected ? " ◄" : ""}`).join("\n");
    return api.sendMessage(list, threadID);
  }

  const body = event.messageReply.body;
  if (!body?.trim()) return;

  const exists = data.savedMessages.indexOf(body);
  if (exists !== -1) {
    data.selectedMessage = body;
    saveData(data);
    return api.sendMessage(`رقم ${exists + 1} محددة.`, threadID);
  }

  data.savedMessages.push(body);
  data.selectedMessage = body;
  saveData(data);
  api.sendMessage(`حُفظت رقم ${data.savedMessages.length}.`, threadID);
};
