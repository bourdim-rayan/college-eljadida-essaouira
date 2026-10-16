/* ===================================================================
   exams-ui.js — الإعلام بالامتحانات والفروض (للإدارة ذات الصلاحية وللأساتذة)
   الأستاذ(ة) يعلن عن أقسامه(ا) فقط، والإدارة عن كل الأقسام.
   =================================================================== */
const EXAM_TITLES = ["الفرض المحروس الأول", "الفرض المحروس الثاني", "الفرض المحروس الثالث", "الامتحان الموحد المحلي", "الامتحان الموحد الإقليمي", "امتحان تجريبي"];
let EXU = null;

function renderExams(user, boxId) {
  EXU = { user, boxId };
  DB = loadDB();
  const box = document.getElementById(boxId);
  const te = user.role === "teacher" ? getTeacherByUser(user.id) : null;
  const classes = user.role === "teacher" ? sortClasses(te ? te.classrooms : []) : sortClasses(DB.classrooms);
  const isTeacher = user.role === "teacher";
  const list = upcomingExams().filter(e => !isTeacher || classes.includes(e.classroom));

  box.innerHTML = (classes.length ? `
    <div id="exMsg" style="display:none;"></div>
    <form onsubmit="return submitExam(event)" novalidate>
      <div class="form-grid g3">
        <div class="field"><label for="exClass">القسم</label><select id="exClass">${classes.map(c => `<option>${esc(c)}</option>`).join("")}</select></div>
        <div class="field"><label for="exTitle">نوع الامتحان</label><input type="text" id="exTitle" list="exTitles" maxlength="80" placeholder="اختر أو اكتب"><datalist id="exTitles">${EXAM_TITLES.map(t => `<option value="${esc(t)}">`).join("")}</datalist></div>
        <div class="field"><label for="exSubject">المادة</label><input type="text" id="exSubject" maxlength="60" value="${esc(te && te.subjects[0] || "")}"></div>
        <div class="field"><label for="exDate">التاريخ</label><input type="date" id="exDate" dir="ltr" min="${today()}"></div>
        <div class="field"><label for="exTime">الوقت</label><input type="time" id="exTime" dir="ltr"></div>
        <div class="field"><label for="exRoom">القاعة</label><input type="text" id="exRoom" maxlength="40" placeholder="قاعة 4"></div>
      </div>
      <button class="btn btn-primary btn-sm" type="submit">📢 نشر الإعلان بالامتحان</button>
    </form>` : `<p class="empty-note">لم تُسند لك أقسام بعد، فلا يمكنك الإعلام بالامتحانات. تواصل مع الإدارة.</p>`) + `
    <h4 style="margin:20px 0 6px;font-size:14px;">الامتحانات القادمة</h4>` +
    (list.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>القسم</th><th>الامتحان</th><th>المادة</th><th>الموعد</th><th>القاعة</th><th>أعلن عنه</th><th></th></tr></thead><tbody>` +
      list.map(e => `<tr><td><bdi>${esc(e.classroom)}</bdi></td><td>${esc(e.title)}</td><td>${esc(e.subject)}</td><td><bdi>${esc(e.date)} ${esc(e.time)}</bdi></td><td>${esc(e.room || "—")}</td><td>${esc(e.createdBy)}</td>
        <td>${hasPerm(user, "exams") || e.createdById === user.id ? `<button class="btn btn-danger btn-sm" type="button" onclick="removeExam('${e.id}')">حذف</button>` : ""}</td></tr>`).join("") + `</tbody></table></div>`
      : `<p class="empty-note">لا توجد امتحانات قادمة.</p>`);
}
function exFlash(msg, ok) {
  const b = document.getElementById("exMsg"); if (!b) return;
  b.textContent = msg; b.className = ok ? "form-ok" : "form-error"; b.style.display = "block";
  if (ok) setTimeout(() => { b.style.display = "none"; }, 3500);
}
function submitExam(e) {
  e.preventDefault();
  const g = id => document.getElementById(id).value;
  const r = addExam(EXU.user, { classroom: g("exClass"), title: g("exTitle"), subject: g("exSubject"), date: g("exDate"), time: g("exTime"), room: g("exRoom") });
  if (!r.ok) { exFlash(r.error, false); return false; }
  renderExams(EXU.user, EXU.boxId);
  if (typeof renderAdmin === "function" && document.getElementById("todoExam")) renderOverview();
  exFlash("تم نشر الإعلان، وسيراه تلاميذ القسم وأولياؤهم.", true);
  return false;
}
function removeExam(id) {
  const r = deleteExam(EXU.user, id);
  if (!r.ok) { exFlash(r.error, false); return; }
  renderExams(EXU.user, EXU.boxId);
  if (document.getElementById("todoExam")) renderOverview();
}
