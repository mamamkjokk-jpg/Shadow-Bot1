const songState = require("../utils/songState");

module.exports = (api, event, args) => {
  const threadID = event.threadID;

  if (!args[1]) return api.sendMessage("مثال: !اغنية اسم الاغنية", threadID);

  const query = args.slice(1).join(" ");
  songState.set(threadID, { step: "platform", query });

  api.sendMessage(`بحث عن: "${query}"\n1. يوتيوب\n2. تيك توك`, threadID);

  // Auto-clear after 3 min if no reply
  setTimeout(() => { if (songState.get(threadID)?.query === query) songState.clear(threadID); }, 180000);
};
