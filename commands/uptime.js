const os = require("os");

module.exports = (api, event, args, startTime) => {
  const diff = Date.now() - startTime;
  const s = Math.floor(diff / 1000) % 60;
  const m = Math.floor(diff / 60000) % 60;
  const h = Math.floor(diff / 3600000) % 24;
  const d = Math.floor(diff / 86400000);
  const uptime = `${d > 0 ? d + "ي " : ""}${h > 0 ? h + "س " : ""}${m > 0 ? m + "د " : ""}${s}ث`;
  const mem = Math.round(process.memoryUsage().rss / 1024 / 1024);
  api.sendMessage(`uptime: ${uptime.trim()}\nmem: ${mem}MB\nnode: ${process.version}`, event.threadID);
};
