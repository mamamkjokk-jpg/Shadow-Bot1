const axios = require("axios");
const FormData = require("form-data");

module.exports = async (api, event) => {
  const threadID = event.threadID;

  const reply = event.messageReply;
  if (!reply) {
    return api.sendMessage("❌ ردّ على صورة أو ملف وكتب الأمر.", threadID);
  }

  const attachments = reply.attachments || [];
  if (attachments.length === 0) {
    return api.sendMessage("❌ الرسالة المردود عليها ما تحتوي على ملف.", threadID);
  }

  const att = attachments[0];
  const rawUrl =
    att.url || att.largePreviewUrl || att.previewUrl || att.thumbnailUrl || null;

  if (!rawUrl) {
    return api.sendMessage("❌ ما قدرت أجيب رابط الملف.", threadID);
  }

  try {
    const download = await axios.get(rawUrl, {
      responseType: "stream",
      timeout: 25000,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const rawName = att.filename || att.name || "file.jpg";
    const ext = rawName.split(".").pop().replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
    const filename = `upload_${Date.now()}.${ext}`;

    const form = new FormData();
    form.append("file", download.data, { filename, contentType: download.headers["content-type"] || "image/jpeg" });

    const upload = await axios.post("https://telegra.ph/upload", form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const result = upload.data;
    if (!Array.isArray(result) || !result[0]?.src) {
      return api.sendMessage("❌ فشل الرفع على telegra.ph. جرب مرة ثانية.", threadID);
    }

    const link = `https://telegra.ph${result[0].src}`;
    api.sendMessage(`🔗 رابط الصورة:\n${link}`, threadID);
  } catch (err) {
    api.sendMessage(`❌ فشل الرفع.\n${err?.message || ""}`, threadID);
  }
};
