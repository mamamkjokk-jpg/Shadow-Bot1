module.exports = (api, event, args) => {
  const threadID = event.threadID;

  if (!args[1]) {
    return api.sendMessage("❌ لازم تكتب الاسم الجديد.\nمثال: !اسم قروب شادو", threadID);
  }

  const newName = args.slice(1).join(" ");

  api.setTitle(newName, threadID, (err) => {
    if (err) {
      return api.sendMessage("❌ فشل تغيير اسم الجروب.\n" + (err?.message || ""), threadID);
    }
    api.sendMessage(`✅ تم تغيير اسم الجروب إلى:\n"${newName}"`, threadID);
  });
};
