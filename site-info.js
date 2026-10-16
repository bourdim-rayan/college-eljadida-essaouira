/* ===================================================================
   site-info.js - يملأ كل صفحات الموقع بمعلومات المؤسسة التي يعدّلها المدير
   (الاسم، العنوان، الاتصال، التواصل الاجتماعي، نص الواجهة، الأخبار العاجلة،
   الإحصائيات). يعتمد على mock-data.js ويُحمَّل بعده في كل صفحة.
   كل النصوص تُكتب بـ textContent (لا HTML) والروابط يتحقق منها النموذج.
   =================================================================== */

const DEFAULT_SCHOOL_NAME = "الثانوية الإعدادية الجديدة";
const DEFAULT_CITY = "الصويرة";

function fmtNum(v) { return String(Number(v)); }

function applySchoolInfo() {
  DB = loadDB();
  const s = DB.settings, st = DB.stats;
  const year = new Date().getFullYear();

  const values = {
    name: s.schoolName,
    city: s.city,
    tagline: s.tagline,
    address: s.address,
    email: s.email,
    phone: s.phone,
    fax: s.fax,
    heroEyebrow: s.heroEyebrow,
    heroTitle: s.heroTitle,
    heroLead: s.heroLead,
    eventTitle: s.eventTitle,
    copyright: "© " + year + " " + s.schoolName + " - " + s.city + ". جميع الحقوق محفوظة.",
  };

  document.querySelectorAll("[data-school]").forEach(el => {
    const v = values[el.getAttribute("data-school")];
    if (v === undefined) return;
    el.textContent = v;
    const wrap = el.closest("[data-hide-if-empty]");
    if (wrap) wrap.style.display = v ? "" : "none";
  });

  // عنوان التبويب واسم الشعار
  document.title = document.title.split(DEFAULT_SCHOOL_NAME).join(s.schoolName);
  if (s.city !== DEFAULT_CITY) {
    document.title = document.title.replace(new RegExp(" - " + DEFAULT_CITY + "$"), " - " + s.city);
  }
  document.querySelectorAll("img.brand-emblem, img.seagull").forEach(img => {
    img.alt = "شعار " + s.schoolName;
  });

  // روابط التواصل الاجتماعي: تظهر فقط إن أدخلها المدير
  document.querySelectorAll("[data-social]").forEach(a => {
    const url = s[a.getAttribute("data-social")];
    if (url && /^https?:\/\//i.test(url)) {
      a.href = url; a.target = "_blank"; a.rel = "noopener noreferrer"; a.style.display = "";
    } else {
      a.style.display = "none";
    }
  });
  const row = document.querySelector(".social-row");
  if (row) {
    const anyVisible = Array.from(row.querySelectorAll("[data-social]")).some(a => a.style.display !== "none");
    row.style.display = anyVisible ? "" : "none";
  }

  // البريد والهاتف كروابط قابلة للنقر
  const mail = document.querySelector("a[data-link='email']");
  if (mail) { mail.href = s.email ? "mailto:" + s.email : "#"; }

  // الأخبار العاجلة
  const bar = document.querySelector(".ticker-bar");
  const track = document.getElementById("tickerTrack");
  if (bar && track) {
    if (!s.ticker || !s.ticker.length) {
      bar.style.display = "none";
    } else {
      bar.style.display = "";
      track.innerHTML = "";
      s.ticker.concat(s.ticker).forEach(txt => {
        const span = document.createElement("span");
        span.textContent = txt;
        track.appendChild(span);
      });
    }
  }

  // شريط الإحصائيات في الصفحة الرئيسية
  const band = document.getElementById("statsBand");
  if (band) {
    const items = [
      [fmtNum(st.successRate) + "%", "نسبة النجاح العامة"],
      [fmtNum(st.totalStudents), "عدد التلاميذ"],
      [fmtNum(st.classroomsCount), "عدد الأقسام"],
      [fmtNum(st.regionalExamRate) + "%", "نسبة الامتحان الموحد الإقليمي"],
    ];
    band.innerHTML = "";
    items.forEach(([n, label]) => {
      const d = document.createElement("div"); d.className = "stat";
      const b = document.createElement("b"); b.textContent = n;
      const sp = document.createElement("span"); sp.textContent = label;
      d.appendChild(b); d.appendChild(sp); band.appendChild(d);
    });
  }
}

applySchoolInfo();

/* مستخدم مسجَّل الدخول: زر الدخول في الهيدر يصبح «لوحتي» ويقود إلى لوحته مباشرة */
document.addEventListener("DOMContentLoaded", () => {
  try {
    const raw = sessionStorage.getItem("currentUser");
    if (!raw) {   // زائر: الروابط الأخرى مقفلة (تقود إلى الدخول)
      document.querySelectorAll(".main-nav a").forEach(a => {
        const h = a.getAttribute("href") || "";
        if (/^(news|schedule|mic)\.html/.test(h)) { a.textContent = "🔒 " + a.textContent.trim(); a.title = "للمسجَّلين فقط"; }
      });
      return;
    }
    const u = JSON.parse(raw);
    const map = { admin: "dashboard-admin.html", staff: "dashboard-admin.html", teacher: "dashboard-teacher.html", student: "dashboard-student.html", parent: "dashboard-parent.html" };
    if (!map[u.role]) return;
    document.querySelectorAll(".main-nav a.btn[href='login.html'], header a.btn[href='login.html']").forEach(a => { a.href = map[u.role]; a.textContent = "🏠 لوحتي"; });
  } catch (e) { /* التخزين غير متاح */ }
});
