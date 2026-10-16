/* guard.js — الزائر (بدون حساب) لا يرى إلا الصفحة الرئيسية؛ بقية صفحات الموقع للمسجَّلين فقط.
   يُحمَّل في <head> الصفحات المحجوبة ليُحوِّل الزائر قبل رسم أي محتوى.
   ملاحظة: هذا حجب في الواجهة (المرحلة الأولى)، والحجب الحقيقي يتم في الخادم في المرحلة الثانية. */
(function () {
  let u = null;
  try { u = JSON.parse(sessionStorage.getItem("currentUser") || "null"); } catch (e) {}
  if (!u) {
    const back = encodeURIComponent((location.pathname.split("/").pop() || "index.html") + location.search);
    location.replace("login.html?need=1&next=" + back);
  }
})();
