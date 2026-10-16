/* ===================================================================
   reactions-ui.js — الإعجاب والتعليق على مقال أو منشور ميكروفون
   الزوار يقرؤون فقط؛ الإعجاب والتعليق لكل مستخدم مسجَّل الدخول.
   كل نص يُعرض عبر esc().
   =================================================================== */
function currentViewer() {
  try { return JSON.parse(sessionStorage.getItem("currentUser") || "null"); } catch (e) { return null; }
}
function renderReactions(boxId, kind, id) {
  DB = loadDB();
  const box = document.getElementById(boxId);
  const it = reactItem(kind, id);
  if (!it) { box.innerHTML = ""; return; }
  const me = currentViewer();
  const liked = me && it.likes.includes(me.id);
  const msgId = boxId + "Msg";
  box.innerHTML = `
    <div class="react-bar">
      <button type="button" class="like-btn ${liked ? "on" : ""}" id="${boxId}Like">${liked ? "♥" : "♡"} أعجبني (${it.likes.length})</button>
      <span style="color:var(--ink-600);">💬 ${it.comments.length} تعليق</span>
    </div>
    <div id="${msgId}" class="form-error" style="display:none;"></div>
    ${me ? `<form id="${boxId}Form" novalidate><textarea id="${boxId}Text" maxlength="500" placeholder="اكتب تعليقك…" style="width:100%;min-height:70px;margin-bottom:8px;"></textarea>
      <button class="btn btn-primary btn-sm" type="submit">نشر التعليق</button></form>`
       : `<div class="alert alert-blue">للإعجاب والتعليق <a href="login.html" style="text-decoration:underline;">سجّل الدخول</a> أولًا.</div>`}
    <div style="margin-top:14px;">${it.comments.length ? it.comments.slice().reverse().map(c => `
      <div class="comment"><small>${esc(c.authorName)} • ${esc(c.createdAt)}${me && (c.userId === me.id || hasPerm(me, kind === "mic" ? "mic" : "press")) ? ` • <a href="#" data-del="${esc(c.id)}">حذف</a>` : ""}</small><p>${esc(c.text)}</p></div>`).join("") : '<p class="empty-note">كن أول من يعلّق.</p>'}</div>`;
  const err = m => { const b = document.getElementById(msgId); b.textContent = m; b.style.display = "block"; };
  document.getElementById(boxId + "Like").onclick = () => {
    if (!me) { err("سجّل الدخول للإعجاب."); return; }
    toggleLike(me, kind, id); renderReactions(boxId, kind, id);
  };
  const f = document.getElementById(boxId + "Form");
  if (f) f.onsubmit = e => {
    e.preventDefault();
    const r = addComment(me, kind, id, document.getElementById(boxId + "Text").value);
    if (!r.ok) { err(r.error); return; }
    renderReactions(boxId, kind, id);
  };
  box.querySelectorAll("[data-del]").forEach(a => a.onclick = e => { e.preventDefault(); deleteComment(me, kind, id, a.dataset.del); renderReactions(boxId, kind, id); });
}
