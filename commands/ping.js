module.exports = (api, event) => {
  const t = Date.now();
  api.sendMessage("pong " + (Date.now() - t) + "ms", event.threadID);
};
