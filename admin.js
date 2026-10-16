/* ===================================================================
   admin.js - منطق لوحة المدير: طلبات التلاميذ، الأندية، الأساتذة
   =================================================================== */

const CLUB_ICONS = ["🎭", "✍️", "🎨", "🔬", "⚽", "🏀", "🎵", "📚", "🌱", "♟️", "📷", "💻", "🤖", "🎯"];

function flash(boxId, msg, ok) {
  const box = document.getElementById(boxId);
  if (!box) return;
  box.textContent = msg;
  box.className = ok ? "form-ok" : "form-error";
  box.style.display = "block";
  if (ok) setTimeout(() => { box.style.display = "none"; }, 3500);
}

const HAS = id => !!document.getElementById(id);

function guard(perm) {
  if (hasPerm(user, perm)) return true;
  alert("لا تملك صلاحية تنفيذ هذا الإجراء.");
  return false;
}

function renderAdmin() {
  DB = loadDB();
  renderTopStats();
  if (HAS("requestsList")) renderRequests();
  if (HAS("clubsAdminList")) { renderClubsAdmin(); fillClubFormOptions(); }
  if (HAS("teachersList")) { renderTeachersAdmin(); fillTeacherFormOptions(); }
  if (HAS("schClass")) renderScheduleMgmt();
  if (HAS("listsTable")) renderListsMgmt();
  if (HAS("licList")) renderLicenses();
  if (HAS("examsBox")) renderExams(user, "examsBox");
  if (HAS("micBox")) renderMic(user, "micBox");
  if (HAS("aboutList")) renderAbout();
  if (HAS("radioMgr")) renderRadioManager(user, "radioMgr");
  if (HAS("meName")) renderMe();
  if (HAS("annList")) renderAnnouncements();
  if (HAS("staffList")) renderStaffAdmin();
  if (HAS("accountsList")) { renderResetRequests(); renderAccounts(); }
  if (!window.__artInit && HAS("editorBox")) { window.__artInit = true; initArticleTools(user, { refresh: renderOverview }); }
  renderOverview();
}

/* ---------- نظرة عامة: ما ينتظر قرار المسؤول ---------- */
function renderOverview() {
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  const pend = DB.requests.filter(r => r.status === "pending").length;
  set("todoReq", pend);
  set("sidePending", pend || "");
  set("todoLic", DB.students.filter(s => s.licenseRequest === "pending").length);
  set("todoArt", DB.articles.filter(a => a.status === "pending").length);
  set("todoSch", DB.classrooms.filter(c => !isSchedulePublished(c)).length);
  set("todoExam", upcomingExams().length);
  set("todoReset", pendingResets().length);
  set("sideReset", pendingResets().length || "");
  set("absenceCount", DB.teacherAbsences.filter(absenceActive).length);
}

/* ---------- طلبات التلاميذ ---------- */
function renderRequests() {
  const pending = DB.requests.filter(r => r.status === "pending");
  const done = DB.requests.filter(r => r.status !== "pending").slice().reverse();

  document.getElementById("pendingBadge").textContent = pending.length + " قيد الدراسة";
  const sideBadge = document.getElementById("sidePending");
  if (sideBadge) sideBadge.textContent = pending.length ? pending.length : "";

  document.getElementById("requestsList").innerHTML = pending.length
    ? pending.map(r => `
      <div class="req-card">
        <div class="req-head"><b>${esc(r.fullName)}</b><span class="badge badge-yellow">قيد الدراسة</span></div>
        <div class="req-grid">
          <div><span>رقم مسار:</span> <bdi>${esc(r.massarCode)}</bdi></div>
          <div><span>المستوى:</span> ${esc(r.level)}</div>
          <div><span>القسم:</span> <bdi>${esc(r.classroom)}</bdi></div>
          <div><span>تاريخ الازدياد:</span> ${esc(r.birthDate)}</div>
          <div><span>هاتف ولي الأمر:</span> <bdi>${esc(r.guardianPhone)}</bdi></div>
          <div><span>تاريخ الطلب:</span> ${esc(r.submittedAt)}</div>
          <div><span>الوثيقة:</span> ${esc(r.docName || "لم تُرفق")}</div>
          <div><span>ملاحظة:</span> ${esc(r.note || "—")}</div>
        </div>
        <div class="req-actions">
          <button class="btn btn-primary btn-sm" type="button" onclick="approveReq('${r.id}')">✔ قبول وفتح الفضاءات</button>
          <input type="text" id="reason-${r.id}" placeholder="سبب الرفض (إلزامي عند الرفض)">
          <button class="btn btn-danger btn-sm" type="button" onclick="rejectReq('${r.id}')">✖ رفض</button>
        </div>
      </div>`).join("")
    : `<p class="empty-note">لا توجد طلبات جديدة حاليًا.</p>`;

  document.getElementById("requestsHistory").innerHTML = done.length
    ? `<h4 style="margin:18px 0 8px;font-size:14px;">سجل الطلبات المعالجة</h4>
       <table class="data-table"><thead><tr><th>التلميذ(ة)</th><th>القسم</th><th>القرار</th><th>التاريخ</th></tr></thead><tbody>
       ${done.map(r => `<tr><td>${esc(r.fullName)}</td><td><bdi>${esc(r.classroom)}</bdi></td>
          <td>${r.status === "approved" ? '<span class="badge badge-green">مقبول</span>' : '<span class="badge badge-red" title="' + esc(r.reason) + '">مرفوض</span>'}</td>
          <td>${esc(r.reviewedAt || "")}</td></tr>`).join("")}
       </tbody></table>`
    : "";
}

function approveReq(id) {
  if (!guard("students")) return false;
    const res = reviewRequest(id, "approved");
  if (!res.ok) { flash("requestsMsg", res.error, false); return; }
  renderAdmin();
  flash("requestsMsg", "تمت الموافقة. فُتحت جميع فضاءات التلميذ(ة).", true);
}

function rejectReq(id) {
  if (!guard("students")) return false;
    const reason = document.getElementById("reason-" + id).value;
  const res = reviewRequest(id, "rejected", reason);
  if (!res.ok) { flash("requestsMsg", res.error, false); return; }
  renderAdmin();
  flash("requestsMsg", "تم رفض الطلب وإشعار التلميذ(ة) بالسبب.", true);
}

/* ---------- الأندية ---------- */
function fillClubFormOptions() {
  const iconSel = document.getElementById("clubIcon");
  const curIcon = iconSel.value || CLUB_ICONS[0];
  iconSel.innerHTML = CLUB_ICONS.map(i => `<option value="${i}" ${i === curIcon ? "selected" : ""}>${i}</option>`).join("");

  const mgr = document.getElementById("clubManager");
  const curMgr = mgr.value;
  mgr.innerHTML = `<option value="">اختر الأستاذ(ة) المسيّر(ة)</option>` +
    DB.teachers.map(t => `<option value="${t.id}" ${t.id === curMgr ? "selected" : ""}>${esc(teacherName(t.id))}</option>`).join("");

  const checked = new Set(Array.from(document.querySelectorAll("#clubSupervisors input:checked")).map(i => i.value));
  document.getElementById("clubSupervisors").innerHTML = DB.teachers.map(t =>
    `<label><input type="checkbox" value="${t.id}" ${checked.has(t.id) ? "checked" : ""}> ${esc(teacherName(t.id))}</label>`).join("");
}

function renderClubsAdmin() {
  const list = document.getElementById("clubsAdminList");
  list.innerHTML = DB.clubs.length ? DB.clubs.map(c => {
    const sups = (c.supervisorIds || []).map(id => `<span class="chip">${esc(teacherName(id))}</span>`).join("");
    return `<div class="club-row">
      <div>
        ${clubLogoHTML(c, 32)} <b>${esc(c.name)}</b> <span class="badge badge-blue">${clubMemberCount(c)} منخرط(ة)</span>
        <div class="club-chips"><span class="chip manager">المسيّر: ${esc(teacherName(c.managerId))}</span>${sups}</div>
      </div>
      <div class="actions">
        <button class="btn btn-ghost btn-sm" type="button" onclick="editClub('${c.id}')">تعديل</button>
        <button class="btn btn-danger btn-sm" type="button" onclick="removeClub('${c.id}')">حذف</button>
      </div>
    </div>`;
  }).join("") : `<p class="empty-note">لا توجد أندية. أضف النادي الأول من النموذج أعلاه.</p>`;
}

/* شعار النادي: اختيار صورة */
let clubLogoData = "", clubLogoRemove = false;
function renderClubLogoPrev() {
  const prev = document.getElementById("clubLogoPreview");
  prev.innerHTML = clubLogoData ? `<img class="club-logo" src="${clubLogoData}" alt="" style="width:56px;height:56px;">` : "";
  document.getElementById("clubLogoClear").style.display = clubLogoData ? "inline-flex" : "none";
}
async function pickClubLogo(inp) {
  const f = inp.files[0]; if (!f) return;
  try { clubLogoData = await shrinkLogo(f); clubLogoRemove = false; renderClubLogoPrev(); }
  catch (e) { flash("clubMsg", e.message, false); }
  inp.value = "";
}
function clearClubLogo() { clubLogoData = ""; clubLogoRemove = true; renderClubLogoPrev(); }

function submitClub(e) {
  if (!guard("clubs")) return false;
    e.preventDefault();
  const supervisorIds = Array.from(document.querySelectorAll("#clubSupervisors input:checked")).map(i => i.value);
  const editing = document.getElementById("clubId").value;
  const res = saveClub({
    id: editing || null,
    name: document.getElementById("clubName").value,
    desc: document.getElementById("clubDesc").value,
    icon: document.getElementById("clubIcon").value,
    logo: clubLogoData || "", removeLogo: clubLogoRemove,
    managerId: document.getElementById("clubManager").value,
    supervisorIds,
  });
  if (!res.ok) { flash("clubMsg", res.error, false); return false; }
  resetClubForm();
  renderAdmin();
  flash("clubMsg", editing ? "تم تحديث النادي." : "تمت إضافة النادي، وهو ظاهر الآن في صفحة الأندية.", true);
  return false;
}

function editClub(id) {
  const c = DB.clubs.find(x => x.id === id);
  if (!c) return;
  document.getElementById("clubId").value = c.id;
  document.getElementById("clubName").value = c.name;
  document.getElementById("clubDesc").value = c.desc;
  document.getElementById("clubIcon").value = c.icon;
  clubLogoData = c.logo || ""; clubLogoRemove = false; renderClubLogoPrev();
  document.getElementById("clubManager").value = c.managerId;
  document.querySelectorAll("#clubSupervisors input").forEach(i => { i.checked = (c.supervisorIds || []).includes(i.value); });
  document.getElementById("clubFormTitle").textContent = "تعديل النادي: " + c.name;
  document.getElementById("clubCancel").style.display = "inline-flex";
  document.getElementById("clubSubmit").textContent = "حفظ التعديلات";
  document.getElementById("clubsMgmt").scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetClubForm() {
  document.getElementById("clubForm").reset();
  clubLogoData = ""; clubLogoRemove = false; renderClubLogoPrev();
  document.getElementById("clubId").value = "";
  document.getElementById("clubFormTitle").textContent = "إضافة نادٍ جديد";
  document.getElementById("clubCancel").style.display = "none";
  document.getElementById("clubSubmit").textContent = "إضافة النادي";
  document.querySelectorAll("#clubSupervisors input").forEach(i => { i.checked = false; });
}

function removeClub(id) {
  if (!guard("clubs")) return false;
    const c = DB.clubs.find(x => x.id === id);
  if (!c) return;
  if (!confirm("حذف نادي «" + c.name + "»؟ سيفقد المنخرطون عضويتهم فيه.")) return;
  deleteClub(id);
  renderAdmin();
}

/* ---------- الأساتذة ---------- */
function classChecks(selected, name) {
  return DB.classrooms.map(c => `<label><input type="checkbox" name="${name}" value="${esc(c)}" ${selected.includes(c) ? "checked" : ""}> <bdi>${esc(c)}</bdi></label>`).join("");
}

function fillTeacherFormOptions() {
  const checked = Array.from(document.querySelectorAll("#tClasses input:checked")).map(i => i.value);
  document.getElementById("tClasses").innerHTML = classChecks(checked, "tcls");
  renderDraftGrid();
}

/* مسودة حصص الأستاذ(ة) الجديد(ة): تُملأ مباشرة في الجدول ولا تُحفظ إلا عند «إنشاء الحساب» */
let draftSlots = [];
function refreshDraftGrid() {
  const chosen = Array.from(document.querySelectorAll("#tClasses input:checked")).map(i => i.value);
  draftSlots = draftSlots.filter(sl => chosen.includes(sl.classroom));
  renderDraftGrid();
}
function draftConflict(d, ignoreId) {
  const ov = (a, b) => a.start < b.end && b.start < a.end;
  const mine = draftSlots.find(x => x.id !== ignoreId && x.day === d.day && ov(x, d));
  if (mine) return "تعارض: للأستاذ(ة) حصة أخرى في المسودة يوم " + d.day + " بين " + mine.start + " و " + mine.end + ".";
  const cls = DB.scheduleSlots.find(x => x.classroom === d.classroom && x.day === d.day && ov(x, d));
  if (cls) return "تعارض: للقسم " + d.classroom + " حصة أخرى يوم " + d.day + " بين " + cls.start + " و " + cls.end + ".";
  const own = draftSlots.find(x => x.id !== ignoreId && x.classroom === d.classroom && x.day === d.day && ov(x, d));
  return own ? "تعارض داخل المسودة." : "";
}
function renderDraftGrid() {
  const host = document.getElementById("tGrid");
  if (!host) return;
  const chosen = Array.from(document.querySelectorAll("#tClasses input:checked")).map(i => i.value);
  if (!chosen.length) { host.innerHTML = `<p class="empty-note">اختر الأقسام المسندة أولًا لتظهر شبكة الحصص.</p>`; return; }
  const subj = document.getElementById("tSubject").value.trim();
  ttEditable(host, {
    kind: "teacher", name: document.getElementById("tName").value.trim() || "الأستاذ(ة) الجديد(ة)",
    fixedTeacher: { id: null, name: "", subject: subj },
    list: () => draftSlots, classes: () => chosen,
    save(oldId, d) {
      if (!TIME_RE.test(d.start) || !TIME_RE.test(d.end) || d.start >= d.end) return { ok: false, error: "وقت النهاية يجب أن يكون بعد وقت البداية." };
      d.subject = d.subject.trim() || subj;
      if (d.subject.length < 2) return { ok: false, error: "المادة مطلوبة." };
      const err = draftConflict(d, oldId);
      if (err) return { ok: false, error: err };
      const rec = Object.assign({ id: oldId || uid("dr") }, d, { teacherId: null });
      const i = draftSlots.findIndex(x => x.id === oldId);
      if (i >= 0) draftSlots[i] = rec; else draftSlots.push(rec);
      return { ok: true };
    },
    remove(id) { draftSlots = draftSlots.filter(x => x.id !== id); },
    onChange: renderDraftGrid,
  });
}

function renderTeachersAdmin() {
  document.getElementById("teachersList").innerHTML = DB.teachers.map(t => {
    const u = getUserById(t.userId);
    const clubs = clubsOfTeacher(t.id).map(c => esc(c.name)).join("، ");
    const n = slotsOfTeacher(t.id).length;
    return `<div class="club-row" style="align-items:flex-start;">
      <div style="flex:1;"><b>${esc(u ? u.fullName : "—")}</b><br>
      <span style="font-size:12.5px;color:var(--ink-600);">${esc((t.subjects || []).join("، ") || "بدون مادة")} • <bdi>${esc(u ? u.email : "")}</bdi> • ${n} حصة أسبوعيًا</span>
      <div class="club-chips">${(t.classrooms || []).length ? t.classrooms.map(c => `<span class="chip manager"><bdi>${esc(c)}</bdi></span>`).join("") : '<span class="chip">بدون أقسام</span>'}${clubs ? `<span class="chip">${clubs}</span>` : ""}</div>
      <details style="margin-top:6px;"><summary style="cursor:pointer;color:var(--blue-600);font-size:13px;font-weight:700;">تعديل الأقسام</summary>
        <div class="check-grid" id="tc-${t.id}" style="margin:8px 0;">${classChecks(t.classrooms || [], "tc-" + t.id)}</div>
        <button class="btn btn-primary btn-sm" type="button" onclick="saveTeacherClasses('${t.id}')">حفظ الأقسام</button>
      </details></div>
    </div>`;
  }).join("");
}

function saveTeacherClasses(teId) {
  if (!guard("teachers")) return false;
    const list = Array.from(document.querySelectorAll("#tc-" + teId + " input:checked")).map(i => i.value);
  const r = setTeacherClassrooms(teId, list);
  if (!r.ok) { flash("teacherMsg", r.error, false); return; }
  renderAdmin();
  flash("teacherMsg", "تم تحديث أقسام الأستاذ(ة).", true);
}

function submitTeacher(e) {
  if (!guard("teachers")) return false;
    e.preventDefault();
  const classrooms = Array.from(document.querySelectorAll("#tClasses input:checked")).map(i => i.value);
  const slots = draftSlots.filter(sl => classrooms.includes(sl.classroom)).map(sl => ({ classroom: sl.classroom, day: sl.day, start: sl.start, end: sl.end, room: sl.room, subject: sl.subject }));
  DB = loadDB();
  const res = addTeacher({
    fullName: document.getElementById("tName").value,
    email: document.getElementById("tEmail").value,
    password: document.getElementById("tPass").value,
    subject: document.getElementById("tSubject").value,
    classrooms, slots,
  });
  if (!res.ok) { flash("teacherMsg", res.error, false); return false; }
  document.getElementById("teacherForm").reset();
  draftSlots = [];
  renderAdmin();
  flash("teacherMsg", "تم إنشاء حساب الأستاذ(ة) مع " + classrooms.length + " أقسام و" + res.slotsCount + " حصص.", true);
  return false;
}

/* ---------- استعمالات الزمن ---------- */
let schMode = "class";
function setSchMode(m) { schMode = m; renderScheduleMgmt(); }
function teacherChoices() {
  return DB.teachers.map(t => ({ id: t.id, name: teacherName(t.id), subject: (t.subjects || [])[0] || "" }));
}
function renderScheduleMgmt() {
  const sel = document.getElementById("schClass");
  const cur = sel.value || DB.classrooms[0];
  sel.innerHTML = DB.classrooms.map(c => `<option value="${esc(c)}" ${c === cur ? "selected" : ""}>${esc(c)}</option>`).join("");
  const tsel = document.getElementById("schTeacher"), curT = tsel.value || (DB.teachers[0] || {}).id;
  tsel.innerHTML = DB.teachers.map(t => `<option value="${t.id}" ${t.id === curT ? "selected" : ""}>${esc(teacherName(t.id))}</option>`).join("");
  const cls = sel.value, teId = tsel.value;
  const isClass = schMode === "class";
  document.getElementById("modeClass").classList.toggle("on", isClass);
  document.getElementById("modeTeacher").classList.toggle("on", !isClass);
  document.getElementById("schClassBox").style.display = isClass ? "" : "none";
  document.getElementById("schTeacherBox").style.display = isClass ? "none" : "";
  document.getElementById("schClassTools").style.display = isClass ? "flex" : "none";
  document.getElementById("schFileWrap").style.display = isClass ? "" : "none";

  const st = document.getElementById("schState");
  if (isClass) {
    const pub = isSchedulePublished(cls);
    st.textContent = pub ? "منشور" : "غير منشور";
    st.className = "badge " + (pub ? "badge-green" : "badge-yellow");
    const btn = document.getElementById("schPublishBtn");
    btn.textContent = pub ? "إلغاء النشر" : "نشر استعمال الزمن";
    btn.className = "btn btn-sm " + (pub ? "btn-ghost" : "btn-primary");
  } else { st.textContent = "يراه الأستاذ(ة) دائمًا"; st.className = "badge badge-blue"; }

  const slots = isClass ? slotsOfClass(cls) : slotsOfTeacher(teId);
  const te = DB.teachers.find(t => t.id === teId);
  ttEditable(document.getElementById("schGrid"), {
    kind: isClass ? "class" : "teacher", name: isClass ? cls : teacherName(teId),
    fixedClass: cls, fixedTeacher: te ? { id: te.id, name: teacherName(te.id), subject: (te.subjects || [])[0] || "" } : null,
    list: () => isClass ? slotsOfClass(cls) : slotsOfTeacher(teId),
    classes: () => DB.classrooms, teachers: teacherChoices,
    save(oldId, d) {
      if (!guard("schedules")) return { ok: false, error: "لا تملك صلاحية تعديل استعمالات الزمن." };
      DB = loadDB();
      return updateSlot(oldId, d);
    },
    remove(id) { if (!guard("schedules")) return; DB = loadDB(); deleteSlot(id); },
    onChange() { renderAdmin(); },
  });

  document.getElementById("schTable").innerHTML = slots.length
    ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>اليوم</th><th>الوقت</th><th>المادة</th><th>${isClass ? "الأستاذ(ة)" : "القسم"}</th><th>القاعة</th><th></th></tr></thead><tbody>
       ${slots.map(sl => `<tr><td>${esc(sl.day)}</td><td><bdi>${esc(sl.start)} - ${esc(sl.end)}</bdi></td><td>${esc(sl.subject)}</td><td>${isClass ? esc(slotTeacherName(sl)) : "<bdi>" + esc(sl.classroom) + "</bdi>"}</td><td>${esc(sl.room || "—")}</td>
         <td><button class="btn btn-danger btn-sm" type="button" onclick="removeSlot('${sl.id}')">حذف</button></td></tr>`).join("")}</tbody></table></div>`
    : `<p class="empty-note">لا توجد حصص بعد.</p>`;

  if (!document.getElementById("slStart").options.length) {
    document.getElementById("slStart").innerHTML = hourOptions("08:00");
    document.getElementById("slEnd").innerHTML = hourOptions("09:00");
  }
  const dayEl = document.getElementById("slDay");
  if (!dayEl.options.length) dayEl.innerHTML = DAYS.map(d => `<option>${d}</option>`).join("");
  const tSel = document.getElementById("slTeacher"), curTe = tSel.value;
  tSel.innerHTML = `<option value="">— بدون أستاذ مسجَّل —</option>` + DB.teachers.map(t => `<option value="${t.id}">${esc(teacherName(t.id))}</option>`).join("");
  tSel.value = curTe;

  const f = (DB.scheduleFiles || {})[cls];
  document.getElementById("schFile").innerHTML = f
    ? `<p style="margin:0 0 8px;font-size:13.5px;">📎 <b>${esc(f.name)}</b> <button class="btn btn-ghost btn-sm" type="button" onclick="openScheduleFile('${esc(cls)}')">معاينة</button> <button class="btn btn-danger btn-sm" type="button" onclick="removeScheduleFile()">إزالة</button></p>`
    : `<p class="empty-note" style="margin:0 0 8px;">لا يوجد ملف مرفق لهذا القسم.</p>`;
}
function curClass() { return document.getElementById("schClass").value; }

function autoSubject() {
  const t = DB.teachers.find(x => x.id === document.getElementById("slTeacher").value);
  const subj = document.getElementById("slSubject");
  if (t && t.subjects && t.subjects[0] && !subj.value) subj.value = t.subjects[0];
}
function submitSlot(e) {
  if (!guard("schedules")) return false;
    e.preventDefault();
  DB = loadDB();
  const teId = document.getElementById("slTeacher").value || null;
  const res = addSlot({
    classroom: curClass(), day: document.getElementById("slDay").value,
    start: document.getElementById("slStart").value, end: document.getElementById("slEnd").value,
    subject: document.getElementById("slSubject").value, room: document.getElementById("slRoom").value, teacherId: teId,
  });
  if (!res.ok) { flash("schMsg", res.error, false); return false; }
  if (teId) {   // ضمان أن القسم ضمن أقسام الأستاذ(ة)
    const t = DB.teachers.find(x => x.id === teId);
    if (t && !t.classrooms.includes(curClass())) { t.classrooms.push(curClass()); saveDB(); }
  }
  document.getElementById("slotForm").reset();
  renderAdmin();
  flash("schMsg", "تمت إضافة الحصة.", true);
  return false;
}
function removeSlot(id) {
  if (!guard("schedules")) return false;
  deleteSlot(id); renderAdmin(); }
function togglePublish() {
  if (!guard("schedules")) return false;
    DB = loadDB();
  const cls = curClass(), now = isSchedulePublished(cls);
  const r = setSchedulePublished(cls, !now);
  if (!r.ok) { flash("schMsg", r.error, false); return; }
  renderAdmin();
  flash("schMsg", now ? "أُلغي نشر استعمال زمن القسم " + cls + "." : "تم نشر استعمال زمن القسم " + cls + ". أصبح ظاهرًا للتلاميذ والأولياء والزوار.", true);
}
function submitClassroom() {
  if (!guard("schedules")) return false;
    const inp = document.getElementById("newClass");
  const r = addClassroom(inp.value);
  if (!r.ok) { flash("schMsg", r.error, false); return; }
  const v = inp.value.trim(); inp.value = "";
  renderAdmin();
  document.getElementById("schClass").value = v; renderScheduleMgmt();
  flash("schMsg", "تمت إضافة القسم " + v + ".", true);
}
function uploadScheduleFile() {
  if (!guard("schedules")) return false;
    const f = document.getElementById("schFileInput").files[0];
  if (!f) { flash("schMsg", "اختر ملفًا أولًا.", false); return; }
  const cls = curClass();
  if (f.size > MAX_FILE_BYTES) { flash("schMsg", "حجم الملف كبير (الحد الأقصى 1.5 ميغابايت).", false); return; }
  const rd = new FileReader();
  rd.onload = () => {
    DB = loadDB();
    const r = setScheduleFile(cls, { name: f.name, type: f.type, size: f.size, dataUrl: rd.result });
    if (!r.ok) { flash("schMsg", r.error, false); return; }
    document.getElementById("schFileInput").value = "";
    renderAdmin();
    flash("schMsg", "تم رفع الملف. انشر استعمال الزمن ليظهر للجميع.", true);
  };
  rd.readAsDataURL(f);
}
function removeScheduleFile() {
  if (!guard("schedules")) return false;
  clearScheduleFile(curClass()); renderAdmin(); }
function openScheduleFile(cls) { openStoredFile((DB.scheduleFiles || {})[cls]); }

/* ---------- لوائح الأقسام (Excel) ---------- */
function renderListsMgmt() {
  document.getElementById("listsTable").innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>القسم</th><th>عدد التلاميذ</th><th>عدد الحصص</th><th>استعمال الزمن</th><th>اللائحة</th></tr></thead><tbody>` +
    DB.classrooms.map(c => `<tr><td><bdi>${esc(c)}</bdi></td><td>${studentsOfClass(c).length}</td><td>${slotsOfClass(c).length}</td>
      <td>${isSchedulePublished(c) ? '<span class="badge badge-green">منشور</span>' : '<span class="badge badge-yellow">غير منشور</span>'}</td>
      <td><button class="btn btn-primary btn-sm" type="button" onclick="downloadClassXLSX('${esc(c)}')">⬇ Excel</button></td></tr>`).join("") + `</tbody></table></div>`;
}

/* ---------- رخص الصحافة ---------- */
function renderLicenses() {
  const pend = DB.students.filter(s => s.licenseRequest === "pending");
  document.getElementById("licBadge").textContent = pend.length + " قيد الدراسة";
  document.getElementById("licList").innerHTML = pend.length ? pend.map(s => {
    const u = getUserById(s.userId);
    return `<div class="req-card"><div class="req-head"><b>${esc(u ? u.fullName : "—")}</b><span class="badge badge-yellow">قيد الدراسة</span></div>
      <div style="font-size:13px;margin-bottom:8px;">القسم <bdi>${esc(s.classroom || "—")}</bdi> — ${esc(s.licenseNote || "")}</div>
      <div class="req-actions">
        <button class="btn btn-primary btn-sm" type="button" onclick="decideLicense('${s.id}','approved')">✔ منح الرخصة</button>
        <input type="text" id="lic-${s.id}" placeholder="سبب الرفض (إلزامي)">
        <button class="btn btn-danger btn-sm" type="button" onclick="decideLicense('${s.id}','rejected')">✖ رفض</button></div></div>`;
  }).join("") : `<p class="empty-note">لا توجد طلبات رخص حاليًا.</p>`;
}
function decideLicense(stId, decision) {
  if (!guard("press")) return false;
    const reason = (document.getElementById("lic-" + stId) || {}).value;
  const r = reviewLicense(stId, decision, reason);
  if (!r.ok) { flash("licMsg", r.error, false); return; }
  renderAdmin();
  flash("licMsg", decision === "approved" ? "تم منح رخصة الصحافة." : "تم رفض الطلب.", true);
}

/* ---------- بطاقات الإحصاء العلوية (من البيانات الفعلية) ---------- */
function renderTopStats() {
  const st = DB.stats || {};
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set("statStudents", st.totalStudents);
  set("statClasses", st.classroomsCount);
  set("statSuccess", st.successRate + "%");
}

/* ---------- معلومات المؤسسة ---------- */
const SCHOOL_FIELDS = {
  sName: "schoolName", sCity: "city", sTagline: "tagline", sAddress: "address",
  sEmail: "email", sPhone: "phone", sFax: "fax",
  sFacebook: "facebook", sYoutube: "youtube", sInstagram: "instagram", sWhatsapp: "whatsapp",
  sEyebrow: "heroEyebrow", sHeroTitle: "heroTitle", sHeroLead: "heroLead",
  sEventTitle: "eventTitle", sEventDate: "eventDate",
};
const SCHOOL_STATS = { sSuccess: "successRate", sRegional: "regionalExamRate", sClasses: "classroomsCount", sMale: "maleCount", sFemale: "femaleCount" };

function updateTotal() {
  const m = Number(document.getElementById("sMale").value) || 0;
  const f = Number(document.getElementById("sFemale").value) || 0;
  document.getElementById("sTotal").value = m + f;
}

function fillSchoolForm() {
  DB = loadDB();
  const s = DB.settings, st = DB.stats;
  Object.keys(SCHOOL_FIELDS).forEach(id => { document.getElementById(id).value = s[SCHOOL_FIELDS[id]] || ""; });
  Object.keys(SCHOOL_STATS).forEach(id => { document.getElementById(id).value = st[SCHOOL_STATS[id]]; });
  document.getElementById("sTicker").value = (s.ticker || []).join("\n");
  updateTotal();
}

function submitSchool(e) {
  if (user.role !== "admin") return false;
    e.preventDefault();
  const data = {};
  Object.keys(SCHOOL_FIELDS).forEach(id => { data[SCHOOL_FIELDS[id]] = document.getElementById(id).value; });
  Object.keys(SCHOOL_STATS).forEach(id => { data[SCHOOL_STATS[id]] = document.getElementById(id).value; });
  data.ticker = document.getElementById("sTicker").value;
  DB = loadDB();
  const res = saveSchoolInfo(data);
  if (!res.ok) { flash("schoolMsg", res.error, false); return false; }
  fillSchoolForm();
  applySchoolInfo();
  renderTopStats();
  flash("schoolMsg", "تم الحفظ. التغييرات ظاهرة الآن في كل صفحات الموقع.", true);
  return false;
}

function resetSchool() {
  if (user.role !== "admin") return false;
    if (!confirm("استرجاع معلومات المؤسسة إلى القيم الأصلية؟ ستُفقد تعديلاتك الحالية على هذه الحقول.")) return;
  DB = loadDB();
  resetSchoolInfo();
  fillSchoolForm();
  applySchoolInfo();
  renderTopStats();
  flash("schoolMsg", "تم استرجاع القيم الأصلية.", true);
}

/* ---------- الإعلانات وغيابات الأساتذة ---------- */
function renderAnnouncements() {
  document.getElementById("annList").innerHTML = DB.announcements.length ? DB.announcements.map(a => `<div class="club-row"><div><b>${esc(a.title)}</b>
      ${a.urgent ? '<span class="badge badge-red">عاجل</span>' : ""}<div style="font-size:12.5px;color:var(--ink-600);">${esc(a.type)} • ${esc(a.date)}</div></div>
      <div class="actions"><button class="btn btn-danger btn-sm" type="button" onclick="removeAnn('${a.id}')">حذف</button></div></div>`).join("") : `<p class="empty-note">لا توجد إعلانات.</p>`;
  const t = document.getElementById("abTeacher");
  const tv = t.value;
  t.innerHTML = DB.teachers.map(x => `<option value="${x.id}">${esc(teacherName(x.id))}</option>`).join("");
  if (tv) t.value = tv;
  if (!document.getElementById("abSessions").children.length) addAbsSession();
  if (!document.getElementById("abDateFrom").value) document.getElementById("abDateFrom").value = localISO();
  document.getElementById("absList").innerHTML = DB.teacherAbsences.length ? DB.teacherAbsences.map(a => `<div class="club-row"><div><b>${esc(a.teacher)}</b>
      <span class="badge badge-yellow">${esc(a.status)}</span> ${a.kind === "days" ? '<span class="badge badge-blue">أيام كاملة</span>' : '<span class="badge badge-blue">حصص</span>'}${absenceActive(a) ? "" : ' <span class="badge">منتهٍ</span>'}
      <div style="font-size:12.5px;color:var(--ink-600);">${esc(absenceWhen(a))} • ${a.kind === "days" ? "الأقسام: " + absenceClasses(a).map(esc).join("، ") + " • " : ""}${esc(a.subject)}${a.reason ? " • " + esc(a.reason) : ""}</div></div>
      <div class="actions"><button class="btn btn-danger btn-sm" type="button" onclick="removeAbs('${a.id}')">حذف</button></div></div>`).join("") : `<p class="empty-note">لا توجد غيابات منشورة.</p>`;
}
function absKind() { return document.querySelector('input[name="abKind"]:checked').value; }
function absKindChanged() {
  const days = absKind() === "days";
  document.getElementById("abDateToBox").style.display = days ? "" : "none";
  document.getElementById("abDateFromLbl").textContent = days ? "من تاريخ" : "التاريخ";
  document.getElementById("abSessionsBox").style.display = days ? "none" : "";
  document.getElementById("abDaysNote").style.display = days ? "" : "none";
  if (days && !document.getElementById("abDateTo").value) document.getElementById("abDateTo").value = document.getElementById("abDateFrom").value;
}
function addAbsSession(v) {
  v = v || {};
  const div = document.createElement("div");
  div.className = "slot-row";
  div.innerHTML = `<select class="as-class" aria-label="القسم">${DB.classrooms.map(c => `<option ${c === v.classroom ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>
    <input type="time" class="as-start" dir="ltr" aria-label="من" value="${esc(v.start || "08:00")}">
    <input type="time" class="as-end" dir="ltr" aria-label="إلى" value="${esc(v.end || "09:00")}">
    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentNode.remove()">✖</button>`;
  document.getElementById("abSessions").appendChild(div);
}
function importAbsSessions() {
  const d = document.getElementById("abDateFrom").value;
  if (!ISO_RE.test(d)) { flash("absMsg", "اختر التاريخ أولًا.", false); return; }
  const dayName = DAYS[(new Date(d + "T12:00:00").getDay() + 6) % 7];
  const slots = slotsOfTeacher(document.getElementById("abTeacher").value).filter(sl => sl.day === dayName);
  if (!slots.length) { flash("absMsg", "لا توجد حصص لهذا الأستاذ(ة) يوم " + (new Date(d + "T12:00:00").getDay() === 0 ? "الأحد" : dayName) + ".", false); return; }
  document.getElementById("abSessions").innerHTML = "";
  slots.forEach(sl => addAbsSession({ classroom: sl.classroom, start: sl.start, end: sl.end }));
}
function submitAnnouncement(e) {
  e.preventDefault();
  const r = addAnnouncement(user, { title: document.getElementById("annTitle").value, type: document.getElementById("annType").value, urgent: document.getElementById("annUrgent").checked });
  if (!r.ok) { flash("annMsg", r.error, false); return false; }
  document.getElementById("annTitle").value = ""; document.getElementById("annUrgent").checked = false;
  renderAdmin(); flash("annMsg", "تم نشر الإعلان.", true);
  return false;
}
function removeAnn(id) { deleteAnnouncement(user, id); renderAdmin(); }
function submitAbsence(e) {
  e.preventDefault();
  const sessions = Array.from(document.querySelectorAll("#abSessions .slot-row")).map(r => ({ classroom: r.querySelector(".as-class").value, start: r.querySelector(".as-start").value, end: r.querySelector(".as-end").value }));
  const r = addAbsence(user, { teacherId: document.getElementById("abTeacher").value, kind: absKind(),
    dateFrom: document.getElementById("abDateFrom").value, dateTo: document.getElementById("abDateTo").value, sessions,
    status: document.getElementById("abStatus").value, reason: document.getElementById("abReason").value });
  if (!r.ok) { flash("absMsg", r.error, false); return false; }
  document.getElementById("abSessions").innerHTML = "";
  renderAdmin(); flash("absMsg", "تم نشر التنبيه، ويظهر لتلاميذ الأقسام المعنية وأوليائهم وفي صفحة الأخبار.", true);
  return false;
}
function removeAbs(id) { deleteAbsence(user, id); renderAdmin(); }

/* ---------- فريق الإدارة (المدير فقط) ---------- */
function permChecks(selected, name) {
  return Object.keys(PERMS).map(k => `<label><input type="checkbox" name="${name}" value="${k}" ${selected.includes(k) ? "checked" : ""}> ${esc(PERMS[k])}</label>`).join("");
}
function renderStaffAdmin() {
  if (!document.getElementById("sfPerms").children.length) document.getElementById("sfPerms").innerHTML = permChecks([], "sfp");
  document.getElementById("staffList").innerHTML = DB.staff.length ? DB.staff.map(st => {
    const u = getUserById(st.userId);
    return `<div class="club-row" style="align-items:flex-start;"><div style="flex:1;"><b>${esc(u ? u.fullName : "—")}</b> <span class="badge badge-blue">${esc(st.title)}</span>
      <div style="font-size:12.5px;color:var(--ink-600);"><bdi>${esc(u ? u.email : "")}</bdi></div>
      <div class="club-chips">${st.permissions.map(p => `<span class="chip">${esc(PERMS[p] || p)}</span>`).join("")}</div>
      <details style="margin-top:6px;"><summary style="cursor:pointer;color:var(--blue-600);font-size:13px;font-weight:700;">تعديل المنصب والصلاحيات</summary>
        <div class="field" style="margin:8px 0;"><label>المنصب</label><input type="text" id="sft-${st.id}" value="${esc(st.title)}" maxlength="40"></div>
        <div class="perm-grid" id="sfe-${st.id}" style="margin-bottom:8px;">${permChecks(st.permissions, "sfe-" + st.id)}</div>
        <div style="display:flex;gap:8px;"><button class="btn btn-primary btn-sm" type="button" onclick="saveStaff('${st.id}')">حفظ</button>
        <button class="btn btn-danger btn-sm" type="button" onclick="removeStaff('${st.id}')">حذف الحساب</button></div>
      </details></div></div>`;
  }).join("") : `<p class="empty-note">لا يوجد أعضاء إدارة بعد.</p>`;
}
function submitStaff(e) {
  e.preventDefault();
  const r = addStaff(user, { fullName: document.getElementById("sfName").value, title: document.getElementById("sfTitle").value,
    email: document.getElementById("sfEmail").value, password: document.getElementById("sfPass").value,
    permissions: Array.from(document.querySelectorAll("#sfPerms input:checked")).map(i => i.value) });
  if (!r.ok) { flash("staffMsg", r.error, false); return false; }
  document.getElementById("staffForm").reset();
  renderAdmin(); flash("staffMsg", "تم إنشاء حساب عضو الإدارة بالصلاحيات المحددة.", true);
  return false;
}
function saveStaff(id) {
  const r = updateStaff(user, id, { title: document.getElementById("sft-" + id).value,
    permissions: Array.from(document.querySelectorAll("#sfe-" + id + " input:checked")).map(i => i.value) });
  if (!r.ok) { flash("staffMsg", r.error, false); return; }
  renderAdmin(); flash("staffMsg", "تم تحديث الصلاحيات.", true);
}
function removeStaff(id) {
  if (!confirm("حذف حساب عضو الإدارة نهائيًا؟")) return;
  deleteStaff(user, id); renderAdmin();
}

/* ---------- الحسابات وإعادة تعيين كلمات المرور (المدير وحده) ---------- */
const ROLE_AR = { student: "تلميذ(ة)", teacher: "أستاذ(ة)", staff: "عضو إدارة", parent: "ولي أمر", admin: "المدير" };
function showTemp(u, temp) {
  const box = document.getElementById("resetOut");
  box.style.display = "block";
  box.innerHTML = `<div class="alert alert-yellow">🔑 تمت إعادة تعيين كلمة مرور <b>${esc(u.fullName)}</b> (${esc(ROLE_AR[u.role] || "")}). الرمز المؤقت:
    <b dir="ltr" id="tempPw" style="font-size:20px;letter-spacing:2px;margin:0 8px;">${esc(temp)}</b>
    سلّمه لصاحب الحساب مباشرة؛ لن يظهر مرة أخرى، وسيُطلب منه تغييره عند أول دخول.</div>`;
  box.scrollIntoView({ block: "nearest" });
}
function doReset(userId) {
  if (!guard("admin")) return;
  DB = loadDB();
  const u = getUserById(userId);
  if (!u || !confirm("هل تأكدت من هوية " + u.fullName + " وتريد إعادة تعيين كلمة مروره؟")) return;
  const r = resetPasswordByDirector(user, userId);
  if (!r.ok) { alert(r.error); return; }
  renderAdmin(); showTemp(r.user, r.tempPassword);
}
function dismissReset(id) {
  DB = loadDB(); dismissResetRequest(user, id); renderAdmin();
}
function renderResetRequests() {
  const list = pendingResets();
  const badge = document.getElementById("resetBadge");
  if (badge) badge.textContent = list.length ? list.length + " طلب" : "";
  document.getElementById("resetRequests").innerHTML = list.length ? list.map(r => {
    const u = getUserById(r.userId);
    return `<div class="club-row"><div><b>${esc(u ? u.fullName : r.email)}</b> <span class="badge badge-blue">${esc(ROLE_AR[r.role] || r.role)}</span><br>
      <span style="font-size:12.5px;color:var(--ink-600);"><bdi>${esc(r.email)}</bdi> • ${esc(r.requestedAt)}</span></div>
      <div style="display:flex;gap:6px;"><button class="btn btn-primary btn-sm" type="button" onclick="doReset('${r.userId}')">إعادة تعيين</button>
      <button class="btn btn-ghost btn-sm" type="button" onclick="dismissReset('${r.id}')">تجاهل</button></div></div>`;
  }).join("") : `<p class="empty-note">لا توجد طلبات حاليًا.</p>`;
  const log = DB.resetLog || [];
  document.getElementById("resetLog").innerHTML = log.length
    ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>الحساب</th><th>الصفة</th><th>التاريخ</th></tr></thead><tbody>${log.slice(0, 10).map(l => `<tr><td>${esc(l.name)}</td><td>${esc(ROLE_AR[l.role] || l.role)}</td><td><bdi>${esc(l.at)}</bdi></td></tr>`).join("")}</tbody></table></div>`
    : `<p class="empty-note">لم تُنفَّذ أي عملية بعد.</p>`;
}
function renderAccounts() {
  const q = (document.getElementById("accFilter").value || "").trim().toLowerCase();
  const rows = DB.users.filter(u => RESETTABLE_ROLES.includes(u.role) && (!q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
  document.getElementById("accountsList").innerHTML = rows.length
    ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>الاسم</th><th>الصفة</th><th>البريد</th><th>الحالة</th><th></th></tr></thead><tbody>${rows.map(u => `<tr><td>${esc(u.fullName)}</td><td>${esc(ROLE_AR[u.role])}</td><td><bdi>${esc(u.email)}</bdi></td>
      <td>${u.mustChange ? '<span class="badge badge-yellow">رمز مؤقت لم يُغيَّر</span>' : '<span class="badge badge-green">عادي</span>'}</td>
      <td><button class="btn btn-ghost btn-sm" type="button" onclick="doReset('${u.id}')">إعادة تعيين كلمة المرور</button></td></tr>`).join("")}</tbody></table></div>`
    : `<p class="empty-note">لا توجد حسابات مطابقة.</p>`;
}

/* ---------- حسابي: المدير (أو عضو الإدارة) يغيّر اسمه ---------- */
function renderMe() {
  const nm = document.getElementById("meName");
  if (document.activeElement !== nm) nm.value = user.fullName;
  document.getElementById("meEmail").value = user.email || "";
}
function saveMyName(e) {
  e.preventDefault();
  DB = loadDB();
  const r = updateOwnName(user.id, document.getElementById("meName").value);
  if (!r.ok) { flash("meMsg", r.error, false); return false; }
  user.fullName = r.user.fullName; user.avatarInitial = r.user.avatarInitial;
  try { sessionStorage.setItem("currentUser", JSON.stringify(Object.assign(JSON.parse(sessionStorage.getItem("currentUser") || "{}"), { fullName: user.fullName, avatarInitial: user.avatarInitial }))); } catch (ex) {}
  const st = typeof staffOf === "function" ? staffOf(user) : null;
  document.getElementById("userName").textContent = user.fullName + (st ? " — " + st.title : "");
  document.getElementById("userAvatar").textContent = user.avatarInitial;
  renderAdmin();
  flash("meMsg", "تم تحديث الاسم.", true);
  return false;
}

/* ---------- التعريف بالمؤسسة (الصفحة الرئيسية) ---------- */
function aboutTypeChanged() {
  const t = document.getElementById("abType2").value;
  document.getElementById("abImgBox").style.display = t === "image" ? "" : "none";
  document.getElementById("abVidBox").style.display = t === "video" ? "" : "none";
  document.getElementById("abVidUrlBox").style.display = t === "video" ? "" : "none";
}
function renderAbout() {
  document.getElementById("aboutList").innerHTML = DB.about.length ? DB.about.map((it, i) => `<div class="club-row"><div>
      ${it.type === "image" && IMG_RE.test(it.image) ? `<img src="${it.image}" alt="" style="width:54px;height:40px;object-fit:cover;border-radius:6px;vertical-align:middle;margin-inline-end:8px;">` : ""}
      <b>${esc(it.title)}</b> <span class="badge badge-blue">${ABOUT_TYPES[it.type]}</span>
      <div style="font-size:12.5px;color:var(--ink-600);">${esc((it.text || "").slice(0, 90))}</div></div>
      <div class="actions"><button class="btn btn-ghost btn-sm" type="button" ${i === 0 ? "disabled" : ""} onclick="moveAbout('${it.id}',-1)" aria-label="أعلى">▲</button>
      <button class="btn btn-ghost btn-sm" type="button" ${i === DB.about.length - 1 ? "disabled" : ""} onclick="moveAbout('${it.id}',1)" aria-label="أسفل">▼</button>
      <button class="btn btn-ghost btn-sm" type="button" onclick="editAbout('${it.id}')">تعديل</button>
      <button class="btn btn-danger btn-sm" type="button" onclick="removeAbout('${it.id}')">حذف</button></div></div>`).join("") : `<p class="empty-note">لا يوجد محتوى بعد.</p>`;
  aboutTypeChanged();
}
function moveAbout(id, d) { DB = loadDB(); moveAboutItem(user, id, d); renderAdmin(); }
function removeAbout(id) { if (!confirm("حذف هذا المحتوى من الصفحة الرئيسية؟")) return; DB = loadDB(); deleteAboutItem(user, id); renderAdmin(); }
function editAbout(id) {
  const it = DB.about.find(x => x.id === id); if (!it) return;
  const s = (i, v) => { document.getElementById(i).value = v; };
  s("abId", it.id); s("abType2", it.type); s("abTitle2", it.title); s("abText2", it.text); s("abVidUrl", it.videoUrl || "");
  document.getElementById("abImg").value = ""; document.getElementById("abVid").value = "";
  document.getElementById("abImgHint").textContent = it.type === "image" ? "اترك الحقل فارغًا للإبقاء على الصورة الحالية." : "";
  document.getElementById("aboutFormTitle").textContent = "تعديل: " + it.title;
  document.getElementById("abSubmit2").textContent = "حفظ التعديلات";
  document.getElementById("abCancel2").style.display = "inline-flex";
  aboutTypeChanged();
  document.getElementById("aboutForm").scrollIntoView({ behavior: "smooth", block: "center" });
}
function resetAboutForm() {
  document.getElementById("aboutForm").reset();
  document.getElementById("abId").value = "";
  document.getElementById("abImgHint").textContent = "";
  document.getElementById("aboutFormTitle").textContent = "🏫 التعريف بالمؤسسة في الصفحة الرئيسية";
  document.getElementById("abSubmit2").textContent = "إضافة إلى الصفحة الرئيسية";
  document.getElementById("abCancel2").style.display = "none";
  aboutTypeChanged();
}
async function submitAbout(e) {
  e.preventDefault();
  const g = id => document.getElementById(id).value, type = g("abType2");
  const btn = document.getElementById("abSubmit2"), label = btn.textContent;
  const data = { id: g("abId") || null, type, title: g("abTitle2"), text: g("abText2"), videoUrl: g("abVidUrl") };
  let newMedia = null;
  try {
    btn.disabled = true; btn.textContent = "⏳ جارٍ الحفظ...";
    if (type === "image") { const f = document.getElementById("abImg").files[0]; if (f) data.image = (await shrinkImage(f)).dataUrl; }
    if (type === "video") {
      const f = document.getElementById("abVid").files[0];
      if (f) {
        const err = mediaCheck(f); if (err) throw new Error(err);
        if (mediaKindOf(f) !== "video") throw new Error("اختر ملف فيديو (mp4 أو webm).");
        newMedia = await mediaPut(f); data.mediaId = newMedia.id; data.mediaKind = "video";
      }
    }
    DB = loadDB();
    const r = saveAboutItem(user, data);
    if (!r.ok) { if (newMedia) mediaDelete(newMedia.id); throw new Error(r.error); }
    resetAboutForm(); renderAdmin(); flash("aboutMsg", "تم النشر في الصفحة الرئيسية.", true);
  } catch (ex) { flash("aboutMsg", ex.message, false); }
  btn.disabled = false; if (btn.textContent.startsWith("⏳")) btn.textContent = label;
  return false;
}
