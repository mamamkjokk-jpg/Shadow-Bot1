module.exports = async (api, event, args, startTime, loadData, saveData) => {
  const threadID = event.threadID;

  if (!args[1]) {
    return api.sendMessage(
      "❌ لازم تكتب الاسم الجديد.\n━━━━━━━━━━━━━━\n📌 !اسم [الاسم] — تغيير الاسم فقط\n📌 !اسم حفظ [الاسم] — تغيير الاسم + تفعيل الحماية تلقائياً",
      threadID
    );
  }

  let saveMode = false;
  let nameArgs = args.slice(1);

  if (args[1] === "حفظ") {
    if (!args[2]) {
      return api.sendMessage("❌ لازم تكتب الاسم بعد كلمة حفظ.\nمثال: !اسم حفظ قروب شادو", threadID);
    }
    saveMode = true;
    nameArgs = args.slice(2);
  }

  const newName = nameArgs.join(" ");

  try {
    await api.gcname(newName, threadID);

    if (saveMode) {
      const data = loadData();
      if (!data.protected) data.protected = {};

      api.getThreadInfo(threadID, (err, info) => {
        const nicknames = {};
        const ids = (info?.participantIDs) || [];
        for (const uid of ids) {
          const userInfo = (info?.userInfo || []).find(u => u.id === uid);
          nicknames[uid] = userInfo?.name || "";
        }

        data.protected[threadID] = {
          active: true,
          threadName: newName,
          nicknames
        };
        saveData(data);
      });

      api.sendMessage(
        `✅ تم تغيير اسم الجروب إلى:\n"${newName}"\n━━━━━━━━━━━━━━\n🛡️ تم تفعيل الحماية على الاسم الجديد تلقائياً.`,
        threadID
      );
    } else {
      api.sendMessage(`✅ تم تغيير اسم الجروب إلى:\n"${newName}"`, threadID);
    }
  } catch (err) {
    api.sendMessage("❌ فشل تغيير اسم الجروب.\n" + (err?.message || ""), threadID);
  }
};
