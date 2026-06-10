const generateMarcoGif = require("../utils/generateMarcoGif");
const fs = require("fs");
const path = require("path");

module.exports = async (api, event, args, startTime, loadData) => {
  const data = loadData();
  const prefix = data.prefix || "!";

  const helpText =
`${prefix}حماية — تفعيل/إيقاف حماية الاسم والكنيات
${prefix}اسم [الاسم] — تغيير اسم الجروب
${prefix}كنيات [الكنية] — تغيير كل الكنيات
${prefix}ضيف [ID] — إضافة عضو
${prefix}حفظ — (ردّ) حفظ رسالة للاتوميك
${prefix}حفظ قائمة — عرض الرسائل
${prefix}حفظ اختيار [رقم] — تغيير رسالة الاتوميك
${prefix}اتوميك — بدء الإرسال كل 15 ثانية
${prefix}اتوميك ايقاف — إيقاف
${prefix}قروبات — قائمة الجروبات
${prefix}prefix — إعدادات البادئة
${prefix}uptime — حالة البوت
${prefix}ping — اختبار الاتصال
${prefix}خروج — إخراج البوت`;

  const gifPath = path.join(__dirname, "..", "assets", "marco.gif");

  try {
    if (!fs.existsSync(gifPath)) {
      await generateMarcoGif();
    }
    await api.sendMessage(
      { attachment: fs.createReadStream(gifPath) },
      event.threadID
    );
    api.sendMessage(helpText, event.threadID);
  } catch {
    api.sendMessage(helpText, event.threadID);
  }
};
