const ws3 = require("ws3-fca");
const fs = require("fs");
const os = require("os");

process.on("uncaughtException", (err) => {
  console.log("⚠️ خطأ غير متوقع (البوت يواصل):", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.log("⚠️ Promise rejection (البوت يواصل):", reason);
});

const config = {
  BOT_NAME: "ᴹᵃʳᶜᵒ",
  DEV_ID: "61589645620146"
};

const appState = JSON.parse(fs.readFileSync("appState.json", "utf8"));

function loadData() {
  try {
    return JSON.parse(fs.readFileSync("data.json", "utf8"));
  } catch {
    return { prefix: "!", freePrefix: false, protected: {}, savedMessages: [] };
  }
}

function saveData(data) {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

const commands = {};
fs.readdirSync("./commands").forEach(file => {
  if (file.endsWith(".js")) {
    const name = file.replace(".js", "");
    commands[name] = require(`./commands/${file}`);
  }
});

const events = {};
fs.readdirSync("./events").forEach(file => {
  if (file.endsWith(".js")) {
    const name = file.replace(".js", "");
    events[name] = require(`./events/${file}`);
  }
});

const automicTimers = {};

ws3.login({ appState }, (err, api) => {
  if (err) return console.log("خطأ في تسجيل الدخول:", err);

  console.log("✅ البوت يعمل");

  const BOT_ID = api.getCurrentUserID();
  console.log("🤖 ID البوت:", BOT_ID);

  const startTime = Date.now();
  const hostingInfo = {
    platform: os.platform(),
    arch: os.arch(),
    node: process.version,
    hostname: os.hostname()
  };

  api.listenMqtt((err, event) => {
    if (err || !event) return;

    for (const e in events) {
      try {
        events[e](api, event, config, loadData, saveData, automicTimers);
      } catch {}
    }

    if (!event.body) return;

    const body = event.body.trim();
    const data = loadData();
    const PREFIX = data.prefix || "!";
    const freePrefix = data.freePrefix || false;

    let cmd = null;
    let args = [];

    if (body.startsWith(PREFIX)) {
      args = body.slice(PREFIX.length).trim().split(" ");
      cmd = args[0].toLowerCase();
    } else if (freePrefix) {
      args = body.trim().split(" ");
      cmd = args[0].toLowerCase();
    }

    if (cmd && commands[cmd]) {
      const isAllowed = event.senderID === config.DEV_ID || event.senderID === BOT_ID;
      if (!isAllowed) {
        return api.sendMessage("⛔ هذا الأمر مخصص للمطور فقط.", event.threadID);
      }
      try {
        const result = commands[cmd](api, event, args, startTime, loadData, saveData, automicTimers, config, hostingInfo);
        if (result && typeof result.catch === "function") {
          result.catch(e => console.log("خطأ في الأمر:", e.message));
        }
      } catch (e) {
        console.log("خطأ في الأمر:", e.message);
      }
      return;
    }

    if (event.messageReply && (event.senderID === config.DEV_ID || event.senderID === BOT_ID)) {
      const number = parseInt(body.trim(), 10);
      if (!isNaN(number) && number > 0) {
        const msgs = data.savedMessages || [];
        if (msgs.length === 0) {
          return api.sendMessage("❌ لا توجد رسائل محفوظة.", event.threadID);
        }
        if (number >= 1 && number <= msgs.length) {
          api.sendMessage(msgs[number - 1], event.threadID);
        } else {
          api.sendMessage(`❌ الرقم غير صحيح. الرسائل المتاحة: 1 - ${msgs.length}`, event.threadID);
        }
      }
    }
  });
});
