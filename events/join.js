module.exports = (api, event, config, loadData) => {
  if (event.logMessageType !== "log:subscribe") return;

  const threadID = event.threadID;
  const data = loadData();
  const prefix = data.prefix || "!";

  const welcomeMsg =
`✦ ══════════════════ ✦
⚔️  تَـمَّ الاتِّصَالُ بِالسِّيرفَر
🌑  البوتُ يعملُ وجاهِزٌ للأوامِر
👑  القروبُ تحتَ أمرتِكَ يا أيُّها اللّوردُ شادو
✦ ══════════════════ ✦
اكتب ${prefix}help لعرض الأوامر`;

  setTimeout(() => {
    try {
      const botID = api.getCurrentUserID();
      api.changeNickname(config.BOT_NAME, threadID, botID, () => {});
    } catch {}
  }, 2000);

  setTimeout(() => {
    try {
      api.sendMessage(welcomeMsg, threadID);
    } catch {}
  }, 3000);
};
