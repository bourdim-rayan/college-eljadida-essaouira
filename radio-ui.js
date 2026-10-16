/* ===================================================================
   radio-ui.js — الإذاعة المدرسية: بث اللقاءات والندوات على المباشر.
   - البث المباشر عبر رابط بث (يوتيوب المباشر أو بث صوتي/مرئي https) يضعه المكلَّف.
   - التسجيل من الميكروفون داخل المتصفح ثم حفظه أرشيفًا للبث.
   - المدير يكلّف الأساتذة (والإدارة بصلاحية «الإذاعة»).
   المرحلة الأولى بلا خادم: البث الحي نفسه تؤمّنه المنصة الخارجية (يوتيوب...)،
   أما البث الصوتي المباشر من الموقع نفسه فيحتاج خادمًا في المرحلة الثانية.
   =================================================================== */
let RU = null;

function radioPlayerHTML(url, autoplay) {
  const m = parseMedia(url);
  if (!m) return "";
  if (m.kind === "youtube") return `<div class="media-box"><iframe src="https://www.youtube-nocookie.com/embed/${m.id}${autoplay ? "?autoplay=1" : ""}" title="البث" allow="autoplay; encrypted-media" allowfullscreen loading="lazy"></iframe></div>`;
  if (m.kind === "audio") return `<div class="media-box"><audio controls controlsList="nodownload" oncontextmenu="return false" preload="none" src="${esc(m.url)}"></audio></div>`;
  if (m.kind === "video") return `<div class="media-box"><video controls controlsList="nodownload" disablePictureInPicture oncontextmenu="return false" preload="none" src="${esc(m.url)}"></video></div>`;
  return `<p><a class="btn btn-primary" href="${esc(m.url)}" target="_blank" rel="noopener noreferrer">🔗 الانضمام إلى البث</a></p>`;
}
function broadcastRecordingHTML(b) {
  if (b.recordingMediaId) {
    const tag = b.recordingKind === "video" ? "video" : "audio";
    return `<div class="media-box"><${tag} controls controlsList="nodownload" oncontextmenu="return false" preload="metadata" data-media-id="${esc(b.recordingMediaId)}"></${tag}></div>`;
  }
  return b.recordingUrl ? radioPlayerHTML(b.recordingUrl, false) : "";
}
function fmtWhen(iso) { return String(iso || "").replace("T", " "); }
const BR_LABEL = { scheduled: ["مبرمج", "badge-blue"], live: ["🔴 مباشر الآن", "badge-red"], ended: ["انتهى", "badge-green"] };

/* ---------- لوحة التحكم (المدير / الإدارة المخوَّلة / الأستاذ المكلَّف) ---------- */
function renderRadioManager(user, boxId) {
  RU = { user, boxId };
  DB = loadDB();
  const box = document.getElementById(boxId);
  const isDirector = user.role === "admin", all = hasPerm(user, "radio");
  const list = DB.broadcasts.filter(b => all || b.hostId === user.id);
  box.innerHTML = `<div id="radioMsg" style="display:none;"></div><div id="liveConsole"></div>` +
    (isDirector ? `<h4 style="margin:0 0 6px;font-size:14px;">الأساتذة المكلَّفون بالبث</h4>
      <p style="color:var(--ink-600);font-size:13px;margin:0 0 8px;">أنت وحدك تكلّف الأساتذة بالبث في الإذاعة المدرسية. أما أعضاء الإدارة فيُكلَّفون بمنحهم صلاحية «الإذاعة المدرسية» من قسم «فريق الإدارة».</p>
      <div class="check-grid" id="radioEditors" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));">${DB.teachers.map(t => `<label><input type="checkbox" value="${t.id}" ${(DB.radioEditors || []).includes(t.id) ? "checked" : ""}> ${esc(teacherName(t.id))}</label>`).join("")}</div>
      <button class="btn btn-primary btn-sm" type="button" style="margin:8px 0 18px;" onclick="saveRadioEditors()">حفظ التكليف</button>` : "") +
    `<h4 style="margin:0 0 6px;font-size:14px;" id="brFormTitle">برمجة بث جديد</h4>
    <form id="brForm" onsubmit="return submitBroadcast(event)" novalidate>
      <input type="hidden" id="brId" value="">
      <div class="form-grid">
        <div class="field"><label for="brType">النوع</label><select id="brType">${RADIO_TYPES.map(t => `<option>${esc(t)}</option>`).join("")}</select></div>
        <div class="field"><label for="brWhen">موعد البث</label><input type="datetime-local" id="brWhen" dir="ltr"></div>
        <div class="field span2"><label for="brTitle">العنوان</label><input type="text" id="brTitle" maxlength="120"></div>
        <div class="field span2"><label for="brDesc">الوصف</label><textarea id="brDesc" maxlength="600" style="min-height:80px;"></textarea></div>
        <div class="field"><label for="brGuests">الضيوف / المتدخلون (اختياري)</label><input type="text" id="brGuests" maxlength="120"></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" type="submit" id="brSubmit">برمجة البث</button>
        <button class="btn btn-ghost btn-sm" type="button" id="brCancel" style="display:none;" onclick="resetBroadcastForm()">إلغاء التعديل</button>
      </div>
    </form>
    <h4 style="margin:22px 0 6px;font-size:14px;">${all ? "كل البثوث" : "بثوثي"}</h4>` +
    (list.length ? list.map(b => {
      const st = BR_LABEL[b.status];
      return `<div class="club-row" style="align-items:flex-start;flex-direction:column;gap:8px;"><div style="width:100%;">
        <b>${esc(b.title)}</b> <span class="badge badge-blue">${esc(b.type)}</span> <span class="badge ${st[1]}">${st[0]}</span>
        <div style="font-size:12.5px;color:var(--ink-600);">${esc(fmtWhen(b.scheduledAt))} • ${esc(b.hostName)}${b.guests ? " • " + esc(b.guests) : ""}${b.recordingMediaId || b.recordingUrl ? " • 🎞️ له تسجيل" : ""}</div></div>
        <div class="actions" style="flex-wrap:wrap;">
          ${b.status === "scheduled" ? `<button class="btn btn-primary btn-sm" type="button" onclick="openLiveStart('${b.id}')">▶ بدء البث المباشر</button>` : ""}
          ${b.status === "live" ? `<button class="btn btn-danger btn-sm" type="button" onclick="${LIVE && LIVE.id === b.id ? "endLive()" : "bcStatus('" + b.id + "','ended')"}">⏹ إنهاء البث</button>` : ""}
          ${b.status === "ended" ? `<button class="btn btn-ghost btn-sm" type="button" onclick="bcStatus('${b.id}','scheduled')">↺ إعادة البرمجة</button>` : ""}
          <button class="btn btn-ghost btn-sm" type="button" onclick="editBroadcast('${b.id}')">تعديل</button>
          <button class="btn btn-ghost btn-sm" type="button" onclick="toggleRecTools('${b.id}')">🎞️ التسجيل</button>
          <button class="btn btn-danger btn-sm" type="button" onclick="removeBroadcast('${b.id}')">حذف</button>
        </div>
        <div id="rec-${b.id}" style="display:none;width:100%;border-top:1px dashed var(--line);padding-top:8px;"></div></div>`;
    }).join("") : `<p class="empty-note">لا توجد بثوث بعد.</p>`);
  paintConsole();
  const w = document.getElementById("brWhen"); if (w && !w.value) w.value = new Date(Date.now() + 86400000).toISOString().slice(0, 11) + "10:00";
}
function radioFlash(msg, ok) {
  const b = document.getElementById("radioMsg"); if (!b) return;
  b.textContent = msg; b.className = ok ? "form-ok" : "form-error"; b.style.display = "block";
  if (ok) setTimeout(() => { b.style.display = "none"; }, 3500);
}
function saveRadioEditors() {
  const ids = Array.from(document.querySelectorAll("#radioEditors input:checked")).map(i => i.value);
  const r = setRadioEditors(RU.user, ids);
  if (!r.ok) { radioFlash(r.error, false); return; }
  renderRadioManager(RU.user, RU.boxId); radioFlash("تم تحديث الأساتذة المكلَّفين بالبث.", true);
}
function submitBroadcast(e) {
  e.preventDefault();
  const g = id => document.getElementById(id).value;
  DB = loadDB();
  const r = saveBroadcast(RU.user, { id: g("brId") || null, type: g("brType"), title: g("brTitle"), description: g("brDesc"), guests: g("brGuests"), scheduledAt: g("brWhen") });
  if (!r.ok) { radioFlash(r.error, false); return false; }
  renderRadioManager(RU.user, RU.boxId); radioFlash("تم حفظ البث.", true);
  return false;
}
function editBroadcast(id) {
  const b = DB.broadcasts.find(x => x.id === id); if (!b) return;
  const s = (i, v) => { document.getElementById(i).value = v; };
  s("brId", b.id); s("brType", b.type); s("brWhen", b.scheduledAt); s("brTitle", b.title); s("brDesc", b.description); s("brGuests", b.guests);
  document.getElementById("brFormTitle").textContent = "تعديل البث";
  document.getElementById("brSubmit").textContent = "حفظ التعديلات";
  document.getElementById("brCancel").style.display = "inline-flex";
  document.getElementById("brForm").scrollIntoView({ behavior: "smooth", block: "center" });
}
function resetBroadcastForm() { renderRadioManager(RU.user, RU.boxId); }
function bcStatus(id, st) {
  DB = loadDB();
  const r = setBroadcastStatus(RU.user, id, st);
  if (!r.ok) { radioFlash(r.error, false); return; }
  renderRadioManager(RU.user, RU.boxId);
  radioFlash( st === "ended" ? "انتهى البث. يمكنك إضافة تسجيل له." : "أُعيدت برمجة البث.", true);
}
function removeBroadcast(id) {
  if (!confirm("حذف هذا البث وتسجيله؟")) return;
  DB = loadDB();
  const r = deleteBroadcast(RU.user, id);
  if (!r.ok) { radioFlash(r.error, false); return; }
  renderRadioManager(RU.user, RU.boxId);
}

/* ---------- تسجيل البث: رفع ملف أو تسجيل من الميكروفون أو رابط ---------- */
let REC = null;   // { rec, chunks, stream, id }
function toggleRecTools(id) {
  const el = document.getElementById("rec-" + id);
  if (el.style.display !== "none") { el.style.display = "none"; return; }
  el.style.display = "block";
  el.innerHTML = `<div class="form-grid">
      <div class="field"><label>ارفع تسجيلًا (mp3 / mp4)</label><input type="file" id="recFile-${id}" accept=".mp3,.m4a,.wav,.ogg,.mp4,.webm,audio/*,video/*"></div>
      <div class="field"><label>أو رابط تسجيل</label><input type="url" id="recUrl-${id}" dir="ltr" placeholder="https://..."></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <button class="btn btn-primary btn-sm" type="button" onclick="saveRecording('${id}')">حفظ التسجيل</button>
      <button class="btn btn-ghost btn-sm" type="button" id="recBtn-${id}" onclick="toggleMicRecord('${id}')">🎙️ تسجيل من الميكروفون</button>
      <span id="recState-${id}" style="font-size:13px;color:var(--danger);"></span>
    </div>`;
}
async function saveRecording(id) {
  DB = loadDB();
  const file = document.getElementById("recFile-" + id).files[0], url = document.getElementById("recUrl-" + id).value.trim();
  if (!file && !url) { radioFlash("اختر ملفًا أو ضع رابطًا.", false); return; }
  if (file) {
    const err = mediaCheck(file); if (err) { radioFlash(err, false); return; }
    try { const m = await mediaPut(file); const r = setBroadcastRecording(RU.user, id, { mediaId: m.id, kind: m.kind }); if (!r.ok) { mediaDelete(m.id); radioFlash(r.error, false); return; } }
    catch (ex) { radioFlash(ex.message, false); return; }
  } else {
    const r = setBroadcastRecording(RU.user, id, { url }); if (!r.ok) { radioFlash(r.error, false); return; }
  }
  renderRadioManager(RU.user, RU.boxId); radioFlash("تم حفظ تسجيل البث.", true);
}
async function toggleMicRecord(id) {
  const state = document.getElementById("recState-" + id), btn = document.getElementById("recBtn-" + id);
  if (REC && REC.id === id) { REC.rec.stop(); return; }   // الإيقاف يُكمل الحفظ في onstop
  if (!navigator.mediaDevices || !window.MediaRecorder) { radioFlash("متصفحك لا يدعم التسجيل من الميكروفون.", false); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream), chunks = [];
    REC = { rec, id, stream };
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop()); REC = null;
      const type = rec.mimeType || "audio/webm";
      const file = new File([new Blob(chunks, { type })], "تسجيل-" + id + (/ogg/.test(type) ? ".ogg" : ".webm"), { type: type.split(";")[0] });
      try {
        DB = loadDB();
        const m = await mediaPut(file);
        const r = setBroadcastRecording(RU.user, id, { mediaId: m.id, kind: m.kind });
        if (!r.ok) { mediaDelete(m.id); radioFlash(r.error, false); return; }
        renderRadioManager(RU.user, RU.boxId); radioFlash("تم حفظ التسجيل الصوتي للبث.", true);
      } catch (ex) { radioFlash(ex.message, false); }
    };
    rec.start();
    btn.textContent = "⏹ إيقاف وحفظ"; state.textContent = "● جارٍ التسجيل...";
  } catch (ex) { radioFlash("تعذّر الوصول إلى الميكروفون (تحقق من الإذن).", false); }
}

/* ---------- وحدة البث المباشر (المذيع) ---------- */
let LIVE = null, LIVE_TIMER = null;   // LIVE = { id, host:RadioHost, since, listeners }
function openLiveStart(id) {
  if (LIVE) { radioFlash("لديك بث مباشر جارٍ.", false); return; }
  const b = DB.broadcasts.find(x => x.id === id); if (!b) return;
  const c = document.getElementById("liveConsole");
  c.innerHTML = `<div class="panel" style="border:2px solid var(--blue-600);margin-bottom:14px;">
    <div class="panel-head"><h3>🎙️ بدء البث المباشر: ${esc(b.title)}</h3></div>
    <p style="font-size:13.5px;color:var(--ink-600);margin:0 0 10px;">سيُلتقط صوت ميكروفون هذا الجهاز ويُبث فورًا لكل من يستمع في صفحة الإذاعة. تأكد من وصل الميكروفون ومن السماح للمتصفح باستعماله. اطلب «رمز الإذاعة» من المدير (يظهر في نافذة تشغيل الخادم).</p>
    <div class="form-grid"><div class="field"><label for="livePin">رمز الإذاعة</label><input type="password" id="livePin" autocomplete="off" dir="ltr" style="text-align:right;"></div>
      <div class="field"><label>&nbsp;</label><label style="font-weight:500;display:flex;gap:6px;align-items:center;"><input type="checkbox" id="liveRec" checked style="width:auto;"> حفظ تسجيل للبث في الأرشيف</label></div></div>
    <div style="display:flex;gap:8px;"><button class="btn btn-primary btn-sm" type="button" id="goLiveBtn" onclick="goLive('${id}')">🔴 ابدأ الآن</button>
      <button class="btn btn-ghost btn-sm" type="button" onclick="document.getElementById('liveConsole').innerHTML=''">إلغاء</button></div></div>`;
  c.scrollIntoView({ behavior: "smooth", block: "center" });
}
async function goLive(id) {
  const b = DB.broadcasts.find(x => x.id === id);
  const btn = document.getElementById("goLiveBtn"); btn.disabled = true; btn.textContent = "⏳ جارٍ الاتصال...";
  const host = new RadioHost();
  try {
    await host.start({ pin: document.getElementById("livePin").value, title: b.title, host: RU.user.fullName, record: document.getElementById("liveRec").checked }, st => {
      if (!LIVE) return;
      if (st.listeners != null) LIVE.listeners = st.listeners;
      if (st.state === "ended" && LIVE) { finishLive(true); }
    });
  } catch (ex) { btn.disabled = false; btn.textContent = "🔴 ابدأ الآن"; radioFlash(ex.message, false); return; }
  DB = loadDB();
  const r = setBroadcastStatus(RU.user, id, "live");
  if (!r.ok) { host.stop(); radioFlash(r.error, false); return; }
  LIVE = { id, host, since: Date.now(), listeners: 0 };
  renderRadioManager(RU.user, RU.boxId);
  radioFlash("أنت على الهواء الآن. المستمعون في صفحة الإذاعة يسمعونك مباشرة.", true);
}
function paintConsole() {
  const c = document.getElementById("liveConsole");
  if (!c || !LIVE) return;
  const b = DB.broadcasts.find(x => x.id === LIVE.id);
  c.innerHTML = `<div class="panel" style="border:2px solid var(--danger);margin-bottom:14px;">
    <div class="panel-head"><h3>🔴 على الهواء: ${esc(b ? b.title : "")}</h3><span class="badge badge-red" id="liveTimer">00:00</span></div>
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
      <div style="flex:1 1 220px;"><small>مستوى الصوت</small><div style="height:12px;background:var(--line);border-radius:99px;overflow:hidden;"><div id="liveLevel" style="height:100%;width:0;background:var(--success);transition:width .08s;"></div></div></div>
      <div>👥 المستمعون: <b id="liveListeners">0</b></div>
      <button class="btn btn-danger" type="button" onclick="endLive()">⏹ إنهاء البث</button></div></div>`;
  clearInterval(LIVE_TIMER);
  LIVE_TIMER = setInterval(() => {
    if (!LIVE) { clearInterval(LIVE_TIMER); return; }
    const t = Math.floor((Date.now() - LIVE.since) / 1000), el = document.getElementById("liveTimer");
    if (el) el.textContent = String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0");
    const lv = document.getElementById("liveLevel"); if (lv) lv.style.width = Math.min(100, Math.round(LIVE.host.level * 160)) + "%";
    const ln = document.getElementById("liveListeners"); if (ln) ln.textContent = LIVE.listeners;
  }, 200);
}
async function endLive() { await finishLive(false); }
async function finishLive(fromServer) {
  if (!LIVE) return;
  const cur = LIVE; LIVE = null; clearInterval(LIVE_TIMER);
  const file = await cur.host.stop();
  DB = loadDB();
  setBroadcastStatus(RU.user, cur.id, "ended");
  if (file) {
    try { const m = await mediaPut(file); setBroadcastRecording(RU.user, cur.id, { mediaId: m.id, kind: m.kind }); } catch (e) { /* مساحة غير كافية */ }
  }
  renderRadioManager(RU.user, RU.boxId);
  radioFlash(fromServer ? "انقطع الاتصال بالخادم فانتهى البث." : "انتهى البث" + (file ? " وحُفظ تسجيله في الأرشيف." : "."), true);
}
window.addEventListener("beforeunload", () => { if (LIVE) { try { LIVE.host.stop(); } catch (e) {} } });
