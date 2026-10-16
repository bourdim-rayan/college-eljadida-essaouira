/* ===================================================================
   app.js - المنطق العام المشترك بين صفحات الموقع
   =================================================================== */

// ---------- زر القائمة (Hamburger) للهواتف ----------
function toggleMenu() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".main-nav");
  burger.classList.toggle("open");
  nav.classList.toggle("mobile-open");
}

// ---------- زر طي/فتح القائمة الجانبية للوحات التحكم ----------
function toggleSidebar(force) {
  const sb = document.querySelector(".dash-sidebar");
  if (!sb) return;
  const open = typeof force === "boolean" ? force : !sb.classList.contains("open");
  sb.classList.toggle("open", open);
  let bd = document.querySelector(".dash-backdrop");
  if (!bd) {
    bd = document.createElement("div");
    bd.className = "dash-backdrop";
    bd.addEventListener("click", () => toggleSidebar(false));
    document.body.appendChild(bd);
  }
  bd.classList.toggle("show", open);
  document.body.classList.toggle("nav-open", open);
}
document.addEventListener("keydown", e => { if (e.key === "Escape") toggleSidebar(false); });

// ---------- تأثير موجة الماء (Ripple) عند الضغط على الأزرار ----------
document.addEventListener("click", function (e) {
  const btn = e.target.closest(".btn, .role-btn");
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height);
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = size + "px";
  ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
  ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
  btn.style.position = btn.style.position || "relative";
  btn.style.overflow = "hidden";
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 650);
});

// ---------- ظهور تدريجي للعناصر عند التمرير ----------
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  // إن لم يدعم المتصفح IntersectionObserver، تبقى العناصر ظاهرة دون تأثير
  if (!("IntersectionObserver" in window)) return;

  document.body.classList.add("reveal-ready");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
}

// ---------- عداد تنازلي لحدث قادم ----------
function initCountdown(targetDateStr, elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const target = new Date(targetDateStr).getTime();

  function tick() {
    const now = Date.now();
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.innerHTML = `
      <div class="cd-item"><b>${d}</b><span>يوم</span></div>
      <div class="cd-item"><b>${h}</b><span>ساعة</span></div>
      <div class="cd-item"><b>${m}</b><span>دقيقة</span></div>
      <div class="cd-item"><b>${s}</b><span>ثانية</span></div>
    `;
  }
  tick();
  setInterval(tick, 1000);
}

// ---------- شريط قراءة المقال (يظهر في أعلى الهيدر أثناء التمرير) ----------
function initReadProgress() {
  const bar = document.getElementById("readProgress");
  if (!bar) return;
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    bar.style.width = scrolled + "%";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initReveal();
  initReadProgress();
});


/* ---------- الأقسام (Views) داخل لوحات التحكم ----------
   كل قسم عنصر .view بمعرّف v-xxx، وروابط الشريط الجانبي data-view="xxx".
   data-perm="x" يُخفي العنصر عمّن لا يملك الصلاحية (data-perm="admin" للمدير فقط). */
function applyPerms(user) {
  document.querySelectorAll("[data-perm]").forEach(el => {
    const p = el.dataset.perm;
    const ok = p === "admin" ? user.role === "admin" : hasPerm(user, p);
    if (!ok) el.remove();
  });
  document.querySelectorAll("[data-mic]").forEach(el => { if (!canPostMic(user)) el.remove(); });
  document.querySelectorAll("[data-radio]").forEach(el => { if (!canBroadcast(user)) el.remove(); });
}
/* عرض قسم: يُظهر .view المطلوب فقط ويضيء رابطه. التنقل يمرّ عبر location.hash
   فيعمل زر الرجوع/التقدم في المتصفح، ويمكن مشاركة رابط القسم مباشرة. */
function showView(id) {
  const exists = id && document.getElementById("v-" + id);
  const target = exists ? id : ((document.querySelector(".view") || { id: "v-overview" }).id.slice(2));
  document.querySelectorAll(".view").forEach(v => { v.hidden = v.id !== "v-" + target; });
  document.querySelectorAll("[data-view]").forEach(a => {
    const on = a.dataset.view === target;
    if (a.closest(".dash-nav")) { a.classList.toggle("active", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); }
  });
  const act = document.querySelector(".dash-nav a.active");
  if (act && act.scrollIntoView) act.scrollIntoView({ block: "nearest" });
  toggleSidebar(false);
  window.scrollTo(0, 0);
  const t = document.querySelector(".dash-topbar h1");
  if (t && document.querySelector(".dash-nav a.active")) document.title = document.querySelector(".dash-nav a.active").textContent.trim().replace(/\s+\d+$/, "") + " - " + (t.dataset.base || (t.dataset.base = t.textContent));
}
function gotoView(id) { if (location.hash === "#" + id) showView(id); else location.hash = id; }
function initViews() {
  document.querySelectorAll("a[data-view]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); gotoView(a.dataset.view); }));
  window.addEventListener("hashchange", () => showView((location.hash || "").slice(1)));
  showView((location.hash || "").slice(1) || "overview");
}
