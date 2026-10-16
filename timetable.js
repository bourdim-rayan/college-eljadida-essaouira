/* ===================================================================
   timetable.js — عرض استعمال الزمن بشكل الجدول المدرسي المعتمد:
   الأيام في الصفوف والساعات في الأعمدة، والحصص المتتالية تُدمج في خلية واحدة،
   مع ترويسة رسمية ولائحة الأساتذة المسندين حسب المواد.
   =================================================================== */
const TT_COLS = [8, 9, 10, 11, 14, 15, 16, 17];          // الاستراحة بين 12 و14
const TT_REGION = "جهة مراكش آسفي - مديرية الصويرة";

function schoolYearLabel() {
  const d = new Date(), y = d.getFullYear();
  return d.getMonth() >= 7 ? y + "–" + (y + 1) : (y - 1) + "–" + y;
}
function toMin(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

/* slots: حصص قسم أو أستاذ.  o = { kind: "class" | "teacher", name } */
function timetableHTML(slots, o) {
  o = o || {};
  const covers = (sl, h) => toMin(sl.start) < (h + 1) * 60 && toMin(sl.end) > h * 60;
  const extra = [];
  let total = 0;
  slots.forEach(sl => { total += (toMin(sl.end) - toMin(sl.start)) / 60; });
  const totalTxt = (Math.round(total * 10) / 10) + " h";

  const cellText = sl => {
    const exact = !/:00$/.test(sl.start) || !/:00$/.test(sl.end) ? `<small dir="ltr" style="display:block;color:#555;">${esc(sl.start)}-${esc(sl.end)}</small>` : "";
    if (o.kind === "teacher") return `<b>${esc(sl.subject)}</b><br><bdi>${esc(sl.classroom)}</bdi>${sl.room ? " · " + esc(sl.room) : ""}${exact}`;
    return `<b>${esc(sl.subject)}</b>${sl.room ? "<br>" + esc(sl.room) : ""}${exact}`;
  };

  const E = !!o.edit;   // وضع التحرير المباشر: كل خانة فارغة قابلة للنقر
  const emptyTd = (day, i) => E
    ? `<td class="tt-edit tt-empty ${i === 4 ? "tt-split" : ""}" data-day="${day}" data-h="${TT_COLS[i]}" tabindex="0" role="button" aria-label="إضافة حصة يوم ${day} على الساعة ${TT_COLS[i]}"></td>`
    : `<td class="${i === 4 ? "tt-split" : ""}"></td>`;
  const rows = DAYS.map(day => {
    const list = slots.filter(s => s.day === day).sort((a, b) => a.start.localeCompare(b.start));
    if (!list.length && day === "السبت" && !E) return "";   // السبت يظهر فقط عند وجود حصص (أو في وضع التحرير)
    let col = 0, cells = "";
    list.forEach(sl => {
      const idx = TT_COLS.map((h, i) => covers(sl, h) ? i : -1).filter(i => i >= 0);
      if (!idx.length || idx[0] < col) { extra.push(sl); return; }
      const from = idx[0], to = idx[idx.length - 1];
      for (let i = col; i < from; i++) cells += emptyTd(day, i);
      cells += `<td class="tt-cell ${E ? "tt-edit" : ""} ${from === 4 ? "tt-split" : ""}" colspan="${to - from + 1}"${E ? ` data-id="${esc(sl.id)}" tabindex="0" role="button" aria-label="تعديل حصة ${esc(sl.subject)}"` : ""}>${cellText(sl)}</td>`;
      col = to + 1;
    });
    for (let i = col; i < TT_COLS.length; i++) cells += emptyTd(day, i);
    return `<tr><th class="tt-day">${day}</th>${cells}</tr>`;
  }).join("");

  const head = `<tr><th class="tt-corner"><bdi dir="ltr">${totalTxt}</bdi></th>${TT_COLS.map((h, i) => `<th class="${i === 4 ? "tt-split" : ""}"><bdi dir="ltr">${String(h).padStart(2, "0")}h - ${String(h + 1).padStart(2, "0")}h</bdi></th>`).join("")}</tr>`;

  let teachers = "";
  if (o.kind !== "teacher") {
    const map = new Map();
    slots.forEach(sl => { const t = slotTeacherName(sl); if (!map.has(sl.subject)) map.set(sl.subject, new Set()); map.get(sl.subject).add(t); });
    const items = Array.from(map.entries());
    if (items.length) {
      let tr = "";
      for (let i = 0; i < items.length; i += 3) {
        tr += "<tr>";
        for (let j = i; j < i + 3; j++) tr += items[j] ? `<td class="tt-subj">${esc(items[j][0])}</td><td>${Array.from(items[j][1]).map(esc).join("، ")}</td>` : "<td></td><td></td>";
        tr += "</tr>";
      }
      teachers = `<h4 class="tt-list-title">لائحة الأساتذة المسندين حسب المواد</h4>
        <div class="table-wrap"><table class="tt-teachers"><thead><tr>${"<th>المادة</th><th>الأستاذ</th>".repeat(3)}</tr></thead><tbody>${tr}</tbody></table></div>`;
    }
  }
  const extraTxt = extra.length ? `<p class="empty-note">حصص خارج الشبكة: ${extra.map(sl => E ? `<button type="button" class="btn btn-ghost btn-sm tt-edit-extra" data-id="${esc(sl.id)}">${esc(sl.day + " " + sl.start + "-" + sl.end + " " + sl.subject)}</button>` : esc(sl.day + " " + sl.start + "-" + sl.end + " " + sl.subject)).join(" ")}</p>` : "";
  const title = o.kind === "teacher" ? "جدول حصص الأستاذ(ة)" : "جدول حصص القسم";
  const sch = (DB.settings && DB.settings.schoolName) || "";

  return `<div class="tt-wrap">
    <div class="tt-head">
      <img src="assets/logo-blue.png" alt="" class="tt-logo">
      <div class="tt-ministry"><b>المملكة المغربية</b><br>وزارة التربية الوطنية والتعليم الأولي والرياضة</div>
    </div>
    <div class="tt-sub">${esc(TT_REGION)} - ${esc(sch)}</div>
    <div class="tt-titlebar"><span>${title} : <b class="tt-name"><bdi>${esc(o.name || "")}</bdi></b></span><span>الموسم الدراسي: <bdi dir="ltr">${schoolYearLabel()}</bdi></span></div>
    <div class="table-wrap"><table class="tt">${head}${rows}</table></div>
    ${extraTxt}${teachers}
    ${E ? "" : `<button type="button" class="btn btn-ghost btn-sm tt-print" onclick="printTimetable(this)">🖨️ طباعة / حفظ PDF</button>`}
  </div>`;
}

function printTimetable(btn) {
  const wrap = btn.closest(".tt-wrap");
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;width:0;height:0;border:0;";
  document.body.appendChild(f);
  const html = wrap.cloneNode(true);
  html.querySelectorAll(".tt-print").forEach(x => x.remove());
  f.contentDocument.open();
  f.contentDocument.write(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><link rel="stylesheet" href="css/variables.css"><link rel="stylesheet" href="css/style.css"><style>@page{size:A4 landscape;margin:10mm}body{background:#fff}</style></head><body>${html.outerHTML}</body></html>`);
  f.contentDocument.close();
  f.onload = () => { setTimeout(() => { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(() => f.remove(), 2000); }, 300); };
}
