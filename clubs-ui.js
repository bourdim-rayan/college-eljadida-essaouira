/* ===================================================================
   clubs-ui.js - عرض الأندية التي يشرف عليها الأستاذ(ة) وتنزيل اللوائح
   =================================================================== */

function renderTeacherClubs(user) {
  DB = loadDB();
  const te = getTeacherByUser(user.id);
  const box = document.getElementById("myClubsBox");
  const mine = te ? clubsOfTeacher(te.id) : [];

  const total = mine.reduce((n, c) => n + clubMemberCount(c), 0);
  const stat = document.getElementById("tMembers");
  if (stat) stat.textContent = total;
  const statClubs = document.getElementById("tClubs");
  if (statClubs) statClubs.textContent = mine.length;

  if (!mine.length) {
    box.innerHTML = `<p class="empty-note">لم تُعيَّن على أي نادٍ بعد. تعيّن الإدارة الأساتذة المسيّرين والمشرفين من لوحتها.</p>`;
    return;
  }

  box.innerHTML = mine.map(c => {
    const isManager = c.managerId === te.id;
    const members = c.memberIds.map(id => DB.students.find(s => s.id === id)).filter(Boolean);
    const others = [c.managerId].concat(c.supervisorIds || []).filter(id => id !== te.id).map(id => teacherName(id));
    return `
      <div style="padding:14px 0;border-bottom:1px dashed var(--line);">
        <div class="panel-head" style="margin-bottom:6px;">
          <h3 style="font-size:15px;display:flex;align-items:center;gap:8px;">${clubLogoHTML(c, 30)} ${esc(c.name)}</h3>
          <span class="badge ${isManager ? "badge-yellow" : "badge-blue"}">${isManager ? "مسيّر(ة)" : "مشرف(ة) مشارك(ة)"}</span>
        </div>
        <p style="color:var(--ink-600);font-size:13px;margin:0 0 6px;">${esc(c.desc)}</p>
        <p style="font-size:12.5px;color:var(--ink-600);margin:0 0 8px;">${clubMemberCount(c)} منخرط(ة)${others.length ? " • مع: " + others.map(esc).join("، ") : ""}</p>
        ${members.length ? `<table class="data-table"><thead><tr><th>التلميذ(ة)</th><th>القسم</th></tr></thead><tbody>
          ${members.map(s => { const u = getUserById(s.userId); return `<tr><td>${esc(u ? u.fullName : "—")}</td><td><bdi>${esc(s.classroom || "—")}</bdi></td></tr>`; }).join("")}
          </tbody></table>` : `<p class="empty-note">لا يوجد منخرطون مسجّلون إلكترونيًا بعد.</p>`}
        <button class="btn btn-primary btn-sm" style="margin-top:10px;" type="button" onclick="downloadClubXLSX('${c.id}')">⬇ تنزيل لائحة المنخرطين (Excel)</button>
      </div>`;
  }).join("");
}

const XLSX_HEADERS = ["الاسم الكامل", "رقم مسار", "المستوى", "القسم"];
function studentRow(s) {
  const u = getUserById(s.userId);
  return u ? [u.fullName, s.massarCode || "", s.level || "", s.classroom || ""] : null;
}

/* لائحة منخرطي نادٍ: كل معلومة في خلية مستقلة */
function downloadClubXLSX(clubId) {
  const c = DB.clubs.find(x => x.id === clubId);
  if (!c) return;
  const rows = c.memberIds.map(id => DB.students.find(x => x.id === id)).filter(Boolean).map(studentRow).filter(Boolean);
  downloadXLSX("منخرطو-" + c.name, "المنخرطون", XLSX_HEADERS, rows);
}

/* لائحة تلاميذ قسم */
function downloadClassXLSX(cls) {
  const rows = studentsOfClass(cls).map(studentRow).filter(Boolean);
  downloadXLSX("لائحة-القسم-" + cls.replace("/", "-"), "القسم " + cls.replace("/", "-"), XLSX_HEADERS, rows);
}
