module.exports = (api, event) => {
  const start = Date.now();
  api.sendMessage("🏓 Pong! ⚡ " + (Date.now() - start) + "ms", event.threadID);
};
