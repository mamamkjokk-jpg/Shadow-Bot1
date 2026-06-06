module.exports = (api, event, args, startTime, loadData, saveData, automicTimers, config) => {
  const threadID = event.threadID;
  const data = loadData();
  const prefix = data.prefix || "!";

  if (args[1] === "حذف") {
    const num = parseInt(args[2], 10);
    const msgs = data.savedMessages || [];
    if (!num || num < 1 || num > msgs.length) {
      return api.sendMessage(
        `❌ رقم غير صحيح.\nاستخدم: ${prefix}حفظ حذف [رقم]\nالرسائل المتاحة: 1 - ${msgs.length}`,
        threadID
      );
    }
    const removed = msgs.splice(num - 1, 1)[0];
    if (data.selectedMessage === removed) data.selectedMessage = msgs[0] || null;
    data.savedMessages = msgs;
    saveData(data);
    const preview = removed.length > 40 ? removed.slice(0, 40) + "..." : removed;
    return api.sendMessage(`🗑️ تم حذف الرسالة رقم ${num}:\n"${preview}"`, threadID);
  }

  if (args[1] === "قائمة") {
    const msgs = data.savedMessages || [];
    if (msgs.length === 0) {
      return api.sendMessage("📋 القائمة فارغة.\nردّ على رسالة واكتب !حفظ لإضافتها.", threadID);
    }
    const selected = data.selectedMessage;
    const listText = msgs.map((m, i) => {
      const preview = m.length > 50 ? m.slice(0, 50) + "..." : m;
      return `${i + 1}. ${preview}${m === selected ? " ◄ مختارة" : ""}`;
    }).join("\n");
    return api.sendMessage(`📋 الرسائل المحفوظة (${msgs.length}):\n━━━━━━━━━━━━━━\n${listText}\n━━━━━━━━━━━━━━\nردّ بالرقم لإرسال | ${prefix}حفظ اختيار [رقم] لتحديد رسالة الاتوميك.`, threadID);
  }

  if (args[1] === "اختيار") {
    const num = parseInt(args[2], 10);
    const msgs = data.savedMessages || [];
    if (!num || num < 1 || num > msgs.length) {
      return api.sendMessage(
        `❌ رقم غير صحيح. الرسائل المتاحة: 1 - ${msgs.length}`,
        threadID
      );
    }
    data.selectedMessage = msgs[num - 1];
    saveData(data);
    const preview = msgs[num - 1].length > 50 ? msgs[num - 1].slice(0, 50) + "..." : msgs[num - 1];
    return api.sendMessage(`✅ تم اختيار الرسالة رقم ${num} للإرسال التلقائي:\n"${preview}"`, threadID);
  }

  if (!event.messageReply) {
    const msgs = data.savedMessages || [];
    const selected = data.selectedMessage;
    const listText = msgs.length === 0
      ? "لا توجد رسائل بعد."
      : msgs.map((m, i) => {
          const preview = m.length > 50 ? m.slice(0, 50) + "..." : m;
          return `${i + 1}. ${preview}${m === selected ? " ◄ مختارة" : ""}`;
        }).join("\n");

    return api.sendMessage(
      `📋 الرسائل المحفوظة (${msgs.length}):\n━━━━━━━━━━━━━━\n${listText}\n━━━━━━━━━━━━━━\n• ردّ على رسالة + ${prefix}حفظ ← لحفظها وتعيينها للاتوميك\n• ${prefix}حفظ اختيار [رقم] ← تغيير رسالة الاتوميك\n• ${prefix}حفظ حذف [رقم] ← حذف رسالة`,
      threadID
    );
  }

  const messageToSave = event.messageReply.body;
  if (!messageToSave || messageToSave.trim() === "") {
    return api.sendMessage("❌ لا يمكن حفظ رسالة فارغة.", threadID);
  }

  if (!data.savedMessages) data.savedMessages = [];

  const alreadyExists = data.savedMessages.indexOf(messageToSave);
  if (alreadyExists !== -1) {
    data.selectedMessage = messageToSave;
    saveData(data);
    return api.sendMessage(
      `✅ الرسالة محفوظة بالفعل برقم ${alreadyExists + 1} — تم تعيينها للإرسال التلقائي.\n"${messageToSave.length > 50 ? messageToSave.slice(0, 50) + "..." : messageToSave}"`,
      threadID
    );
  }

  data.savedMessages.push(messageToSave);
  data.selectedMessage = messageToSave;
  saveData(data);

  const num = data.savedMessages.length;
  const preview = messageToSave.length > 50 ? messageToSave.slice(0, 50) + "..." : messageToSave;

  api.sendMessage(
    `✅ تم حفظ الرسالة رقم ${num} وتعيينها للإرسال التلقائي:\n"${preview}"\n━━━━━━━━━━━━━━\n💡 ${prefix}اتوميك ← يبدأ إرسالها كل 15 ثانية.\n💡 ${prefix}حفظ اختيار [رقم] ← لتغيير الرسالة المختارة.`,
    threadID
  );
};
