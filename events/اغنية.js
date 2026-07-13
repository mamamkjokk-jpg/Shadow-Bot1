const songState = require("../utils/songState");
const ytsr = require("ytsr");
const ytdl = require("@distube/ytdl-core");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function searchYouTube(query) {
  const res = await ytsr(query, { limit: 12 });
  return res.items.filter(i => i.type === "video").slice(0, 6);
}

async function searchTikTok(query) {
  const url = `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}&count=6&cursor=0&web=1`;
  const res = await axios.get(url, { timeout: 20000, headers: { "User-Agent": "Mozilla/5.0" } });
  return (res.data?.data?.videos || []).slice(0, 6);
}

async function downloadUrlToTemp(url, ext) {
  const tmpPath = path.join("/tmp", `dl_${Date.now()}.${ext}`);
  const res = await axios.get(url, {
    responseType: "stream",
    timeout: 90000,
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  await new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(tmpPath);
    res.data.pipe(ws);
    ws.on("finish", resolve);
    ws.on("error", reject);
    res.data.on("error", reject);
  });
  return tmpPath;
}

async function downloadYTAudio(videoUrl) {
  const tmpPath = path.join("/tmp", `yt_${Date.now()}.m4a`);
  const stream = ytdl(videoUrl, {
    filter: "audioonly",
    quality: "highestaudio"
  });
  await new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(tmpPath);
    stream.pipe(ws);
    ws.on("finish", resolve);
    ws.on("error", reject);
    stream.on("error", reject);
  });
  return tmpPath;
}

function safeUnlink(filePath) {
  try { fs.unlinkSync(filePath); } catch {}
}

module.exports = async (api, event, config, loadData) => {
  if (!event.body) return;

  const threadID = event.threadID;
  const senderID = event.senderID;

  const data = loadData();
  const admins = data.admins || [];
  const isAllowed = config.DEV_IDS.includes(senderID) || admins.includes(senderID);
  if (!isAllowed) return;

  const state = songState.get(threadID);
  if (!state) return;

  const input = event.body.trim();
  const num = parseInt(input, 10);

  // ─── Step 1: اختيار المنصة ──────────────────────────
  if (state.step === "platform") {
    if (input !== "1" && input !== "2") return;
    songState.clear(threadID);

    if (input === "1") {
      // ── يوتيوب ──
      api.sendMessage("🔍 جاري البحث في يوتيوب...", threadID);
      try {
        const videos = await searchYouTube(state.query);
        if (!videos.length) return api.sendMessage("ما لقيت نتائج في يوتيوب.", threadID);

        // تحميل الصور المصغرة
        const thumbStreams = [];
        for (const v of videos) {
          const thumbUrl = v.bestThumbnail?.url || v.thumbnails?.[0]?.url;
          if (thumbUrl) {
            try {
              const r = await axios.get(thumbUrl, { responseType: "stream", timeout: 12000 });
              thumbStreams.push(r.data);
            } catch {}
          }
        }

        const caption = videos.map((v, i) =>
          `${i + 1}. ${v.title}${v.duration ? ` (${v.duration})` : ""}`
        ).join("\n") + "\n\n✏️ رد بالرقم (1-6):";

        await api.sendMessage(
          thumbStreams.length > 0 ? { body: caption, attachment: thumbStreams } : caption,
          threadID
        );

        songState.set(threadID, { step: "youtube_pick", results: videos });
        setTimeout(() => {
          if (songState.get(threadID)?.step === "youtube_pick") songState.clear(threadID);
        }, 120000);

      } catch (e) {
        songState.clear(threadID);
        api.sendMessage("❌ فشل البحث في يوتيوب.", threadID);
        console.log("[اغنية/ytsr]", e.message);
      }

    } else {
      // ── تيك توك ──
      api.sendMessage("🔍 جاري البحث في تيك توك...", threadID);
      try {
        const videos = await searchTikTok(state.query);
        if (!videos.length) return api.sendMessage("ما لقيت نتائج في تيك توك.", threadID);

        const list = videos.map((v, i) =>
          `${i + 1}. ${(v.title || v.desc || "بدون عنوان").substring(0, 60)}\n   👤 @${v.author?.nickname || "?"} | 👁️ ${Number(v.play_count || 0).toLocaleString()}`
        ).join("\n\n");

        await api.sendMessage(list + "\n\n✏️ رد بالرقم (1-6):", threadID);

        songState.set(threadID, { step: "tiktok_pick", results: videos });
        setTimeout(() => {
          if (songState.get(threadID)?.step === "tiktok_pick") songState.clear(threadID);
        }, 120000);

      } catch (e) {
        songState.clear(threadID);
        api.sendMessage("❌ فشل البحث في تيك توك.", threadID);
        console.log("[اغنية/tiktok]", e.message);
      }
    }
    return;
  }

  // ─── Step 2: اختيار نتيجة يوتيوب ──────────────────
  if (state.step === "youtube_pick") {
    if (isNaN(num) || num < 1 || num > state.results.length) return;
    const chosen = state.results[num - 1];
    songState.clear(threadID);

    api.sendMessage(`⬇️ جاري تحميل:\n${chosen.title}`, threadID);

    let tmpPath = null;
    try {
      tmpPath = await downloadYTAudio(chosen.url);
      await api.sendMessage({ attachment: fs.createReadStream(tmpPath) }, threadID);
    } catch (e) {
      api.sendMessage(`❌ فشل التحميل.\n🔗 ${chosen.url}`, threadID);
      console.log("[اغنية/ytdl]", e.message);
    } finally {
      if (tmpPath) safeUnlink(tmpPath);
    }
    return;
  }

  // ─── Step 3: اختيار نتيجة تيك توك ─────────────────
  if (state.step === "tiktok_pick") {
    if (isNaN(num) || num < 1 || num > state.results.length) return;
    const chosen = state.results[num - 1];
    songState.clear(threadID);

    const title = (chosen.title || chosen.desc || "فيديو").substring(0, 50);
    api.sendMessage(`⬇️ جاري تحميل:\n${title}`, threadID);

    // حاول بدون علامة مائية أولاً ثم بها
    const downloadUrl = chosen.play || chosen.wmplay;
    if (!downloadUrl) return api.sendMessage("❌ ما قدرت أجيب رابط التحميل.", threadID);

    let tmpPath = null;
    try {
      tmpPath = await downloadUrlToTemp(downloadUrl, "mp4");
      await api.sendMessage({ attachment: fs.createReadStream(tmpPath) }, threadID);
    } catch (e) {
      api.sendMessage("❌ فشل التحميل.", threadID);
      console.log("[اغنية/tiktok-dl]", e.message);
    } finally {
      if (tmpPath) safeUnlink(tmpPath);
    }
  }
};
