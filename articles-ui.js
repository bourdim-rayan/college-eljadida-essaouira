/* ===================================================================
   articles-ui.js — محرر المقالات، مقالاتي، لوحة المراجعة، وإدارة كل المقالات
   (مشتركة بين التلميذ والأستاذ والمدير). كل نص يمر عبر esc() قبل العرض.
   =================================================================== */

function paragraphsHTML(text) {
  return String(text || "").split(/\n+/).filter(p => p.trim()).map(p => `<p>${esc(p)}</p>`).join("");
}
const ART_STATUS = { pending: ["قيد المراجعة", "badge-yellow"], published: ["منشور", "badge-green"], revision: ["يحتاج تعديلاً", "badge-red"] };

function artFlash(boxId, msg, ok) {
  const box = document.getElementById(boxId);
  if (!box) return;
  box.textContent = msg;
  box.className = ok ? "form-ok" : "form-error";
  box.style.display = "block";
  if (ok) setTimeout(() => { box.style.display = "none"; }, 4000);
}

/* سياق الصفحة: المستخدم + دالة إعادة الرسم + مُعرّفات العناصر */
let ART = { user: null, refresh: function () {}, msgId: "artMsg", editorBox: "editorBox", myBox: "myArticlesBox", reviewBox: "reviewBox", allBox: "allArticlesBox" };

function initArticleTools(user, opts) {
  ART = Object.assign(ART, { user }, opts || {});
  refreshArticles();
}
function refreshArticles() {
  DB = loadDB();
  renderArticleEditor();
  if (document.getElementById(ART.myBox)) renderMyArticles();
  if (document.getElementById(ART.reviewBox)) renderReviewPanel();
  if (document.getElementById(ART.allBox)) renderAllArticles();
  ART.refresh();
}

/* ---------- المحرر ---------- */
let ART_IMGS = [];

function renderArticleEditor(article) {
  const box = document.getElementById(ART.editorBox);
  if (!box) return;
  const a = article || null;
  ART_IMGS = a ? (a.images || []).map(i => ({ name: i.name, dataUrl: i.dataUrl })) : [];
  const isOther = a && !ARTICLE_CATEGORIES.includes(a.category);
  const direct = ART.user.role !== "student";
  box.innerHTML = `
    <form id="artForm" onsubmit="return submitArticle(event)" novalidate>
      <input type="hidden" id="artId" value="${a ? esc(a.id) : ""}">
      <div class="form-grid">
        <div class="field span2"><label for="artTitle">عنوان المقال</label><input type="text" id="artTitle" maxlength="120" value="${a ? esc(a.title) : ""}" placeholder="عنوان واضح وجذاب"></div>
        <div class="field"><label for="artCat">التصنيف</label><select id="artCat" onchange="toggleOther()">${ARTICLE_CATEGORIES.map(c => `<option ${(a && a.category === c) || (isOther && c === "أخرى") ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></div>
        <div class="field" id="artOtherWrap" style="display:${isOther ? "block" : "none"};"><label for="artOther">حدّد المجال</label><input type="text" id="artOther" maxlength="30" value="${isOther ? esc(a.category) : ""}" placeholder="مثال: سينما، تكنولوجيا…"></div>
        <div class="field span2"><label for="artContent">نص المقال <small id="artCount" style="color:var(--ink-600);"></small></label><textarea id="artContent" maxlength="8000" style="min-height:170px;" oninput="countArt()" placeholder="اكتب مقالك هنا. اترك سطرًا فارغًا بين الفقرات.">${a ? esc(a.content) : ""}</textarea></div>
      </div>
      <div class="field"><label for="artImgInput">صور المقال (اختياري، حتى 3 صور)</label>
        <input type="file" id="artImgInput" accept="image/png,image/jpeg,image/webp" multiple onchange="addArticleImages(this)">
        <div class="img-previews" id="artPreviews"></div></div>
      <p style="font-size:12.5px;color:var(--ink-600);margin:0 0 10px;">${direct ? "سيُنشر المقال مباشرة في المجلة." : "سيُرسل المقال إلى الأستاذ(ة) المشرف(ة) للمراجعة قبل النشر."}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" type="submit">${a ? "حفظ التعديلات" : (direct ? "نشر المقال" : "إرسال للمراجعة")}</button>
        ${a ? `<button class="btn btn-ghost btn-sm" type="button" onclick="renderArticleEditor()">إلغاء التعديل</button>` : ""}
      </div>
    </form>`;
  countArt();
  drawPreviews();
}
function toggleOther() {
  document.getElementById("artOtherWrap").style.display = document.getElementById("artCat").value === "أخرى" ? "block" : "none";
}
function drawPreviews() {
  const box = document.getElementById("artPreviews");
  if (!box) return;
  box.innerHTML = ART_IMGS.map((im, i) => `<div class="pv"><img alt="" src="${im.dataUrl}"><button type="button" aria-label="إزالة" onclick="removeArtImg(${i})">×</button></div>`).join("");
}
function removeArtImg(i) { ART_IMGS.splice(i, 1); drawPreviews(); }

/* تصغير الصورة في المتصفح (حد أقصى 1000px، JPEG) لتوفير مساحة التخزين */
function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return reject(new Error("صيغة غير مدعومة: " + file.name));
    if (file.size > 8 * 1024 * 1024) return reject(new Error("الصورة كبيرة جدًا: " + file.name));
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1000 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve({ name: file.name, dataUrl: c.toDataURL("image/jpeg", 0.78) });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("تعذرت قراءة الصورة: " + file.name)); };
    img.src = url;
  });
}
async function addArticleImages(input) {
  const files = Array.from(input.files || []);
  input.value = "";
  for (const f of files) {
    if (ART_IMGS.length >= 3) { artFlash(ART.msgId, "الحد الأقصى 3 صور لكل مقال.", false); break; }
    try { ART_IMGS.push(await shrinkImage(f)); } catch (e) { artFlash(ART.msgId, e.message, false); }
  }
  drawPreviews();
}
function countArt() {
  const t = document.getElementById("artContent"), c = document.getElementById("artCount");
  if (t && c) c.textContent = "(" + t.value.length + " / 8000)";
}
function submitArticle(e) {
  e.preventDefault();
  DB = loadDB();
  const res = saveArticle(ART.user, {
    id: document.getElementById("artId").value || null,
    title: document.getElementById("artTitle").value,
    category: document.getElementById("artCat").value,
    customCategory: document.getElementById("artOther").value,
    images: ART_IMGS,
    content: document.getElementById("artContent").value,
  });
  if (!res.ok) { artFlash(ART.msgId, res.error, false); return false; }
  refreshArticles();
  artFlash(ART.msgId, res.status === "published" ? "تم نشر المقال في المجلة." : "تم إرسال المقال للمراجعة. ستجد حالته في «مقالاتي».", true);
  return false;
}
function editArticle(id) {
  DB = loadDB();
  const a = DB.articles.find(x => x.id === id);
  if (!a) return;
  renderArticleEditor(a);
  document.getElementById(ART.editorBox).scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ---------- مقالاتي ---------- */
function renderMyArticles() {
  const box = document.getElementById(ART.myBox);
  const mine = DB.articles.filter(a => a.authorId === ART.user.id).slice().reverse();
  box.innerHTML = mine.length ? mine.map(a => {
    const [label, cls] = ART_STATUS[a.status] || ["—", "badge-blue"];
    return `<div class="club-row">
      <div><b>${esc(a.title)}</b> <span class="badge ${cls}">${label}</span>
        <div style="font-size:12.5px;color:var(--ink-600);">${esc(a.category)} • ${esc(a.createdAt)}</div>
        ${a.status === "revision" && a.reviewNote ? `<div class="form-error" style="display:block;margin-top:6px;">ملاحظات المراجع: ${esc(a.reviewNote)}</div>` : ""}
      </div>
      <div class="actions">
        <a class="btn btn-ghost btn-sm" href="article.html?id=${encodeURIComponent(a.id)}">عرض</a>
        <button class="btn btn-ghost btn-sm" type="button" onclick="editArticle('${a.id}')">تعديل</button>
        ${a.status !== "published" ? `<button class="btn btn-danger btn-sm" type="button" onclick="removeArticle('${a.id}')">حذف</button>` : ""}
      </div></div>`;
  }).join("") : `<p class="empty-note">لم تكتب أي مقال بعد.</p>`;
}
function removeArticle(id) {
  if (!confirm("حذف هذا المقال نهائيًا؟")) return;
  const r = deleteArticle(ART.user, id);
  if (!r.ok) { artFlash(ART.msgId, r.error, false); return; }
  refreshArticles();
}

/* ---------- المراجعة (أستاذ / مدير) ---------- */
function renderReviewPanel() {
  const box = document.getElementById(ART.reviewBox);
  const pending = DB.articles.filter(a => a.status === "pending");
  const badge = document.getElementById("artPendingBadge");
  if (badge) badge.textContent = pending.length + " قيد المراجعة";
  box.innerHTML = pending.length ? pending.map(a => `
    <div class="req-card">
      <div class="req-head"><b>${esc(a.title)}</b><span class="badge badge-yellow">قيد المراجعة</span></div>
      <div style="font-size:12.5px;color:var(--ink-600);margin-bottom:6px;">${esc(a.category)} • بقلم ${esc(a.authorName)} • ${esc(a.createdAt)}</div>
      <details><summary style="cursor:pointer;color:var(--blue-600);font-weight:700;font-size:13.5px;">قراءة المقال</summary><div class="article-body" style="margin-top:8px;">${paragraphsHTML(a.content)}</div></details>
      <div class="req-actions">
        <button class="btn btn-primary btn-sm" type="button" onclick="reviewArt('${a.id}','published')">✔ نشر</button>
        <input type="text" id="note-${a.id}" placeholder="ملاحظات التعديل (إلزامية عند الطلب)">
        <button class="btn btn-ghost btn-sm" type="button" onclick="reviewArt('${a.id}','revision')">↩ طلب تعديل</button>
      </div></div>`).join("") : `<p class="empty-note">لا توجد مقالات بانتظار المراجعة.</p>`;
}
function reviewArt(id, decision) {
  const note = (document.getElementById("note-" + id) || {}).value;
  const r = reviewArticle(ART.user, id, decision, note);
  if (!r.ok) { artFlash(ART.msgId, r.error, false); return; }
  refreshArticles();
  artFlash(ART.msgId, decision === "published" ? "تم نشر المقال وهو ظاهر الآن في المجلة." : "أُعيد المقال للتلميذ مع ملاحظاتك.", true);
}

/* ---------- كل المقالات (مدير) ---------- */
function renderAllArticles() {
  const box = document.getElementById(ART.allBox);
  const list = DB.articles.slice().reverse();
  box.innerHTML = list.length ? `<table class="data-table"><thead><tr><th>العنوان</th><th>الكاتب</th><th>الحالة</th><th></th></tr></thead><tbody>` +
    list.map(a => {
      const [label, cls] = ART_STATUS[a.status] || ["—", "badge-blue"];
      return `<tr><td>${esc(a.title)}${a.isArticleOfMonth ? ' <span class="badge badge-yellow">مقال الشهر</span>' : ""}</td><td>${esc(a.authorName)}</td>
        <td><span class="badge ${cls}">${label}</span></td>
        <td style="white-space:nowrap;"><a class="btn btn-ghost btn-sm" href="article.html?id=${encodeURIComponent(a.id)}">عرض</a>
        ${a.status === "published" ? `<button class="btn btn-ghost btn-sm" type="button" onclick="toggleMonth('${a.id}',${!a.isArticleOfMonth})">${a.isArticleOfMonth ? "إلغاء مقال الشهر" : "★ مقال الشهر"}</button>` : ""}
        <button class="btn btn-danger btn-sm" type="button" onclick="removeArticle('${a.id}')">حذف</button></td></tr>`;
    }).join("") + `</tbody></table>` : `<p class="empty-note">لا توجد مقالات.</p>`;
}
function toggleMonth(id, v) {
  const r = setArticleOfMonth(ART.user, id, v);
  if (!r.ok) { artFlash(ART.msgId, r.error, false); return; }
  refreshArticles();
}
