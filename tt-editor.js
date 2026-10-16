/* ===================================================================
   tt-editor.js — تحرير جدول الحصص مباشرة داخل الجدول المدرسي.
   النقر على خانة فارغة (يوم × ساعة) يفتح نافذة صغيرة لإضافة الحصة،
   والنقر على حصة قائمة يتيح تعديلها أو حذفها. يعمل لجداول الأقسام ولجداول الأساتذة،
   وكذلك على «مسودة» أثناء إنشاء حساب أستاذ جديد (بدون حفظ حتى إتمام الإنشاء).

   ttEditable(host, ad) حيث ad = {
     kind: "class" | "teacher", name,
     list()            → الحصص المعروضة
     classes()         → الأقسام المتاحة (لجدول الأستاذ)
     teachers()        → [{id,name,subject}] (لجدول القسم)
     fixedTeacher      → {id,name,subject} (لجدول الأستاذ)
     fixedClass        → اسم القسم (لجدول القسم)
     save(oldId, data) → {ok,error}
     remove(id)
     onChange()
   }
   =================================================================== */
function ttEditable(host, ad) {
  const slots = ad.list();
  host.innerHTML = `<div class="tt-hint">👆 انقر على أي خانة فارغة لإضافة حصة، أو على حصة موجودة لتعديلها أو حذفها.</div>`
    + timetableHTML(slots, { kind: ad.kind, name: ad.name, edit: true });
  const open = (day, h, id) => ttOpenEditor(ad, slots.find(s => s.id === id) || null, day, h);
  host.querySelectorAll("td.tt-edit").forEach(td => {
    const go = () => open(td.dataset.day, td.dataset.h ? Number(td.dataset.h) : null, td.dataset.id || null);
    td.addEventListener("click", go);
    td.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });
  host.querySelectorAll(".tt-edit-extra").forEach(b => b.addEventListener("click", () => open(null, null, b.dataset.id)));
}

function ttOpenEditor(ad, slot, day, hour) {
  let m = document.getElementById("ttEditor");
  if (!m) {
    m = document.createElement("div");
    m.id = "ttEditor"; m.className = "tt-editor"; m.hidden = true;
    m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true");
    document.body.appendChild(m);
  }
  const pad = n => String(n).padStart(2, "0") + ":00";
  const startV = slot ? slot.start : pad(hour);
  const endV = slot ? slot.end : pad(Math.min(hour + 1, 18));
  const dayV = slot ? slot.day : day;
  const exact = v => HOURS.includes(v) ? "" : `<option value="${esc(v)}" selected>${esc(v)}</option>`;
  const opts = (sel) => exact(sel) + hourOptions(sel);
  const teacherSel = ad.kind === "class"
    ? `<div class="field"><label for="teTeacher">الأستاذ(ة)</label><select id="teTeacher"><option value="">— بدون أستاذ مسجَّل —</option>${ad.teachers().map(t => `<option value="${esc(t.id)}" ${slot && slot.teacherId === t.id ? "selected" : ""}>${esc(t.name)}${t.subject ? " (" + esc(t.subject) + ")" : ""}</option>`).join("")}</select></div>`
    : `<div class="field"><label for="teClass">القسم</label><select id="teClass">${ad.classes().map(c => `<option ${slot && slot.classroom === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></div>`;
  const defSubject = slot ? slot.subject : (ad.kind === "teacher" && ad.fixedTeacher ? (ad.fixedTeacher.subject || "") : "");
  m.innerHTML = `<div class="box">
    <h3>${slot ? "تعديل الحصة" : "إضافة حصة"}</h3>
    <div class="sub">${ad.kind === "class" ? "القسم " + esc(ad.name) : esc(ad.name)}</div>
    <div class="form-error" id="teErr" style="display:none;"></div>
    <div class="form-grid">
      <div class="field"><label for="teDay">اليوم</label><select id="teDay">${DAYS.map(d => `<option ${d === dayV ? "selected" : ""}>${d}</option>`).join("")}</select></div>
      ${teacherSel}
      <div class="field"><label for="teStart">من</label><select id="teStart">${opts(startV)}</select></div>
      <div class="field"><label for="teEnd">إلى</label><select id="teEnd">${opts(endV)}</select></div>
      <div class="field"><label for="teSubject">المادة</label><input type="text" id="teSubject" value="${esc(defSubject)}" maxlength="60"></div>
      <div class="field"><label for="teRoom">القاعة</label><input type="text" id="teRoom" value="${esc(slot ? slot.room : "")}" maxlength="40" placeholder="قاعة 4"></div>
    </div>
    <div class="btns">
      <button type="button" class="btn btn-primary" id="teSave">${slot ? "حفظ التعديل" : "إضافة الحصة"}</button>
      ${slot ? `<button type="button" class="btn btn-danger" id="teDel">حذف الحصة</button>` : ""}
      <button type="button" class="btn btn-ghost" id="teCancel">إلغاء</button>
    </div></div>`;
  m.hidden = false;
  const close = () => { m.hidden = true; m.innerHTML = ""; document.removeEventListener("keydown", onKey); };
  const onKey = e => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  m.onclick = e => { if (e.target === m) close(); };
  const $ = id => document.getElementById(id);
  if (ad.kind === "class") {
    $("teTeacher").addEventListener("change", () => {
      const t = ad.teachers().find(x => x.id === $("teTeacher").value);
      if (t && t.subject && !$("teSubject").value.trim()) $("teSubject").value = t.subject;
    });
  }
  $("teCancel").onclick = close;
  if (slot) $("teDel").onclick = () => { ad.remove(slot.id); close(); ad.onChange(); };
  $("teSave").onclick = () => {
    const data = {
      day: $("teDay").value, start: $("teStart").value, end: $("teEnd").value,
      subject: $("teSubject").value, room: $("teRoom").value,
    };
    if (ad.kind === "class") { data.classroom = ad.fixedClass; data.teacherId = $("teTeacher").value || null; }
    else { data.classroom = $("teClass").value; data.teacherId = ad.fixedTeacher ? ad.fixedTeacher.id : null; }
    const r = ad.save(slot ? slot.id : null, data);
    if (!r.ok) { const b = $("teErr"); b.textContent = r.error; b.style.display = "block"; return; }
    close(); ad.onChange();
  };
  setTimeout(() => { const f = document.getElementById("teSubject"); if (f) f.focus(); }, 30);
}
