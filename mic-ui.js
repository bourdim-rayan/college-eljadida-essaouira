/* ===================================================================
   mic-ui.js — إدارة الميكروفون التربوي: النشر للإدارة والأساتذة المكلَّفين فقط
   =================================================================== */
let MICU = null;

function micMediaHTML(url) {
  const m = parseMedia(url);
  if (!m) return "";
  if (m.kind === "youtube") return `<div class="media-box"><iframe src="https://www.youtube-nocookie.com/embed/${m.id}" title="فيديو" allowfullscreen loading="lazy" referrerpolicy="no-referrer"></iframe></div>`;
  if (m.kind === "audio") return `<div class="media-box"><audio controls controlsList="nodownload" oncontextmenu="return false" preload="none" src="${esc(m.url)}"></audio></div>`;
  if (m.kind === "video") return `<div class="media-box"><video controls controlsList="nodownload" disablePictureInPicture oncontextmenu="return false" preload="none" src="${esc(m.url)}"></video></div>`;
  return `<p><a class="btn btn-ghost btn-sm" href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">🔗 فتح الرابط</a></p>`;
}

/* وسائط المنشور: ملف مرفوع (mp3/mp4...) يُحمَّل من المخزن المحلي، أو رابط يوتيوب/ملف مباشر */
function micPostMediaHTML(p) {
  if (p.mediaId) {
    const tag = p.mediaKind === "video" ? "video" : "audio";
    return `<div class="media-box"><${tag} controls controlsList="nodownload" oncontextmenu="return false" preload="metadata" data-media-id="${esc(p.mediaId)}"></${tag}></div>`;
  }
  return micMediaHTML(p.mediaUrl);
}

function renderMic(user, boxId) {
  MICU = { user, boxId };
  DB = loadDB();
  const box = document.getElementById(boxId);
  const can = canPostMic(user), manage = hasPerm(user, "mic");
  const posts = DB.micPosts.filter(p => manage || p.authorId === user.id);
  box.innerHTML = `<div id="micMsg" style="display:none;"></div>` +
    (manage ? `<h4 style="margin:0 0 6px;font-size:14px;">الأساتذة المكلَّفون بالنشر</h4>
      <p style="color:var(--ink-600);font-size:13px;margin:0 0 8px;">النشر في الميكروفون التربوي مقصور على الإدارة والأساتذة الذين تكلّفهم هنا.</p>
      <div class="check-grid" id="micEditors" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));">${DB.teachers.map(t => `<label><input type="checkbox" value="${t.id}" ${DB.micEditors.includes(t.id) ? "checked" : ""}> ${esc(teacherName(t.id))}</label>`).join("")}</div>
      <button class="btn btn-primary btn-sm" type="button" style="margin:8px 0 18px;" onclick="saveMicEditors()">حفظ التكليف</button>` : "") +
    (can ? `<h4 style="margin:0 0 6px;font-size:14px;">نشر إنتاج جديد</h4>
      <form id="micForm" onsubmit="return submitMic(event)" novalidate>
        <div class="form-grid">
          <div class="field"><label for="micType">النوع</label><select id="micType">${MIC_TYPES.map(t => `<option>${esc(t)}</option>`).join("")}</select></div>
          <div class="field"><label for="micTitle">العنوان</label><input type="text" id="micTitle" maxlength="100"></div>
          <div class="field span2"><label for="micDesc">الوصف</label><textarea id="micDesc" maxlength="600" style="min-height:90px;"></textarea></div>
          <div class="field span2"><label for="micUrl">رابط الإنتاج (اختياري)</label><input type="url" id="micUrl" dir="ltr" placeholder="https://youtu.be/... أو رابط ملف mp3 / mp4"><small class="hint">يوتيوب أو ملف صوت/فيديو مباشر أو أي رابط https. بدون رابط يُنشر الوصف فقط.</small></div>
        </div>
        <div class="field span2"><label for="micFile">أو ارفع ملف صوت/فيديو من جهازك (mp3 أو mp4)</label>
          <input type="file" id="micFile" accept=".mp3,.m4a,.wav,.ogg,.mp4,.webm,audio/*,video/*">
          <small class="hint">بلا حد لحجم الملف (فيديو أو تسجيل طويل). يُشغَّل داخل الموقع فقط ولا يُتاح تحميله للزوار. يمكن الجمع بين ملف ورابط.</small></div>
        <button class="btn btn-primary btn-sm" type="submit" id="micSubmit">🎙️ نشر</button>
      </form>` : `<div class="alert alert-blue">لم تُكلَّف بالنشر في الميكروفون التربوي. تكلّف الإدارة الأساتذة الذين ينشرون فيه.</div>`) +
    `<h4 style="margin:20px 0 6px;font-size:14px;">${manage ? "كل المنشورات" : "منشوراتي"}</h4>` +
    (posts.length ? posts.map(p => `<div class="club-row"><div><b>${esc(p.title)}</b> <span class="badge badge-blue">${esc(p.type)}</span>
      <div style="font-size:12.5px;color:var(--ink-600);">${esc(p.authorName)} • ${esc(p.createdAt)} • ♥ ${p.likes.length} • 💬 ${p.comments.length}</div></div>
      <div class="actions"><a class="btn btn-ghost btn-sm" href="mic.html?id=${encodeURIComponent(p.id)}">عرض</a>
      <button class="btn btn-danger btn-sm" type="button" onclick="removeMic('${p.id}')">حذف</button></div></div>`).join("") : `<p class="empty-note">لا توجد منشورات.</p>`);
}
function micFlash(msg, ok) {
  const b = document.getElementById("micMsg"); if (!b) return;
  b.textContent = msg; b.className = ok ? "form-ok" : "form-error"; b.style.display = "block";
  if (ok) setTimeout(() => { b.style.display = "none"; }, 3500);
}
async function submitMic(e) {
  e.preventDefault();
  const g = id => document.getElementById(id).value;
  const file = document.getElementById("micFile").files[0];
  const btn = document.getElementById("micSubmit");
  let media = null;
  if (file) {
    const err = mediaCheck(file);
    if (err) { micFlash(err, false); return false; }
    btn.disabled = true; btn.textContent = "⏳ جارٍ رفع الملف...";
    try { media = await mediaPut(file); } catch (ex) { btn.disabled = false; btn.textContent = "🎙️ نشر"; micFlash(ex.message, false); return false; }
  }
  DB = loadDB();
  const r = saveMicPost(MICU.user, { type: g("micType"), title: g("micTitle"), description: g("micDesc"), mediaUrl: g("micUrl"),
    mediaId: media && media.id, mediaKind: media && media.kind, mediaName: media && media.name });
  if (!r.ok) { if (media) mediaDelete(media.id); btn.disabled = false; btn.textContent = "🎙️ نشر"; micFlash(r.error, false); return false; }
  renderMic(MICU.user, MICU.boxId);
  micFlash("تم النشر في الميكروفون التربوي.", true);
  return false;
}
function removeMic(id) {
  if (!confirm("حذف هذا المنشور؟")) return;
  const r = deleteMicPost(MICU.user, id);
  if (!r.ok) { micFlash(r.error, false); return; }
  renderMic(MICU.user, MICU.boxId);
}
function saveMicEditors() {
  const ids = Array.from(document.querySelectorAll("#micEditors input:checked")).map(i => i.value);
  const r = setMicEditors(MICU.user, ids);
  if (!r.ok) { micFlash(r.error, false); return; }
  renderMic(MICU.user, MICU.boxId);
  micFlash("تم تحديث الأساتذة المكلَّفين بالنشر.", true);
}
