const ws3 = require("ws3-fca");
const fs = require("fs");
const os = require("os");
const http = require("http");

process.on("uncaughtException", (err) => console.log("خطأ:", err.message));
process.on("unhandledRejection", (reason) => console.log("خطأ:", reason));

const config = {
  BOT_NAME: "ديابلوس",
  BOT_NICK: "𝙳𝚒𝚊𝚋𝚕𝚘𝚜",
  DEV_ID: "61589645620146"
};

// HTTP server to keep the process alive on hosting platforms
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => res.end("ok")).listen(PORT);

const appState = JSON.parse(fs.readFileSync("appState.json", "utf8"));

function loadData() {
  try {
    return JSON.parse(fs.readFileSync("data.json", "utf8"));
  } catch {
    return { prefix: "!", freePrefix: false, protected: {}, savedMessages: [], admins: [] };
  }
}

function saveData(data) {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

const commands = {};
fs.readdirSync("./commands").forEach(file => {
  if (file.endsWith(".js")) {
    commands[file.replace(".js", "")] = require(`./commands/${file}`);
  }
});

const events = {};
fs.readdirSync("./events").forEach(file => {
  if (file.endsWith(".js")) {
    events[file.replace(".js", "")] = require(`./events/${file}`);
  }
});

const automicTimers = {};
const botSentMessages = {}; // { threadID: [msgID, ...] }

function trackMsg(threadID, msgID) {
  if (!threadID || !msgID) return;
  if (!botSentMessages[threadID]) botSentMessages[threadID] = [];
  botSentMessages[threadID].push(msgID);
  if (botSentMessages[threadID].length > 60) botSentMessages[threadID].shift();
}

ws3.login({ appState }, (err, api) => {
  if (err) return console.log("خطأ في تسجيل الدخول:", err);

  const BOT_ID = api.getCurrentUserID();
  console.log("✅ يعمل | ID:", BOT_ID);

  // Wrap sendMessage to track sent IDs
  const _origSend = api.sendMessage.bind(api);
  api.sendMessage = (msg, threadID, cb) => {
    if (typeof cb === "function") {
      return _origSend(msg, threadID, (e2, info) => {
        if (!e2 && info?.messageID) trackMsg(threadID, info.messageID);
        cb(e2, info);
      });
    }
    const p = _origSend(msg, threadID);
    if (p && typeof p.then === "function") {
      return p.then(info => {
        if (info?.messageID) trackMsg(threadID, info.messageID);
        return info;
      });
    }
    return p;
  };

  const startTime = Date.now();
  const hostingInfo = { platform: os.platform(), arch: os.arch(), node: process.version };

  api.listenMqtt((err, event) => {
    if (err || !event) return;

    for (const e in events) {
      try { events[e](api, event, config, loadData, saveData, automicTimers, BOT_ID); } catch {}
    }

    if (!event.body) return;

    const data = loadData();
    const admins = data.admins || [];
    const isAllowed = event.senderID === config.DEV_ID || admins.includes(event.senderID);
    if (!isAllowed) return;

    const PREFIX = data.prefix || "!";
    const body = event.body.trim();
    let cmd = null, args = [];

    if (body.startsWith(PREFIX)) {
      args = body.slice(PREFIX.length).trim().split(" ");
      cmd = args[0].toLowerCase();
    } else if (data.freePrefix) {
      args = body.trim().split(" ");
      cmd = args[0].toLowerCase();
    }

    if (!cmd || !commands[cmd]) return;

    try {
      const result = commands[cmd](
        api, event, args, startTime,
        loadData, saveData, automicTimers,
        config, hostingInfo, botSentMessages, BOT_ID
      );
      if (result?.catch) result.catch(e => console.log("خطأ:", e.message));
    } catch (e) {
      console.log("خطأ:", e.message);
    }
  });
});
