/* ===================================================================
   auth.js - تسجيل الدخول والتسجيل (تجريبي في المرحلة الأولى)
   حالة الجلسة تُحفظ في sessionStorage، والحسابات في طبقة البيانات (mock-data.js).
   =================================================================== */

const ROLE_LABELS = { admin: "المدير", staff: "الإدارة", teacher: "الأستاذ(ة)", student: "التلميذ(ة)", parent: "ولي الأمر" };
const ROLE_REDIRECT = { admin: "dashboard-admin.html", staff: "dashboard-admin.html", teacher: "dashboard-teacher.html", student: "dashboard-student.html", parent: "dashboard-parent.html" };

let selectedRole = "student";

function selectRole(role, btnEl) {
  selectedRole = role;
  document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("selected"));
  if (btnEl) btnEl.classList.add("selected");
  document.getElementById("roleField").value = role;
  document.getElementById("selectedRoleLabel").textContent = ROLE_LABELS[role];
  const reg = document.getElementById("registerLink");
  if (reg) reg.style.display = (role === "student") ? "block" : "none";
}

function startSession(user) {
  sessionStorage.setItem("currentUser", JSON.stringify(user));
  const nx = new URLSearchParams(location.search).get("next");
  const safeNext = nx && /^[a-z-]+\.html(\?[\w=%&.-]*)?$/i.test(nx) && !/^(login|register|forgot-password)\.html/i.test(nx) ? nx : null;
  window.location.href = user.mustChange ? "change-password.html" : (safeNext && ["student", "teacher", "parent"].includes(user.role) ? safeNext : ROLE_REDIRECT[user.role]);
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorBox = document.getElementById("loginError");

  const user = findUser(email, password, selectedRole);
  if (!user) {
    errorBox.textContent = "البريد الإلكتروني أو كلمة المرور غير صحيحة لهذا الدور. جرّب أحد الحسابات التجريبية أسفله.";
    errorBox.style.display = "block";
    return false;
  }
  errorBox.style.display = "none";
  startSession(user);
  return false;
}

function handleRegister(event) {
  event.preventDefault();
  const errorBox = document.getElementById("registerError");
  const pw = document.getElementById("password").value;
  if (pw !== document.getElementById("password2").value) {
    errorBox.textContent = "كلمتا المرور غير متطابقتين.";
    errorBox.style.display = "block";
    return false;
  }
  const res = registerStudent(
    document.getElementById("fullName").value,
    document.getElementById("email").value,
    pw
  );
  if (!res.ok) {
    errorBox.textContent = res.error;
    errorBox.style.display = "block";
    return false;
  }
  errorBox.style.display = "none";
  startSession(res.user);
  return false;
}

const DEMO_ACCOUNTS = {
  admin: ["admin@ecolejadida.ma", "admin123", "admin"],
  teacher: ["teacher@ecolejadida.ma", "teach123", "teacher"],
  student: ["student@ecolejadida.ma", "stud123", "student"],
  student2: ["student2@ecolejadida.ma", "stud123", "student"],
  parent: ["parent@ecolejadida.ma", "parent123", "parent"],
  staff: ["staff@ecolejadida.ma", "staff123", "staff"],
};

function fillDemo(key) {
  const acc = DEMO_ACCOUNTS[key];
  if (!acc) return;
  document.getElementById("email").value = acc[0];
  document.getElementById("password").value = acc[1];
  const btn = document.querySelector(`.role-btn[data-role="${acc[2]}"]`);
  selectRole(acc[2], btn);
}

function getCurrentUser() {
  const raw = sessionStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}

function requireRole(role) {
  const u = getCurrentUser();
  const roles = [].concat(role);
  if (!u || !roles.includes(u.role)) {
    window.location.href = "login.html";
    return null;
  }
  if (u.mustChange) {   // كلمة مرور مؤقتة من المدير: يجب تغييرها أولًا
    window.location.href = "change-password.html";
    return null;
  }
  return u;
}

function logout() {
  sessionStorage.removeItem("currentUser");
  window.location.href = "index.html";
}
