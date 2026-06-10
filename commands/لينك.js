const axios = require("axios");
const FormData = require("form-data");

module.exports = async (api, event) => {
  const threadID = event.threadID;
  const reply = event.messageReply;

  if (!reply) return api.sendMessage("رد على صورة أو فيديو وكتب الأمر.", threadID);

  const attachments = reply.attachments || [];
  if (attachments.length === 0) return api.sendMessage("الرسالة ما تحتوي على ملف.", threadID);

  const att = attachments[0];

  // Try to get best URL based on type
  let rawUrl = null;
  if (att.type === "video") {
    rawUrl = att.playableUrl || att.url || att.previewUrl || null;
  } else {
    rawUrl = att.largePreviewUrl || att.url || att.previewUrl || att.thumbnailUrl || att.playableUrl || null;
  }

  if (!rawUrl) return api.sendMessage("ما قدرت أجيب رابط الملف.", threadID);

  // If it's a video, just return the direct URL (telegra.ph doesn't accept videos)
  if (att.type === "video") {
    return api.sendMessage(rawUrl, threadID);
  }

  try {
    const download = await axios.get(rawUrl, {
      responseType: "stream",
      timeout: 25000,
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.facebook.com"
      }
    });

    const ext = (att.filename || att.name || "file.jpg").split(".").pop().replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
    const filename = `up_${Date.now()}.${ext}`;
    const contentType = download.headers["content-type"] || "image/jpeg";

    const form = new FormData();
    form.append("file", download.data, { filename, contentType });

    const upload = await axios.post("https://telegra.ph/upload", form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const result = upload.data;
    if (!Array.isArray(result) || !result[0]?.src) {
      return api.sendMessage("فشل الرفع على telegra.ph.", threadID);
    }

    api.sendMessage(`https://telegra.ph${result[0].src}`, threadID);
  } catch (err) {
    // Fallback: return the original URL
    api.sendMessage(rawUrl, threadID);
  }
};
