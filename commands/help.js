const generateHelpGif = require("../utils/generateHelpGif");
const fs = require("fs");

module.exports = async (api, event, args, startTime, loadData) => {
  const data = loadData();
  const prefix = data.prefix || "!";

  try {
    const gifPath = await generateHelpGif(prefix);
    await api.sendMessage(
      { attachment: fs.createReadStream(gifPath) },
      event.threadID
    );
  } catch (err) {
    const freeMode = data.freePrefix ? "حرة (بدون بادئة)" : `مقيدة («${prefix}»)`;
    const helpText =
`⚙️ البادئة: «${prefix}» | الوضع: ${freeMode}

🛡️ الحماية
  ${prefix}حماية — تفعيل/إيقاف حماية الاسم والكنيات

✏️ تعديل الجروب
  ${prefix}اسم [الاسم] — تغيير اسم الجروب
  ${prefix}كنيات [الكنية] — تغيير كل كنيات الجروب
  ${prefix}ضيف [ID] — إضافة عضو للجروب

💾 الرسائل
  ${prefix}حفظ — (ردّ) حفظ رسالة وتعيينها للاتوميك
  ${prefix}حفظ قائمة — عرض الرسائل المحفوظة

📤 الإرسال التلقائي
  ${prefix}اتوميك — بدء الإرسال كل 15 ثانية
  ${prefix}اتوميك ايقاف — إيقاف الإرسال

👥 الجروبات
  ${prefix}قروبات — قائمة الجروبات

⚙️ البادئة
  ${prefix}prefix — عرض الإعدادات

📊 معلومات
  ${prefix}uptime — حالة البوت
  ${prefix}ping — اختبار الاتصال

🚪 أخرى
  ${prefix}خروج — إخراج البوت من الجروب

⚠️ جميع الأوامر للمطور فقط.`;

    api.sendMessage(helpText, event.threadID);
  }
};
