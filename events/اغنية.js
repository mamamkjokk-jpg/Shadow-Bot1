const songState = require("../utils/songState");
const ytsr = require("ytsr");
const ytdl = require("@distube/ytdl-core");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function searchYouTube(query) {
  const res = await ytsr(query, { limit: 10 });
  return res.items.filter(i => i.type === "video").slice(0, 6);
}

async function searchTikTok(query) {
  const url = `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}&count=6&cursor=0&web=1`;
  const res = await axios.get(url, { timeout: 15000 });
  return (res.data?.data?.videos || []).slice(0, 6);
}

async function downloadToTemp(url, ext) {
  const tmpPath = path.join("/tmp", `dl_${Date.now()}.${ext}`);
  const res = await axios.get(url, { responseType: "stream", timeout: 60000 });
  await new Promise((resolve, reject) => {
    const ws = fs.createWriteStream(tmpPath);
    res.data.pipe(ws);
    ws.on("finish", resolve);
    ws.on("error", reject);
  });
  return tmpPath;
}

module.exports = async (api, event, config) => {
  if (!event.body) return;

  const threadID = event.threadID;
  const senderID = event.senderID;

  // Only respond to DEVs
  if (!config.DEV_IDS.includes(senderID)) return;

  const state = songState.get(threadID);
  if (!state) return;

  const input = event.body.trim();
  const num = parseInt(input);

  // ─── Step 1: Choose platform ───────────────────────
  if (state.step === "platform") {
    if (input !== "1" && input !== "2") return;
    songState.clear(threadID);

    if (input === "1") {
      // YouTube
      try {
        const videos = await searchYouTube(state.query);
        if (!videos.length) return api.sendMessage("ما لقيت نتائج في يوتيوب.", threadID);

        // Download thumbnails as streams
        const thumbStreams = [];
        for (const v of videos) {
          const thumbUrl = v.bestThumbnail?.url || v.thumbnails?.[0]?.url;
          if (thumbUrl) {
            try {
              const r = await axios.get(thumbUrl, { responseType: "stream", timeout: 10000 });
              thumbStreams.push(r.data);
            } catch {}
          }
        }

        const caption = videos.map((v, i) => `${i + 1}. ${v.title} (${v.duration || ""})`).join("\n") + "\n\nرد بالرقم:";

        await api.sendMessage(
          thumbStreams.length > 0 ? { body: caption, attachment: thumbStreams } : caption,
          threadID
        );

        songState.set(threadID, { step: "youtube_pick", results: videos });
        setTimeout(() => { if (songState.get(threadID)?.step === "youtube_pick") songState.clear(threadID); }, 120000);
      } catch (e) {
        songState.clear(threadID);
        api.sendMessage("فشل البحث في يوتيوب.", threadID);
        console.log("ytsr error:", e.message);
      }

    } else {
      // TikTok
      try {
        const videos = await searchTikTok(state.query);
        if (!videos.length) return api.sendMessage("ما لقيت نتائج في تيك توك.", threadID);

        const list = videos.map((v, i) =>
          `${i + 1}. ${v.title || v.desc || "بدون عنوان"}\n   @${v.author?.nickname || "?"} | مشاهدات: ${(v.play_count || 0).toLocaleString()}`
        ).join("\n\n");

        await api.sendMessage(list + "\n\nرد بالرقم:", threadID);

        songState.set(threadID, { step: "tiktok_pick", results: videos });
        setTimeout(() => { if (songState.get(threadID)?.step === "tiktok_pick") songState.clear(threadID); }, 120000);
      } catch (e) {
        songState.clear(threadID);
        api.sendMessage("فشل البحث في تيك توك.", threadID);
        console.log("tiktok error:", e.message);
      }
    }
    return;
  }

  // ─── Step 2: Pick YouTube result ──────────────────
  if (state.step === "youtube_pick") {
    if (!num || num < 1 || num > state.results.length) return;
    songState.clear(threadID);

    const chosen = state.results[num - 1];
    const videoUrl = chosen.url;

    api.sendMessage(`جاري تحميل: ${chosen.title}`, threadID);

    try {
      const tmpPath = path.join("/tmp", `yt_${Date.now()}.mp4`);
      const stream = ytdl(videoUrl, { quality: "lowest", filter: "audioandvideo" });
      await new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(tmpPath);
        stream.pipe(ws);
        ws.on("finish", resolve);
        ws.on("error", reject);
        stream.on("error", reject);
      });

      await api.sendMessage({ attachment: fs.createReadStream(tmpPath) }, threadID);
      fs.unlink(tmpPath, () => {});
    } catch (e) {
      api.sendMessage("فشل التحميل. جرب مقطع أقصر.\n" + videoUrl, threadID);
      console.log("ytdl error:", e.message);
    }
    return;
  }

  // ─── Step 3: Pick TikTok result ──────────────────
  if (state.step === "tiktok_pick") {
    if (!num || num < 1 || num > state.results.length) return;
    songState.clear(threadID);

    const chosen = state.results[num - 1];
    const downloadUrl = chosen.play || chosen.wmplay || chosen.downloads?.watermark;

    if (!downloadUrl) return api.sendMessage("ما قدرت أجيب رابط التحميل.", threadID);

    api.sendMessage(`جاري تحميل: ${chosen.title || chosen.desc || "فيديو"}`, threadID);

    try {
      const tmpPath = await downloadToTemp(downloadUrl, "mp4");
      await api.sendMessage({ attachment: fs.createReadStream(tmpPath) }, threadID);
      fs.unlink(tmpPath, () => {});
    } catch (e) {
      api.sendMessage("فشل التحميل.", threadID);
      console.log("tiktok dl error:", e.message);
    }
  }
};
