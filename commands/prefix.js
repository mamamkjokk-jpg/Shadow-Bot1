module.exports = (api, event, args, startTime, loadData, saveData) => {
  const data = loadData();
  const threadID = event.threadID;
  const sub = args[1];

  if (!sub) return api.sendMessage(`prefix: "${data.prefix || "!"}" | freePrefix: ${data.freePrefix ? "on" : "off"}`, threadID);

  if (sub === "on") { data.freePrefix = true; saveData(data); return; }
  if (sub === "off") { data.freePrefix = false; saveData(data); return; }

  if (sub.length <= 3) {
    data.prefix = sub;
    saveData(data);
    api.sendMessage(`prefix: "${sub}"`, threadID);
  }
};
