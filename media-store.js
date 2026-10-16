/* ===================================================================
   media-store.js — تخزين ملفات الصوت والفيديو (mp3 / mp4 ...) في المتصفح عبر IndexedDB.
   localStorage لا يتسع لملفات كبيرة، لذلك يُحفظ الملف هنا ويُحفظ في المنشور معرّفه فقط.
   تنبيه المرحلة الأولى: الملفات تبقى في متصفح الجهاز نفسه؛ الاطلاع عليها من أجهزة أخرى
   يتطلب رفعها إلى الخادم في المرحلة الثانية.
   =================================================================== */
const MEDIA_EXT = { mp3: "audio", m4a: "audio", wav: "audio", ogg: "audio", mp4: "video", webm: "video" };
const MEDIA_ID_RE = /^md-[a-z0-9]{6,20}$/;

function mediaKindOf(file) {
  const ext = (String(file.name || "").split(".").pop() || "").toLowerCase();
  const byExt = MEDIA_EXT[ext];
  if (!byExt) return null;
  const t = String(file.type || "");
  if (t && !/^(audio|video)\//.test(t)) return null;   // الامتداد وحده لا يكفي
  return /^audio\//.test(t) ? "audio" : byExt;   // تسجيل المتصفح (webm صوتي) يُعدّ صوتًا
}
function mediaCheck(file) {
  if (!file) return "اختر ملفًا.";
  if (!mediaKindOf(file)) return "الصيغ المسموحة: mp3 و m4a و wav و ogg للصوت، mp4 و webm للفيديو.";
  if (file.size === 0) return "الملف فارغ.";
  return "";
}

function mediaDB() {
  return new Promise((res, rej) => {
    if (!window.indexedDB) { rej(new Error("IndexedDB غير متاح في هذا المتصفح.")); return; }
    const rq = indexedDB.open("ecoleJadidaMedia", 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore("files", { keyPath: "id" });
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error || new Error("تعذّر فتح مخزن الملفات."));
  });
}
/* لا حد لحجم الملف في الموقع؛ الحد الوحيد هو المساحة الحرة في المتصفح. نتحقق منها قبل الحفظ لنعطي رسالة واضحة. */
async function mediaSpaceCheck(size) {
  try {
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist();   // نطلب تخزينًا دائمًا حتى لا يُمسح الملف
    if (navigator.storage && navigator.storage.estimate) {
      const e = await navigator.storage.estimate();
      if (e.quota && e.usage != null && size > e.quota - e.usage) return "المساحة الحرة في المتصفح لا تكفي لهذا الملف (المتاح " + fmtSize(Math.max(0, e.quota - e.usage)) + ").";
    }
  } catch (e) { /* تجاهل */ }
  return "";
}
async function mediaPut(file) {
  const err = mediaCheck(file);
  if (err) throw new Error(err);
  const spaceErr = await mediaSpaceCheck(file.size);
  if (spaceErr) throw new Error(spaceErr);
  const db = await mediaDB();
  const id = "md-" + Math.random().toString(36).slice(2, 12);
  await new Promise((res, rej) => {
    const tx = db.transaction("files", "readwrite");
    tx.objectStore("files").put({ id, name: String(file.name).slice(0, 120), type: file.type, kind: mediaKindOf(file), size: file.size, blob: file });
    tx.oncomplete = res; tx.onerror = () => rej(tx.error || new Error("تعذّر حفظ الملف (ربما المساحة ممتلئة)."));
    tx.onabort = () => rej(tx.error || new Error("تعذّر حفظ الملف (ربما المساحة ممتلئة)."));
  });
  return { id, name: file.name, kind: mediaKindOf(file), size: file.size };
}
async function mediaGet(id) {
  if (!MEDIA_ID_RE.test(String(id || ""))) return null;
  const db = await mediaDB();
  return new Promise((res, rej) => {
    const rq = db.transaction("files").objectStore("files").get(id);
    rq.onsuccess = () => res(rq.result || null); rq.onerror = () => rej(rq.error);
  });
}
async function mediaDelete(id) {
  if (!MEDIA_ID_RE.test(String(id || ""))) return;
  const db = await mediaDB();
  await new Promise(res => { const tx = db.transaction("files", "readwrite"); tx.objectStore("files").delete(id); tx.oncomplete = res; tx.onerror = res; });
}

/* يملأ عناصر <audio>/<video> التي تحمل data-media-id بملفاتها المخزَّنة */
async function hydrateMedia(root) {
  const els = (root || document).querySelectorAll("[data-media-id]");
  for (const el of els) {
    try {
      const rec = await mediaGet(el.dataset.mediaId);
      if (rec && rec.blob) { el.src = URL.createObjectURL(rec.blob); protectMedia(el); }
      else el.replaceWith(Object.assign(document.createElement("p"), { className: "empty-note", textContent: "الملف غير متوفر على هذا الجهاز (رُفع من جهاز آخر)." }));
    } catch (e) { /* تجاهل */ }
  }
}
function fmtSize(b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(b / 1024)) + " KB"; }

/* منع التحميل: إخفاء زر التحميل في المشغّل، ومنع القائمة السياقية (حفظ باسم) وصورة داخل صورة.
   تنبيه: لا يمكن منع التحميل منعًا مطلقًا في المتصفح؛ هذه حماية معقولة، والحماية الصارمة (بث مجزّأ برموز مؤقتة) من مهام الخادم. */
function protectMedia(root) {
  const list = root && root.matches && root.matches("audio,video") ? [root] : Array.from((root || document).querySelectorAll("audio,video"));
  list.forEach(el => {
    el.setAttribute("controlsList", "nodownload noremoteplayback");
    el.setAttribute("disablePictureInPicture", "");
    el.addEventListener("contextmenu", e => e.preventDefault());
  });
}
document.addEventListener("DOMContentLoaded", () => protectMedia(document));
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) protectMedia(n.matches && n.matches("audio,video") ? n : n); }))).observe(document.documentElement, { childList: true, subtree: true });
