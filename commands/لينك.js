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
    att.url ||
    att.largePreviewUrl ||
    att.previewUrl ||
    att.thumbnailUrl ||
    att.playable_url ||
    null;

  if (!rawUrl) {
    return api.sendMessage("❌ ما قدرت أجيب رابط الصورة.", threadID);
  }

  try {
    const download = await axios.get(rawUrl, {
      responseType: "stream",
      timeout: 20000,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const ext = (att.filename || att.name || "file.jpg")
      .split(".")
      .pop()
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase() || "jpg";

    const filename = `${Date.now()}.${ext}`;

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", download.data, { filename });

    const upload = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
      timeout: 30000
    });

    const link = upload.data?.trim();
    if (!link || !link.startsWith("http")) {
      return api.sendMessage("❌ فشل رفع الملف.\nجرب مرة ثانية.", threadID);
    }

    api.sendMessage(`🔗 رابط الصورة:\n${link}`, threadID);
  } catch (err) {
    api.sendMessage(`❌ حدث خطأ أثناء الرفع.\n${err?.message || ""}`, threadID);
  }
};
