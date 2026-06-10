const buildHelpGif = require("../utils/buildHelpGif");
const fs = require("fs");
const path = require("path");

module.exports = async (api, event, args, startTime, loadData) => {
  const data = loadData();
  const prefix = data.prefix || "!";
  const gifPath = path.join(__dirname, "..", "assets", "help.gif");

  try {
    await buildHelpGif(prefix);
    await api.sendMessage(
      { attachment: fs.createReadStream(gifPath) },
      event.threadID
    );
  } catch (err) {
    console.log("خطأ help gif:", err?.message);
    const helpText =
`${prefix}حماية — تفعيل/إيقاف الحماية
${prefix}اسم [اسم] — تغيير اسم الجروب
${prefix}كنيات [كنية] — تغيير كل الكنيات
${prefix}ضيف [ID] — إضافة عضو
${prefix}لينك — (ردّ على صورة) رفع وجيب رابط
${prefix}حفظ — (ردّ) حفظ رسالة للاتوميك
${prefix}اتوميك — بدء الإرسال التلقائي
${prefix}قروبات — قائمة الجروبات
${prefix}prefix — إعدادات البادئة
${prefix}uptime — حالة البوت
${prefix}ping — اختبار الاتصال
${prefix}خروج — إخراج البوت`;
    api.sendMessage(helpText, event.threadID);
  }
};
