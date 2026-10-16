/* ===================================================================
   mock-data.js  (النسخة النهائية)
   طبقة البيانات: بيانات تجريبية بنفس بنية مخططات RealmDB الموصوفة في وثيقة
   المتطلبات + دوال المنطق (تسجيل، طلبات، أندية، أساتذة).
   التخزين في هذه المرحلة داخل localStorage بالمتصفح، وسيُستبدل لاحقًا
   باستدعاءات Realm الحقيقية دون تغيير بنية الكائنات.
   =================================================================== */

const STORAGE_KEY = "ecoleJadidaDB_v2";

const SEED = {
  users: [
    { id: "u-admin", fullName: "السيد رشيد العلوي", email: "admin@ecolejadida.ma", password: "admin123", role: "admin", avatarInitial: "ر" },
    { id: "u-teacher", fullName: "الأستاذة سعاد بنعلي", email: "teacher@ecolejadida.ma", password: "teach123", role: "teacher", avatarInitial: "س" },
    { id: "u-teacher2", fullName: "الأستاذ كريم بوزيد", email: "teacher2@ecolejadida.ma", password: "teach123", role: "teacher", avatarInitial: "ك" },
    { id: "u-teacher3", fullName: "الأستاذ يوسف الحمداوي", email: "teacher3@ecolejadida.ma", password: "teach123", role: "teacher", avatarInitial: "ي" },
    { id: "u-teacher4", fullName: "الأستاذة نادية شاكر", email: "teacher4@ecolejadida.ma", password: "teach123", role: "teacher", avatarInitial: "ن" },
    { id: "u-student", fullName: "ياسين الفاسي", email: "student@ecolejadida.ma", password: "stud123", role: "student", avatarInitial: "ي" },
    { id: "u-student2", fullName: "منى العلمي", email: "student2@ecolejadida.ma", password: "stud123", role: "student", avatarInitial: "م" },
    { id: "u-student3", fullName: "سلمى بنموسى", email: "student3@ecolejadida.ma", password: "stud123", role: "student", avatarInitial: "س" },
    { id: "u-student4", fullName: "عبد الرحيم توفيق", email: "student4@ecolejadida.ma", password: "stud123", role: "student", avatarInitial: "ع" },
    { id: "u-staff", fullName: "السيد أحمد المرابط", email: "staff@ecolejadida.ma", password: "staff123", role: "staff", avatarInitial: "أ" },
    { id: "u-parent", fullName: "السيدة خديجة الفاسي", email: "parent@ecolejadida.ma", password: "parent123", role: "parent", avatarInitial: "خ" },
  ],

  /* status: no_request | pending | rejected | approved
     licenseRequest: none | pending | rejected (طلب رخصة الصحافة المدرسية)
     ملاحظة: المعدل والرتبة والغياب غير مخزّنة هنا لأن منظومة وطنية مستقلة تتكفل بها. */
  students: [
    { id: "st-1", userId: "u-student", massarCode: "G123456789", level: "الثالثة إعدادي", classroom: "3/1", parentId: "pa-1", journalistLicense: true, licenseRequest: "none", licenseNote: "", status: "approved" },
    { id: "st-2", userId: "u-student2", massarCode: null, level: null, classroom: null, parentId: null, journalistLicense: false, licenseRequest: "none", licenseNote: "", status: "pending" },
    { id: "st-3", userId: "u-student3", massarCode: "H234567891", level: "الثانية إعدادي", classroom: "2/2", parentId: null, journalistLicense: false, licenseRequest: "pending", licenseNote: "أحب الكتابة وأرغب في المساهمة في المجلة المدرسية.", status: "approved" },
    { id: "st-4", userId: "u-student4", massarCode: "J345678912", level: "الثالثة إعدادي", classroom: "3/3", parentId: null, journalistLicense: false, licenseRequest: "pending", licenseNote: "أنجزت بحثًا ميدانيًا حول البيئة وأريد نشره.", status: "approved" },
  ],

  /* أعضاء الإدارة: حسابات ينشئها المدير مع تحديد المنصب والصلاحيات */
  staff: [
    { id: "sf-1", userId: "u-staff", title: "الحارس العام", permissions: ["students", "schedules", "exams", "lists", "announcements"] },
  ],

  /* أساتذة مكلَّفون من الإدارة بالنشر في الميكروفون التربوي */
  micEditors: ["te-1"],
  radioEditors: ["te-1"],
  about: [
    { id: "ab-intro", type: "text", title: "نبذة عن المؤسسة", text: "الثانوية الإعدادية الجديدة مؤسسة تعليمية عمومية بمدينة الصويرة، تسعى إلى تكوين تلميذ متشبع بقيم المواطنة ومنفتح على محيطه الثقافي والبيئي. تضم المؤسسة أقسامًا للمستويات الثلاثة، وأندية موازية، ومجلة إلكترونية، وإذاعة مدرسية.", image: "", mediaId: "", mediaKind: "", videoUrl: "", createdAt: "2026-10-01" },
  ],
  broadcasts: [
    { id: "br-1", type: "ندوة", title: "التوجيه المدرسي: كيف أختار مساري بعد الثالثة إعدادي؟", description: "لقاء مباشر مع مستشار التوجيه للإجابة عن أسئلة التلاميذ وأوليائهم.", guests: "مستشار التوجيه التربوي", scheduledAt: "2026-10-22T10:00", streamUrl: "", status: "scheduled", hostId: "u-admin", hostName: "الإدارة", recordingMediaId: "", recordingKind: "", recordingUrl: "", startedAt: "", endedAt: "" },
  ],

  teachers: [
    { id: "te-1", userId: "u-teacher", subjects: ["اللغة الفرنسية"], classrooms: ["3/1", "3/2", "2/3"] },
    { id: "te-2", userId: "u-teacher2", subjects: ["الرياضيات"], classrooms: ["2/3", "3/1"] },
    { id: "te-3", userId: "u-teacher3", subjects: ["التربية البدنية"], classrooms: ["1/1", "2/1"] },
    { id: "te-4", userId: "u-teacher4", subjects: ["الفيزياء والكيمياء"], classrooms: ["3/1", "3/2"] },
  ],

  parents: [
    { id: "pa-1", userId: "u-parent", childrenIds: ["st-1"] },
  ],

  /* طلبات فتح ملف التلميذ لدى الإدارة */
  requests: [
    { id: "rq-1", studentId: "st-2", fullName: "منى العلمي", massarCode: "K987654321", level: "الثانية إعدادي", classroom: "2/2",
      birthDate: "2012-04-18", guardianPhone: "0661000000", note: "تلميذة جديدة بالمؤسسة هذه السنة.", docName: "شهادة_مدرسية.pdf",
      status: "pending", reason: "", submittedAt: "2026-10-06", reviewedAt: null },
  ],

  /* الأندية: managerId = الأستاذ المسيّر، supervisorIds = أساتذة مشرفون مشاركون */
  clubs: [
    { id: "cl-1", name: "الارتجال والمسرح", icon: "🎭", desc: "تعلم فنون التعبير والإلقاء والارتجال المسرحي.", baseMembers: 22, managerId: "te-2", supervisorIds: [], memberIds: [] },
    { id: "cl-2", name: "الكتابة الإبداعية", icon: "✍️", desc: "ورشات كتابة القصة والشعر، وإصدار المجلة المدرسية.", baseMembers: 17, managerId: "te-1", supervisorIds: [], memberIds: ["st-1"] },
    { id: "cl-3", name: "الفنون التشكيلية", icon: "🎨", desc: "الرسم والنحت وتقنيات التلوين المختلفة.", baseMembers: 26, managerId: "te-4", supervisorIds: [], memberIds: [] },
    { id: "cl-4", name: "التفتح العلمي", icon: "🔬", desc: "تجارب علمية وروبوتيك ومشاريع STEM.", baseMembers: 20, managerId: "te-4", supervisorIds: ["te-2"], memberIds: [] },
    { id: "cl-5", name: "كرة القدم", icon: "⚽", desc: "التدريب والمشاركة في البطولات المدرسية.", baseMembers: 30, managerId: "te-3", supervisorIds: [], memberIds: [] },
    { id: "cl-6", name: "كرة السلة", icon: "🏀", desc: "تكوين رياضي تنافسي على مستوى الأقسام.", baseMembers: 24, managerId: "te-3", supervisorIds: [], memberIds: [] },
  ],

  classrooms: ["1/1", "1/2", "2/1", "2/2", "2/3", "3/1", "3/2", "3/3"],

  /* استعمال الزمن: لكل حصة id وربما teacherId (الأستاذ المعيَّن) */
  scheduleSlots: [
    { id: "sl-1", classroom: "3/1", day: "الإثنين", start: "08:00", end: "09:00", subject: "الرياضيات", teacherId: "te-2", room: "قاعة 4" },
    { id: "sl-2", classroom: "3/1", day: "الإثنين", start: "09:00", end: "10:00", subject: "اللغة الفرنسية", teacherId: "te-1", room: "قاعة 4" },
    { id: "sl-11", classroom: "3/1", day: "الإثنين", start: "14:00", end: "16:00", subject: "الفيزياء والكيمياء", teacherId: "te-4", room: "المختبر 1" },
    { id: "sl-3", classroom: "3/1", day: "الثلاثاء", start: "08:00", end: "09:00", subject: "الفيزياء والكيمياء", teacherId: "te-4", room: "المختبر 1" },
    { id: "sl-12", classroom: "3/1", day: "الثلاثاء", start: "11:00", end: "12:00", subject: "الرياضيات", teacherId: "te-2", room: "قاعة 4" },
    { id: "sl-13", classroom: "3/1", day: "الأربعاء", start: "08:00", end: "10:00", subject: "اللغة العربية", teacherId: null, teacher: "أ. عمر الزياني", room: "قاعة 4" },
    { id: "sl-4", classroom: "3/1", day: "الأربعاء", start: "10:00", end: "11:00", subject: "اللغة العربية", teacherId: null, teacher: "أ. عمر الزياني", room: "قاعة 4" },
    { id: "sl-5", classroom: "3/1", day: "الخميس", start: "08:00", end: "09:00", subject: "الاجتماعيات", teacherId: null, teacher: "أ. مريم الإدريسي", room: "قاعة 4" },
    { id: "sl-14", classroom: "3/1", day: "الخميس", start: "14:00", end: "15:00", subject: "اللغة الفرنسية", teacherId: "te-1", room: "قاعة 4" },
    { id: "sl-6", classroom: "3/1", day: "الجمعة", start: "09:00", end: "10:00", subject: "التربية البدنية", teacherId: "te-3", room: "الملعب" },
    { id: "sl-7", classroom: "3/2", day: "الإثنين", start: "08:00", end: "09:00", subject: "اللغة الفرنسية", teacherId: "te-1", room: "قاعة 5" },
    { id: "sl-8", classroom: "3/2", day: "الثلاثاء", start: "10:00", end: "11:00", subject: "الرياضيات", teacherId: "te-2", room: "قاعة 5" },
    { id: "sl-9", classroom: "2/3", day: "الأربعاء", start: "14:00", end: "15:00", subject: "الرياضيات", teacherId: "te-2", room: "قاعة 2" },
    { id: "sl-10", classroom: "2/3", day: "الخميس", start: "10:00", end: "11:00", subject: "اللغة الفرنسية", teacherId: "te-1", room: "قاعة 2" },
  ],
  /* الأقسام المنشور استعمال زمنها (يراه التلاميذ والأولياء والزوار) */
  schedulePublished: { "3/1": true },
  /* ملف استعمال زمن اختياري لكل قسم (PDF أو صورة) */
  scheduleFiles: {},

  exams: [
    { id: "ex-1", title: "الفرض المحروس الأول", subject: "الرياضيات", classroom: "3/1", date: "2026-10-26", time: "09:00", room: "قاعة 4", createdBy: "الإدارة", createdById: "u-admin" },
    { id: "ex-2", title: "الفرض المحروس الأول", subject: "اللغة الفرنسية", classroom: "3/1", date: "2026-10-28", time: "10:30", room: "قاعة 4", createdBy: "الأستاذة سعاد بنعلي", createdById: "u-teacher" },
    { id: "ex-3", title: "الامتحان الموحد المحلي", subject: "جميع المواد", classroom: "3/1", date: "2026-12-14", time: "08:30", room: "قاعات الامتحان", createdBy: "الإدارة", createdById: "u-admin" },
  ],

  /* الميكروفون التربوي: النشر للإدارة والأساتذة المكلَّفين فقط */
  micPosts: [
    { id: "mc-1", type: "بودكاست", title: "حكايات من الصويرة القديمة", description: "حلقة صوتية عن ذاكرة المدينة يرويها كبار السن لتلاميذ نادي الكتابة.", mediaUrl: "", authorId: "u-teacher", authorName: "الأستاذة سعاد بنعلي", createdAt: "2026-10-01", likes: [], comments: [] },
    { id: "mc-2", type: "وثائقي قصير", title: "يوم في المؤسسة", description: "ربورتاج مصور ينقل الحياة اليومية داخل الثانوية.", mediaUrl: "", authorId: "u-admin", authorName: "السيد رشيد العلوي", createdAt: "2026-10-03", likes: [], comments: [] },
    { id: "mc-3", type: "حوار", title: "نقاش: البيئة والمسؤولية", description: "حوار مع نادي التفتح العلمي حول قضايا بيئية محلية.", mediaUrl: "", authorId: "u-admin", authorName: "السيد رشيد العلوي", createdAt: "2026-10-05", likes: [], comments: [] },
  ],

  /* status: pending | published | revision */
  articles: [
    { id: "ar-1", title: "الصويرة: مدينة الرياح والفنون", category: "تاريخ", authorId: "u-student", authorName: "ياسين الفاسي", status: "published", isArticleOfMonth: true, createdAt: "2026-09-18", publishedAt: "2026-09-20", reviewNote: "",
      excerpt: "جولة في تاريخ مدينة الصويرة وعلاقتها بالتجارة البحرية والموسيقى الكناوية عبر العصور.",
      content: "تقف مدينة الصويرة على ساحل الأطلسي كأنها سفينة رست منذ قرون بين الريح والموج. أسسها السلطان سيدي محمد بن عبد الله في القرن الثامن عشر لتكون ميناءً تجاريًا يربط المغرب بأوروبا وإفريقيا جنوب الصحراء.\n\nاشتهرت المدينة بأسوارها وأبراجها المطلة على البحر، وبأزقتها البيضاء الزرقاء التي تحتضن الحرفيين وصناع الخشب العطري. وقد صنّفتها منظمة اليونسكو تراثًا عالميًا لما تحمله من تمازج معماري وثقافي نادر.\n\nوتعد الموسيقى الكناوية روح الصويرة النابضة؛ ففي كل صيف يلتقي فنانون من العالم في مهرجان كناوة وموسيقى العالم، فتصير المدينة مسرحًا مفتوحًا للتسامح والحوار بين الثقافات." },
    { id: "ar-2", title: "تجربتي في نادي الكتابة الإبداعية", category: "أدب", authorId: "u-student3", authorName: "سلمى بنموسى", status: "published", isArticleOfMonth: false, createdAt: "2026-09-25", publishedAt: "2026-09-28", reviewNote: "",
      excerpt: "كيف ساعدني الانخراط في نادي الكتابة على اكتشاف شغفي بالقصة القصيرة.",
      content: "لم أكن أتخيل أن ورقة بيضاء قد تصبح صديقتي المفضلة. حين انضممت إلى نادي الكتابة الإبداعية كنت خجولة، أخشى قراءة ما أكتبه أمام زملائي.\n\nشيئًا فشيئًا، علّمتنا الأستاذة أن الكتابة ليست موهبة فقط بل تمرين يومي؛ نلاحظ ما حولنا، ندوّن التفاصيل الصغيرة، ثم نعيد صياغتها حتى تنطق.\n\nاليوم أكتب قصتي القصيرة الأولى عن بحر الصويرة وصياديها، وأدعو كل تلميذ يحب الحكايات إلى تجربة هذه الورشات." },
    { id: "ar-3", title: "التلوث البلاستيكي وتأثيره على الشاطئ", category: "علوم", authorId: "u-student4", authorName: "عبد الرحيم توفيق", status: "published", isArticleOfMonth: false, createdAt: "2026-09-30", publishedAt: "2026-10-03", reviewNote: "",
      excerpt: "دراسة ميدانية أنجزها تلاميذ نادي البيئة حول واقع النفايات البلاستيكية بشاطئ المدينة.",
      content: "خلال حصة ميدانية على شاطئ الصويرة، قام تلاميذ نادي البيئة بجمع النفايات الموجودة على مساحة محددة وتصنيفها حسب نوعها.\n\nأظهرت النتائج أن البلاستيك يشكل أكثر من نصف ما جُمع، وأن القنينات والأكياس تتصدر القائمة. وتؤثر هذه المخلفات على الطيور البحرية والأسماك كما تشوّه جمال المكان.\n\nنقترح تعميم حاويات الفرز، وتنظيم حملات تنظيف دورية، وتشجيع استعمال الأكياس القابلة لإعادة الاستعمال." },
    { id: "ar-4", title: "مسرحية 'أمواج' تتألق في المهرجان الجهوي", category: "فنون", authorId: null, authorName: "نادي الارتجال والمسرح", status: "pending", isArticleOfMonth: false, createdAt: "2026-10-08", publishedAt: null, reviewNote: "",
      excerpt: "مقال قيد المراجعة من طرف الأستاذ المشرف قبل النشر الرسمي.",
      content: "شارك نادي الارتجال والمسرح بمؤسستنا في المهرجان الجهوي للمسرح المدرسي بمسرحية بعنوان «أمواج»، تحكي قصة صياد صغير يواجه البحر ليحمي حلمه.\n\nنالت المسرحية إعجاب لجنة التحكيم والجمهور بفضل الأداء الجماعي المتناسق والإضاءة البسيطة المعبرة، وحصل الفريق على تنويه خاص." },
  ],

  announcements: [
    { id: "an-1", title: "حفل التميز السنوي", type: "حدث", date: "2026-11-20", urgent: false },
    { id: "an-2", title: "انطلاق التسجيل في الأندية المدرسية", type: "إعلان", date: "2026-10-12", urgent: true },
    { id: "an-3", title: "توزيع الكتب المدرسية المستعملة", type: "إعلان", date: "2026-10-15", urgent: false },
  ],

  teacherAbsences: [
    { id: "ab-1", teacher: "أ. كريم بوزيد", kind: "sessions", dateFrom: "", dateTo: "", sessions: [{ classroom: "2/3", start: "10:30", end: "11:30" }], subject: "الرياضيات", reason: "عذر طبي", status: "غياب مؤكد" },
    { id: "ab-2", teacher: "أ. مريم الإدريسي", kind: "sessions", dateFrom: "", dateTo: "", sessions: [{ classroom: "1/2", start: "14:00", end: "15:00" }], subject: "الاجتماعيات", reason: "مهمة إدارية", status: "حصة شاغرة" },
  ],

  /* معلومات المؤسسة: يعدّلها المدير من لوحته وتظهر في كل صفحات الموقع */
  settings: {
    schoolName: "الثانوية الإعدادية الجديدة",
    city: "الصويرة",
    tagline: "الصويرة - المملكة المغربية",
    address: "شارع المسيرة الخضراء، حي الصويرة الجديدة، الصويرة، المملكة المغربية.",
    email: "contact@ecolejadida.ma",
    phone: "0524-00-00-00",
    fax: "0524-00-00-01",
    facebook: "", youtube: "", instagram: "", whatsapp: "",
    heroEyebrow: "موقع المؤسسة الرسمي",
    heroTitle: "بوابتكم الرقمية نحو مدرسة الغد بالصويرة",
    heroLead: "فضاء رقمي موحّد يجمع الإدارة والأساتذة والتلاميذ وأولياء الأمور: استعمالات الزمن، المجلة المدرسية، الأندية، والأخبار العاجلة في مكان واحد.",
    eventTitle: "حفل التميز السنوي",
    eventDate: "2026-11-20T09:00",
    ticker: [
      "انطلاق التسجيل في الأندية المدرسية ابتداءً من 12 أكتوبر",
      "توزيع الكتب المدرسية المستعملة يوم 15 أكتوبر بالساحة الرئيسية",
      "الفروض المحروسة الأولى تنطلق يوم 26 أكتوبر",
    ],
  },

  stats: {
    successRate: 91.4, regionalExamRate: 87.2, totalStudents: 612, maleCount: 298, femaleCount: 314,
    classroomsCount: 18, dropoutRate: 1.2,
    yearly: [ {y:"2022",v:83}, {y:"2023",v:86}, {y:"2024",v:88.5}, {y:"2025",v:89.7}, {y:"2026",v:91.4} ],
  },
};

/* ---------- التخزين ---------- */
function cloneJSON(o) { return JSON.parse(JSON.stringify(o)); }

const TEACHER_BY_LABEL = { "أ. كريم بوزيد": "te-2", "أ. سعاد بنعلي": "te-1", "أ. نادية شاكر": "te-4", "أ. يوسف الحمداوي": "te-3" };

/* دمج البيانات المحفوظة سابقًا مع الحقول الجديدة (ترقية بدون فقدان أي بيانات) */
function migrateDB(db) {
  db.settings = Object.assign(cloneJSON(SEED.settings), db.settings || {});
  db.stats = Object.assign(cloneJSON(SEED.stats), db.stats || {});

  const oldVersion = !db.classrooms;   // نسخة قبل إضافة الأقسام والمقالات الكاملة
  if (oldVersion) {
    db.classrooms = cloneJSON(SEED.classrooms);
    db.schedulePublished = cloneJSON(SEED.schedulePublished);
    db.scheduleFiles = {};
    SEED.users.forEach(u => { if (!db.users.some(x => x.id === u.id)) db.users.push(cloneJSON(u)); });
    SEED.students.forEach(x => { if (!db.students.some(y => y.id === x.id)) db.students.push(cloneJSON(x)); });
  }
  /* حصص العرض التجريبية: نعتمد أوقات الساعات الكاملة ليتطابق الجدول مع شبكة الساعات */
  SEED.scheduleSlots.forEach(sd => {
    const ex = db.scheduleSlots.find(x => x.id === sd.id);
    if (!ex) { if (!db.seedSlotsV6) db.scheduleSlots.push(cloneJSON(sd)); }
    else if (/:30$/.test(ex.start) || /:30$/.test(ex.end)) { ex.start = sd.start; ex.end = sd.end; }
  });
  db.seedSlotsV6 = true;   // الحصص التجريبية الجديدة تُضاف مرة واحدة فقط (حتى لا تعود حصة حذفها المدير)
  db.schedulePublished = db.schedulePublished || {};
  db.scheduleFiles = db.scheduleFiles || {};

  /* حقول النسخة 4 (تُضاف دائمًا إن غابت، بدون فقدان أي بيانات) */
  SEED.users.filter(u => u.role === "staff").forEach(u => { if (!db.users.some(x => x.id === u.id)) db.users.push(cloneJSON(u)); });
  if (!db.staff) db.staff = cloneJSON(SEED.staff);
  if (!db.micEditors) db.micEditors = cloneJSON(SEED.micEditors);
  if (!db.radioEditors) db.radioEditors = cloneJSON(SEED.radioEditors);
  if (!db.about) db.about = cloneJSON(SEED.about);
  if (!db.broadcasts) db.broadcasts = cloneJSON(SEED.broadcasts);
  if (!db.micPosts) db.micPosts = cloneJSON(SEED.micPosts);
  if (!db.resetRequests) db.resetRequests = [];
  if (!db.resetLog) db.resetLog = [];
  (db.exams || []).forEach(e => { if (!e.id) e.id = uid("ex"); if (!e.createdBy) { e.createdBy = "الإدارة"; e.createdById = "u-admin"; } });
  (db.announcements || []).forEach(a => { if (!a.id) a.id = uid("an"); });
  (db.teacherAbsences || []).forEach(a => {
    if (!a.id) a.id = uid("ab");
    if (!a.kind) {   // ترحيل الصيغة القديمة (قسم + وقت) إلى الصيغة الجديدة
      const m = String(a.time || "").match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
      a.kind = "sessions"; a.dateFrom = ""; a.dateTo = "";
      a.sessions = a.classroom && m ? [{ classroom: a.classroom, start: m[1], end: m[2] }] : [];
    }
  });
  (db.articles || []).forEach(a => { if (!a.images) a.images = []; if (!a.likes) a.likes = []; if (!a.comments) a.comments = []; });

  /* ترحيل صيغة رقم مسار القديمة (123456789G) إلى الصيغة الصحيحة (G123456789) */
  const fixMassar = o => { if (o && /^\d{9}[A-Za-z]$/.test(o.massarCode || "")) o.massarCode = (o.massarCode.slice(9) + o.massarCode.slice(0, 9)).toUpperCase(); };
  (db.students || []).forEach(fixMassar);
  (db.requests || []).forEach(fixMassar);
  (db.students || []).forEach(st => {
    delete st.rank; delete st.average; delete st.absencesCount;
    if (!st.licenseRequest) st.licenseRequest = "none";
    if (st.licenseNote == null) st.licenseNote = "";
  });
  (db.scheduleSlots || []).forEach(sl => {
    if (!sl.id) sl.id = uid("sl");
    if (sl.teacherId === undefined) sl.teacherId = TEACHER_BY_LABEL[sl.teacher] || null;
  });
  (db.articles || []).forEach(a => {
    const seed = SEED.articles.find(x => x.id === a.id);
    if (a.content == null) a.content = seed ? seed.content : (a.excerpt || "");
    if (a.authorName == null) a.authorName = a.author || "—";
    delete a.author;
    if (a.authorId === undefined) a.authorId = seed ? seed.authorId : null;
    if (!a.createdAt) a.createdAt = seed ? seed.createdAt : today();
    if (a.publishedAt === undefined) a.publishedAt = a.status === "published" ? (seed ? seed.publishedAt : today()) : null;
    if (a.reviewNote == null) a.reviewNote = "";
  });
  return db;
}

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateDB(JSON.parse(raw));
  } catch (e) { /* التخزين غير متاح: نستعمل البيانات الأولية */ }
  return cloneJSON(SEED);
}
let DB = loadDB();

function saveDB() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); return true; } catch (e) { return false; }
}
function resetDB() {
  try { localStorage.removeItem(STORAGE_KEY); sessionStorage.removeItem("currentUser"); } catch (e) {}
  location.reload();
}

/* ---------- أدوات مساعدة ---------- */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function uid(prefix) { return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function today() { return new Date().toISOString().slice(0, 10); }

function getUserById(id) { return DB.users.find(u => u.id === id); }
function getStudentByUser(userId) { return DB.students.find(s => s.userId === userId); }
function getTeacherByUser(userId) { return DB.teachers.find(t => t.userId === userId); }
function teacherName(teId) {
  const t = DB.teachers.find(x => x.id === teId);
  const u = t && getUserById(t.userId);
  return u ? u.fullName : "—";
}
function clubMemberCount(c) { return (c.baseMembers || 0) + (c.memberIds || []).length; }
function clubsOfTeacher(teId) { return DB.clubs.filter(c => c.managerId === teId || (c.supervisorIds || []).includes(teId)); }
function clubsOfStudent(stId) { return DB.clubs.filter(c => (c.memberIds || []).includes(stId)); }
function lastRequestOf(studentId) {
  const list = DB.requests.filter(r => r.studentId === studentId);
  return list.length ? list[list.length - 1] : null;
}

function findUser(email, password, role) {
  const e = String(email).trim().toLowerCase();
  return DB.users.find(u => u.email.toLowerCase() === e && u.password === password && u.role === role);
}

/* ---------- التسجيل ---------- */
function registerStudent(fullName, email, password) {
  const name = String(fullName || "").trim();
  const mail = String(email || "").trim().toLowerCase();
  if (name.length < 3) return { ok: false, error: "أدخل اسمك الكامل (3 أحرف على الأقل)." };
  if (!/^\S+@\S+\.\S+$/.test(mail)) return { ok: false, error: "البريد الإلكتروني غير صالح." };
  if (String(password || "").length < 6) return { ok: false, error: "كلمة المرور يجب ألا تقل عن 6 أحرف." };
  if (DB.users.some(u => u.email.toLowerCase() === mail)) return { ok: false, error: "هذا البريد الإلكتروني مسجّل من قبل." };

  const user = { id: uid("u"), fullName: name, email: mail, password: password, role: "student", avatarInitial: name.charAt(0) };
  DB.users.push(user);
  DB.students.push({ id: uid("st"), userId: user.id, massarCode: null, level: null, classroom: null, parentId: null,
                     journalistLicense: false, licenseRequest: "none", licenseNote: "", status: "no_request" });
  saveDB();
  return { ok: true, user };
}

/* ---------- طلب فتح الملف (التلميذ ← الإدارة) ---------- */
const MASSAR_RE = /^[A-Z]\d{9}$/;   // الحرف أولًا ثم 9 أرقام: G123456789
const CLASS_RE = /^[1-3]\/\d{1,2}$/;

function submitEnrollmentRequest(studentId, data) {
  const st = DB.students.find(s => s.id === studentId);
  if (!st) return { ok: false, error: "حساب التلميذ غير موجود." };
  if (st.status === "pending") return { ok: false, error: "لديك طلب قيد الدراسة بالفعل." };
  if (st.status === "approved") return { ok: false, error: "تمت الموافقة على ملفك من قبل." };

  const d = {
    fullName: String(data.fullName || "").trim(),
    massarCode: String(data.massarCode || "").trim().toUpperCase(),
    level: String(data.level || "").trim(),
    classroom: String(data.classroom || "").trim(),
    birthDate: String(data.birthDate || "").trim(),
    guardianPhone: String(data.guardianPhone || "").trim(),
    note: String(data.note || "").trim(),
    docName: String(data.docName || "").trim(),
  };
  if (d.fullName.length < 3) return { ok: false, error: "الاسم الكامل مطلوب." };
  if (!MASSAR_RE.test(d.massarCode)) return { ok: false, error: "رقم مسار غير صالح. يبدأ بحرف واحد ثم 9 أرقام، مثال: G123456789." };
  if (!d.level) return { ok: false, error: "اختر المستوى الدراسي." };
  if (!CLASS_RE.test(d.classroom)) return { ok: false, error: "رقم القسم غير صالح. مثال: 3/1." };
  if (!d.birthDate) return { ok: false, error: "تاريخ الازدياد مطلوب." };
  if (!/^0\d{9}$/.test(d.guardianPhone)) return { ok: false, error: "هاتف ولي الأمر يجب أن يكون 10 أرقام ويبدأ بصفر." };

  const taken = DB.students.some(s => s.id !== studentId && s.massarCode === d.massarCode && s.status === "approved");
  if (taken) return { ok: false, error: "رقم مسار هذا مرتبط بحساب آخر. تواصل مع الإدارة." };

  DB.requests.push(Object.assign({ id: uid("rq"), studentId, status: "pending", reason: "", submittedAt: today(), reviewedAt: null }, d));
  st.status = "pending";
  saveDB();
  return { ok: true };
}

/* ---------- معاينة الإدارة للطلب ---------- */
function reviewRequest(requestId, decision, reason) {
  const rq = DB.requests.find(r => r.id === requestId);
  if (!rq || rq.status !== "pending") return { ok: false, error: "الطلب غير موجود أو تمت معالجته." };
  const st = DB.students.find(s => s.id === rq.studentId);
  if (!st) return { ok: false, error: "حساب التلميذ غير موجود." };

  if (decision === "approved") {
    rq.status = "approved";
    st.status = "approved";
    st.massarCode = rq.massarCode;
    st.level = rq.level;
    st.classroom = rq.classroom;
  } else if (decision === "rejected") {
    if (!String(reason || "").trim()) return { ok: false, error: "اكتب سبب الرفض ليتمكن التلميذ من تصحيح طلبه." };
    rq.status = "rejected";
    rq.reason = String(reason).trim();
    st.status = "rejected";
  } else {
    return { ok: false, error: "قرار غير معروف." };
  }
  rq.reviewedAt = today();
  saveDB();
  return { ok: true };
}

/* ---------- الأندية ---------- */
function saveClub(data) {
  const name = String(data.name || "").trim();
  if (name.length < 3) return { ok: false, error: "اسم النادي مطلوب (3 أحرف على الأقل)." };
  if (!DB.teachers.some(t => t.id === data.managerId)) return { ok: false, error: "اختر الأستاذ(ة) المسيّر(ة) للنادي." };
  const dup = DB.clubs.some(c => c.name === name && c.id !== data.id);
  if (dup) return { ok: false, error: "يوجد نادٍ بنفس الاسم." };

  const supervisorIds = (data.supervisorIds || []).filter(id => id !== data.managerId && DB.teachers.some(t => t.id === id));
  const fields = { name, desc: String(data.desc || "").trim(), icon: data.icon || "🎯", managerId: data.managerId, supervisorIds };
  /* شعار النادي: رمز تعبيري (icon) أو صورة (logo)، ويمكن الجمع؛ الصورة تُعرض أولًا إن وُجدت */
  if (data.logo) {
    if (!IMG_RE.test(data.logo) || data.logo.length > 400000) return { ok: false, error: "صورة شعار النادي غير صالحة (PNG أو JPG أو WebP وبحجم صغير)." };
    fields.logo = data.logo;
  } else if (data.removeLogo) fields.logo = "";

  if (data.id) {
    const club = DB.clubs.find(c => c.id === data.id);
    if (!club) return { ok: false, error: "النادي غير موجود." };
    Object.assign(club, fields);
    saveDB();
    return { ok: true, club };
  }
  const club = Object.assign({ id: uid("cl"), baseMembers: 0, memberIds: [] }, fields);
  DB.clubs.push(club);
  saveDB();
  return { ok: true, club };
}

/* HTML لشعار النادي: الصورة إن وُجدت وإلا الرمز التعبيري */
function clubLogoHTML(c, size) {
  const px = size || 44;
  if (c && c.logo && IMG_RE.test(c.logo)) return `<img class="club-logo" src="${c.logo}" alt="شعار ${esc(c.name)}" style="width:${px}px;height:${px}px;">`;
  return `<span class="club-emoji" style="font-size:${Math.round(px * 0.8)}px;">${esc((c && c.icon) || "🎯")}</span>`;
}
/* تصغير صورة الشعار إلى 256px مع الحفاظ على الشفافية */
function shrinkLogo(file) {
  return new Promise((resolve, reject) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return reject(new Error("صيغة الصورة غير مدعومة (PNG أو JPG أو WebP)."));
    if (file.size > 8 * 1024 * 1024) return reject(new Error("الصورة كبيرة جدًا."));
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, 256 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("تعذرت قراءة الصورة.")); };
    img.src = url;
  });
}

function deleteClub(id) {
  const i = DB.clubs.findIndex(c => c.id === id);
  if (i < 0) return { ok: false };
  DB.clubs.splice(i, 1);
  saveDB();
  return { ok: true };
}

function toggleClubMembership(clubId, studentId) {
  const st = DB.students.find(s => s.id === studentId);
  const club = DB.clubs.find(c => c.id === clubId);
  if (!st || !club) return { ok: false, error: "بيانات غير صالحة." };
  if (st.status !== "approved") return { ok: false, error: "يجب أن تتم الموافقة على ملفك أولًا." };
  const i = club.memberIds.indexOf(studentId);
  if (i >= 0) club.memberIds.splice(i, 1); else club.memberIds.push(studentId);
  saveDB();
  return { ok: true, joined: i < 0 };
}

/* ---------- الأساتذة ---------- */
const DAYS = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
function hourOptions(selected) { return HOURS.map(h => `<option value="${h}" ${h === selected ? "selected" : ""}>${h.slice(0, 2)}h</option>`).join(""); }

/* data: fullName, email, password, subject, classrooms[], slots[{classroom,day,start,end,subject,room}]
   تُنشأ كل البيانات دفعة واحدة، وعند أي خطأ لا يُحفظ شيء. */
function addTeacher(data) {
  const name = String(data.fullName || "").trim();
  const mail = String(data.email || "").trim().toLowerCase();
  if (name.length < 3) return { ok: false, error: "اسم الأستاذ(ة) مطلوب." };
  if (!/^\S+@\S+\.\S+$/.test(mail)) return { ok: false, error: "البريد الإلكتروني غير صالح." };
  if (String(data.password || "").length < 6) return { ok: false, error: "كلمة المرور يجب ألا تقل عن 6 أحرف." };
  if (DB.users.some(u => u.email.toLowerCase() === mail)) return { ok: false, error: "هذا البريد الإلكتروني مسجّل من قبل." };

  const subject = String(data.subject || "").trim();
  const classrooms = [...new Set((data.classrooms || []).map(String))];
  if (classrooms.some(c => !DB.classrooms.includes(c))) return { ok: false, error: "قسم غير معروف في اللائحة." };
  const slotsIn = data.slots || [];

  const teId = uid("te");
  const added = [];
  for (const raw of slotsIn) {
    if (!classrooms.includes(raw.classroom)) return { ok: false, error: "كل حصة يجب أن تكون في قسم من الأقسام المسندة إلى الأستاذ(ة)." };
    const r = addSlot(Object.assign({}, raw, { teacherId: teId, subject: raw.subject || subject }), true);
    if (!r.ok) { added.forEach(sl => DB.scheduleSlots.splice(DB.scheduleSlots.indexOf(sl), 1)); return r; }
    added.push(r.slot);
  }

  const user = { id: uid("u"), fullName: name, email: mail, password: data.password, role: "teacher", avatarInitial: name.replace(/^(الأستاذ(ة)?|أ\.)\s*/, "").charAt(0) || name.charAt(0) };
  DB.users.push(user);
  const teacher = { id: teId, userId: user.id, subjects: subject ? [subject] : [], classrooms };
  DB.teachers.push(teacher);
  saveDB();
  return { ok: true, teacher, slotsCount: added.length };
}

function setTeacherClassrooms(teId, classrooms) {
  const t = DB.teachers.find(x => x.id === teId);
  if (!t) return { ok: false, error: "الأستاذ(ة) غير موجود(ة)." };
  const list = [...new Set((classrooms || []).map(String))];
  if (list.some(c => !DB.classrooms.includes(c))) return { ok: false, error: "قسم غير معروف." };
  const orphan = DB.scheduleSlots.find(sl => sl.teacherId === teId && !list.includes(sl.classroom));
  if (orphan) return { ok: false, error: "لا يمكن سحب القسم " + orphan.classroom + " لأن للأستاذ(ة) حصصًا فيه. احذف حصصه أولًا من استعمال الزمن." };
  t.classrooms = list;
  saveDB();
  return { ok: true };
}

/* ---------- الأقسام واستعمالات الزمن ---------- */
function sortClasses(list) { return list.slice().sort((a, b) => a.localeCompare(b, "en", { numeric: true })); }

function addClassroom(name) {
  const n = String(name || "").trim();
  if (!CLASS_RE.test(n)) return { ok: false, error: "صيغة القسم غير صالحة. مثال: 2/4." };
  if (DB.classrooms.includes(n)) return { ok: false, error: "هذا القسم موجود مسبقًا." };
  DB.classrooms.push(n);
  DB.classrooms = sortClasses(DB.classrooms);
  saveDB();
  return { ok: true };
}

function slotTeacherName(sl) { return sl.teacherId ? teacherName(sl.teacherId) : (sl.teacher || "—"); }
function slotsOfClass(cls) {
  return DB.scheduleSlots.filter(s => s.classroom === cls)
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start.localeCompare(b.start));
}
function slotsOfTeacher(teId) {
  return DB.scheduleSlots.filter(s => s.teacherId === teId)
    .sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start.localeCompare(b.start));
}
function isSchedulePublished(cls) { return !!(DB.schedulePublished || {})[cls]; }
function studentsOfClass(cls) { return DB.students.filter(s => s.status === "approved" && s.classroom === cls); }

function overlaps(a, b) { return a.start < b.end && b.start < a.end; }

function addSlot(d, skipSave) {
  const slot = {
    id: uid("sl"), classroom: String(d.classroom || "").trim(), day: String(d.day || "").trim(),
    start: String(d.start || "").trim(), end: String(d.end || "").trim(),
    subject: String(d.subject || "").trim(), teacherId: d.teacherId || null, room: String(d.room || "").trim(),
  };
  if (!DB.classrooms.includes(slot.classroom)) return { ok: false, error: "اختر قسمًا صالحًا." };
  if (!DAYS.includes(slot.day)) return { ok: false, error: "اختر يوم الحصة." };
  if (!TIME_RE.test(slot.start) || !TIME_RE.test(slot.end)) return { ok: false, error: "أدخل وقت البداية والنهاية بصيغة صحيحة (مثال 08:30)." };
  if (slot.start >= slot.end) return { ok: false, error: "وقت النهاية يجب أن يكون بعد وقت البداية." };
  if (slot.subject.length < 2) return { ok: false, error: "المادة مطلوبة." };
  if (slot.room.length > 40) return { ok: false, error: "اسم القاعة طويل جدًا." };
  if (slot.teacherId && !DB.teachers.some(t => t.id === slot.teacherId) && !String(slot.teacherId).startsWith("te-")) return { ok: false, error: "أستاذ غير معروف." };

  const same = DB.scheduleSlots.filter(x => x.day === slot.day);
  const c1 = same.find(x => x.classroom === slot.classroom && overlaps(x, slot));
  if (c1) return { ok: false, error: "تعارض: للقسم " + slot.classroom + " حصة أخرى يوم " + slot.day + " بين " + c1.start + " و " + c1.end + "." };
  if (slot.teacherId) {
    const c2 = same.find(x => x.teacherId === slot.teacherId && overlaps(x, slot));
    if (c2) return { ok: false, error: "تعارض: الأستاذ(ة) لديه حصة في القسم " + c2.classroom + " يوم " + slot.day + " بين " + c2.start + " و " + c2.end + "." };
  }
  DB.scheduleSlots.push(slot);
  if (!skipSave) saveDB();
  return { ok: true, slot };
}

/* تعديل حصة: تُحذف القديمة مؤقتًا ثم تُضاف الجديدة بنفس فحوص التعارض، وعند الفشل تُستعاد القديمة */
function updateSlot(id, d) {
  const i = id ? DB.scheduleSlots.findIndex(s => s.id === id) : -1;
  const old = i >= 0 ? DB.scheduleSlots.splice(i, 1)[0] : null;
  const r = addSlot(d, true);
  if (!r.ok) { if (old) DB.scheduleSlots.splice(i, 0, old); return r; }
  const t = r.slot.teacherId && DB.teachers.find(x => x.id === r.slot.teacherId);
  if (t && !t.classrooms.includes(r.slot.classroom)) t.classrooms.push(r.slot.classroom);
  saveDB();
  return r;
}

function deleteSlot(id) {
  const i = DB.scheduleSlots.findIndex(s => s.id === id);
  if (i < 0) return { ok: false };
  DB.scheduleSlots.splice(i, 1);
  saveDB();
  return { ok: true };
}

function setSchedulePublished(cls, value) {
  if (!DB.classrooms.includes(cls)) return { ok: false, error: "قسم غير معروف." };
  if (value && !slotsOfClass(cls).length && !(DB.scheduleFiles || {})[cls]) return { ok: false, error: "لا يمكن نشر استعمال زمن فارغ. أضف حصصًا أو ارفع ملفًا أولًا." };
  DB.schedulePublished[cls] = !!value;
  saveDB();
  return { ok: true };
}

const MAX_FILE_BYTES = 1.5 * 1024 * 1024;
const FILE_TYPES = ["application/pdf", "image/png", "image/jpeg"];
function setScheduleFile(cls, file) {   // file: {name,type,size,dataUrl}
  if (!DB.classrooms.includes(cls)) return { ok: false, error: "قسم غير معروف." };
  if (!FILE_TYPES.includes(file.type)) return { ok: false, error: "نوع الملف غير مدعوم. المسموح: PDF أو PNG أو JPG." };
  if (file.size > MAX_FILE_BYTES) return { ok: false, error: "حجم الملف كبير (الحد الأقصى 1.5 ميغابايت)." };
  const prev = DB.scheduleFiles[cls];
  DB.scheduleFiles[cls] = { name: String(file.name).slice(0, 80), type: file.type, dataUrl: file.dataUrl };
  if (!saveDB()) {
    if (prev) DB.scheduleFiles[cls] = prev; else delete DB.scheduleFiles[cls];
    return { ok: false, error: "تعذر الحفظ: مساحة التخزين بالمتصفح ممتلئة. استعمل ملفًا أصغر." };
  }
  return { ok: true };
}
/* فتح ملف مخزَّن (dataURL) عبر Blob URL حتى تعمل معاينة PDF في كل المتصفحات */
function openStoredFile(f) {
  if (!f || !f.dataUrl) return;
  try {
    const [head, b64] = f.dataUrl.split(",");
    const mime = (head.match(/data:([^;]+)/) || [])[1] || f.type;
    const bin = atob(b64), arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    window.open(URL.createObjectURL(new Blob([arr], { type: mime })), "_blank", "noopener");
  } catch (e) { alert("تعذر فتح الملف."); }
}
function clearScheduleFile(cls) {
  delete DB.scheduleFiles[cls];
  if (!slotsOfClass(cls).length) DB.schedulePublished[cls] = false;
  saveDB();
  return { ok: true };
}

/* ---------- المقالات والصحافة المدرسية ---------- */
const ARTICLE_CATEGORIES = ["تاريخ", "أدب", "علوم", "فنون", "رياضة", "بيئة", "مجتمع", "أخرى"];
const IMG_RE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/=]+$/;

function canWrite(user) {
  if (!user) return false;
  if (user.role === "teacher" || user.role === "admin") return true;
  if (user.role === "staff") return hasPerm(user, "press");
  if (user.role === "student") { const st = getStudentByUser(user.id); return !!(st && st.status === "approved" && st.journalistLicense); }
  return false;
}

/* data: {id?, title, category, content}؛ الأساتذة والمدير ينشرون مباشرة، والتلاميذ يرسلون للمراجعة */
function saveArticle(user, data) {
  if (!canWrite(user)) return { ok: false, error: "لا تملك صلاحية كتابة المقالات (رخصة الصحافة مطلوبة للتلاميذ)." };
  const title = String(data.title || "").trim();
  const content = String(data.content || "").replace(/\r\n/g, "\n").trim();
  let category = String(data.category || "");
  if (title.length < 5 || title.length > 120) return { ok: false, error: "العنوان بين 5 و120 حرفًا." };
  if (!ARTICLE_CATEGORIES.includes(category)) return { ok: false, error: "اختر تصنيف المقال." };
  if (category === "أخرى") {
    const other = String(data.customCategory || "").trim();
    if (other) {
      if (other.length < 2 || other.length > 30) return { ok: false, error: "المجال المخصص بين 2 و30 حرفًا." };
      category = other;
    }
  }
  const images = (data.images || []).slice(0, 3);
  let total = 0;
  for (const im of images) {
    if (!im || !IMG_RE.test(im.dataUrl || "")) return { ok: false, error: "صيغة الصورة غير مدعومة (PNG أو JPG أو WebP)." };
    total += im.dataUrl.length;
  }
  if (images.length > 3 || total > 1600000) return { ok: false, error: "الصور كبيرة جدًا (3 صور كحد أقصى، وحجم مناسب)." };
  if (content.length < 50) return { ok: false, error: "نص المقال قصير جدًا (50 حرفًا على الأقل)." };
  if (content.length > 8000) return { ok: false, error: "نص المقال طويل جدًا (الحد الأقصى 8000 حرف)." };

  const direct = user.role !== "student";
  const imgs = images.map(im => ({ name: String(im.name || "image").slice(0, 60), dataUrl: im.dataUrl }));
  const status = direct ? "published" : "pending";
  const excerpt = content.replace(/\s+/g, " ").slice(0, 140) + (content.length > 140 ? "…" : "");

  if (data.id) {
    const a = DB.articles.find(x => x.id === data.id);
    if (!a) return { ok: false, error: "المقال غير موجود." };
    if (!hasPerm(user, "press") && a.authorId !== user.id) return { ok: false, error: "لا يمكنك تعديل مقال غيرك." };
    const backup = JSON.parse(JSON.stringify(a));
    Object.assign(a, { title, category, content, excerpt, status, reviewNote: "", images: imgs });
    if (direct && !a.publishedAt) a.publishedAt = today();
    if (!direct) a.publishedAt = null;
    if (!saveDB()) { Object.assign(a, backup); return { ok: false, error: "تعذر الحفظ: مساحة التخزين بالمتصفح ممتلئة. قلّل عدد الصور أو حجمها." }; }
    return { ok: true, article: a, status };
  }
  const a = { id: uid("ar"), title, category, authorId: user.id, authorName: user.fullName, content, excerpt, status,
              isArticleOfMonth: false, createdAt: today(), publishedAt: direct ? today() : null, reviewNote: "", images: imgs, likes: [], comments: [] };
  DB.articles.push(a);
  if (!saveDB()) { DB.articles.pop(); return { ok: false, error: "تعذر الحفظ: مساحة التخزين بالمتصفح ممتلئة. قلّل عدد الصور أو حجمها." }; }
  return { ok: true, article: a, status };
}

function reviewArticle(user, id, decision, note) {
  if (!user || (user.role !== "teacher" && !hasPerm(user, "press"))) return { ok: false, error: "غير مسموح." };
  const a = DB.articles.find(x => x.id === id);
  if (!a || a.status === "published") return { ok: false, error: "المقال غير موجود أو تم نشره." };
  if (decision === "published") { a.status = "published"; a.publishedAt = today(); a.reviewNote = ""; }
  else if (decision === "revision") {
    if (!String(note || "").trim()) return { ok: false, error: "اكتب ملاحظاتك ليتمكن التلميذ من التعديل." };
    a.status = "revision"; a.reviewNote = String(note).trim();
  } else return { ok: false, error: "قرار غير معروف." };
  saveDB();
  return { ok: true };
}

function setArticleOfMonth(user, id, value) {
  if (!hasPerm(user, "press")) return { ok: false, error: "غير مسموح." };
  const a = DB.articles.find(x => x.id === id);
  if (!a || a.status !== "published") return { ok: false, error: "يمكن اختيار مقال منشور فقط." };
  DB.articles.forEach(x => x.isArticleOfMonth = false);
  a.isArticleOfMonth = !!value;
  saveDB();
  return { ok: true };
}

function deleteArticle(user, id) {
  const i = DB.articles.findIndex(x => x.id === id);
  if (i < 0) return { ok: false, error: "المقال غير موجود." };
  const a = DB.articles[i];
  if (!user || (!hasPerm(user, "press") && !(a.authorId === user.id && a.status !== "published"))) return { ok: false, error: "غير مسموح بحذف هذا المقال." };
  DB.articles.splice(i, 1);
  saveDB();
  return { ok: true };
}

function publishedArticles() {
  return DB.articles.filter(a => a.status === "published")
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || "") || b.id.localeCompare(a.id));
}

function articleCardHTML(a) {
  return `<a class="card" href="article.html?id=${encodeURIComponent(a.id)}" style="text-decoration:none;color:inherit;">
    ${a.images && a.images[0] && IMG_RE.test(a.images[0].dataUrl) ? `<div class="thumb" style="background:url('${a.images[0].dataUrl}') center/cover no-repeat;"></div>` : `<div class="thumb" style="display:flex;align-items:center;justify-content:center;font-size:38px;">📰</div>`}
    <div class="body">
      <span class="tag">${esc(a.category)}${a.isArticleOfMonth ? " • مقال الشهر" : ""}</span>
      <h3>${esc(a.title)}</h3>
      <p>${esc(a.excerpt)}</p>
      <div class="meta"><span>بقلم: ${esc(a.authorName)}</span><span>♥ ${(a.likes || []).length} • 💬 ${(a.comments || []).length}</span></div>
    </div></a>`;
}

/* ---------- الصلاحيات وفريق الإدارة ---------- */
const PERMS = {
  students: "قبول طلبات فتح ملفات التلاميذ",
  teachers: "إنشاء حسابات الأساتذة وإسناد الأقسام",
  schedules: "استعمالات الزمن ونشرها",
  exams: "الإعلام بالامتحانات والفروض",
  lists: "لوائح الأقسام (Excel)",
  clubs: "إدارة الأندية",
  press: "المجلة: الرخص ومراجعة المقالات",
  mic: "الميكروفون التربوي",
  radio: "الإذاعة المدرسية (البث المباشر)",
  about: "التعريف بالمؤسسة في الصفحة الرئيسية",
  announcements: "الإعلانات وغيابات الأساتذة",
};
function staffOf(user) { return user && user.role === "staff" ? (DB.staff || []).find(s => s.userId === user.id) : null; }
function hasPerm(user, perm) {
  if (!user) return false;
  if (user.role === "admin") return true;
  const st = staffOf(user);
  return !!(st && st.permissions.includes(perm));
}

function cleanPerms(list) { return [...new Set((list || []).filter(p => PERMS[p]))]; }

function addStaff(actor, data) {
  if (!actor || actor.role !== "admin") return { ok: false, error: "إنشاء حسابات الإدارة من صلاحيات المدير فقط." };
  const name = String(data.fullName || "").trim();
  const mail = String(data.email || "").trim().toLowerCase();
  const title = String(data.title || "").trim();
  const perms = cleanPerms(data.permissions);
  if (name.length < 3) return { ok: false, error: "الاسم الكامل مطلوب." };
  if (title.length < 2 || title.length > 40) return { ok: false, error: "المنصب مطلوب (مثال: الحارس العام)." };
  if (!/^\S+@\S+\.\S+$/.test(mail)) return { ok: false, error: "البريد الإلكتروني غير صالح." };
  if (String(data.password || "").length < 6) return { ok: false, error: "كلمة المرور يجب ألا تقل عن 6 أحرف." };
  if (DB.users.some(u => u.email.toLowerCase() === mail)) return { ok: false, error: "هذا البريد الإلكتروني مسجّل من قبل." };
  if (!perms.length) return { ok: false, error: "اختر صلاحية واحدة على الأقل." };
  const user = { id: uid("u"), fullName: name, email: mail, password: data.password, role: "staff", avatarInitial: name.replace(/^(السيد(ة)?|الأستاذ(ة)?)\s*/, "").charAt(0) || name.charAt(0) };
  DB.users.push(user);
  const st = { id: uid("sf"), userId: user.id, title, permissions: perms };
  DB.staff.push(st);
  saveDB();
  return { ok: true, staff: st };
}
function updateStaff(actor, id, data) {
  if (!actor || actor.role !== "admin") return { ok: false, error: "غير مسموح." };
  const st = DB.staff.find(x => x.id === id);
  if (!st) return { ok: false, error: "العضو غير موجود." };
  const perms = cleanPerms(data.permissions), title = String(data.title || "").trim();
  if (title.length < 2) return { ok: false, error: "المنصب مطلوب." };
  if (!perms.length) return { ok: false, error: "اختر صلاحية واحدة على الأقل." };
  st.title = title; st.permissions = perms;
  saveDB();
  return { ok: true };
}
function deleteStaff(actor, id) {
  if (!actor || actor.role !== "admin") return { ok: false, error: "غير مسموح." };
  const i = DB.staff.findIndex(x => x.id === id);
  if (i < 0) return { ok: false };
  const uidv = DB.staff[i].userId;
  DB.staff.splice(i, 1);
  DB.users = DB.users.filter(u => u.id !== uidv);
  saveDB();
  return { ok: true };
}

/* ---------- الامتحانات والفروض ---------- */
function canManageExam(user, classroom) {
  if (hasPerm(user, "exams")) return true;
  if (user && user.role === "teacher") { const te = getTeacherByUser(user.id); return !!(te && te.classrooms.includes(classroom)); }
  return false;
}
function addExam(user, d) {
  const e = { id: uid("ex"), title: String(d.title || "").trim(), subject: String(d.subject || "").trim(), classroom: String(d.classroom || "").trim(),
              date: String(d.date || "").trim(), time: String(d.time || "").trim(), room: String(d.room || "").trim(),
              createdBy: user ? user.fullName : "", createdById: user ? user.id : "" };
  if (!DB.classrooms.includes(e.classroom)) return { ok: false, error: "اختر القسم." };
  if (!canManageExam(user, e.classroom)) return { ok: false, error: "لا تملك صلاحية الإعلام بامتحانات هذا القسم." };
  if (e.title.length < 3) return { ok: false, error: "عنوان الامتحان مطلوب (مثال: الفرض المحروس الأول)." };
  if (e.subject.length < 2) return { ok: false, error: "المادة مطلوبة." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date) || isNaN(new Date(e.date).getTime())) return { ok: false, error: "التاريخ غير صالح." };
  if (e.date < today()) return { ok: false, error: "لا يمكن الإعلام بامتحان في تاريخ سابق." };
  if (!TIME_RE.test(e.time)) return { ok: false, error: "أدخل الوقت بصيغة صحيحة (مثال 09:00)." };
  if (e.room.length > 40) return { ok: false, error: "اسم القاعة طويل." };
  DB.exams.push(e);
  saveDB();
  return { ok: true, exam: e };
}
function deleteExam(user, id) {
  const i = DB.exams.findIndex(x => x.id === id);
  if (i < 0) return { ok: false, error: "غير موجود." };
  const e = DB.exams[i];
  if (!hasPerm(user, "exams") && e.createdById !== (user && user.id)) return { ok: false, error: "يمكنك حذف الامتحانات التي أعلنتَ عنها فقط." };
  DB.exams.splice(i, 1);
  saveDB();
  return { ok: true };
}
function upcomingExams(cls) {
  return DB.exams.filter(e => (cls == null || e.classroom === cls) && e.date >= today())
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

/* ---------- الإعلانات وغيابات الأساتذة ---------- */
function addAnnouncement(user, d) {
  if (!hasPerm(user, "announcements")) return { ok: false, error: "غير مسموح." };
  const title = String(d.title || "").trim();
  if (title.length < 4 || title.length > 140) return { ok: false, error: "عنوان الإعلان بين 4 و140 حرفًا." };
  DB.announcements.unshift({ id: uid("an"), title, type: d.type === "حدث" ? "حدث" : "إعلان", date: today(), urgent: !!d.urgent });
  if (d.urgent) DB.settings.ticker = [title].concat(DB.settings.ticker || []).slice(0, 10);
  saveDB();
  return { ok: true };
}
function deleteAnnouncement(user, id) {
  if (!hasPerm(user, "announcements")) return { ok: false, error: "غير مسموح." };
  const a = DB.announcements.find(x => x.id === id);
  if (!a) return { ok: false };
  DB.announcements = DB.announcements.filter(x => x.id !== id);
  DB.settings.ticker = (DB.settings.ticker || []).filter(t => t !== a.title);
  saveDB();
  return { ok: true };
}
/* غياب أستاذ: kind = "sessions" (حصة أو عدة حصص في يوم واحد) أو "days" (يوم كامل أو عدة أيام) */
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
function localISO(d) { const x = d || new Date(); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); }
function addAbsence(user, d) {
  if (!hasPerm(user, "announcements")) return { ok: false, error: "غير مسموح." };
  const t = DB.teachers.find(x => x.id === d.teacherId);
  if (!t) return { ok: false, error: "اختر الأستاذ(ة)." };
  const kind = d.kind === "days" ? "days" : "sessions";
  const dateFrom = String(d.dateFrom || ""), dateTo = kind === "days" ? String(d.dateTo || d.dateFrom || "") : dateFrom;
  if (!ISO_RE.test(dateFrom) || !ISO_RE.test(dateTo)) return { ok: false, error: "أدخل تاريخًا صحيحًا." };
  if (dateTo < dateFrom) return { ok: false, error: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية." };
  if (kind === "days" && (new Date(dateTo) - new Date(dateFrom)) / 86400000 > 60) return { ok: false, error: "الحد الأقصى لمدة الغياب 60 يومًا." };
  let sessions = [];
  if (kind === "sessions") {
    sessions = (d.sessions || []).map(x => ({ classroom: String(x.classroom || ""), start: String(x.start || ""), end: String(x.end || "") }));
    if (!sessions.length) return { ok: false, error: "أضف حصة واحدة على الأقل." };
    for (const x of sessions) {
      if (!DB.classrooms.includes(x.classroom)) return { ok: false, error: "اختر القسم لكل حصة." };
      if (!TIME_RE.test(x.start) || !TIME_RE.test(x.end) || x.start >= x.end) return { ok: false, error: "أدخل وقت بداية ونهاية صحيحين لكل حصة." };
    }
  }
  const reason = String(d.reason || "").trim().slice(0, 80);
  DB.teacherAbsences.unshift({ id: uid("ab"), teacherId: t.id, teacher: teacherName(t.id), kind, dateFrom, dateTo, sessions,
    subject: String(d.subject || (t.subjects || [])[0] || "").trim(), reason, status: d.status === "حصة شاغرة" ? "حصة شاغرة" : "غياب مؤكد" });
  saveDB();
  return { ok: true };
}
/* أقسام الغياب (لأيام كاملة: كل أقسام الأستاذ) */
function absenceClasses(a) {
  if (a.kind === "days") { const t = DB.teachers.find(x => x.id === a.teacherId); return t ? t.classrooms : (a.classroom ? [a.classroom] : []); }
  return [...new Set((a.sessions || []).map(x => x.classroom))];
}
/* نص «متى»: حصص ذلك اليوم، أو يوم كامل، أو المدة */
function absenceWhen(a) {
  const d = x => x;
  if (a.kind === "days") return a.dateFrom === a.dateTo ? "يوم كامل: " + d(a.dateFrom) : "من " + d(a.dateFrom) + " إلى " + d(a.dateTo) + " (أيام كاملة)";
  const day = a.dateFrom ? (a.dateFrom === localISO() ? "اليوم" : a.dateFrom) : "اليوم";
  return day + " • " + (a.sessions || []).map(x => x.start + "-" + x.end + " (" + x.classroom + ")").join("، ");
}
/* ساري المفعول اليوم؟ (الغيابات بدون تاريخ قديمة وتُعدّ سارية) */
function absenceActive(a) { const t = localISO(); return !a.dateTo || a.dateTo >= t; }
function absencesForClass(cls) { return DB.teacherAbsences.filter(a => absenceActive(a) && absenceClasses(a).includes(cls)); }
function deleteAbsence(user, id) {
  if (!hasPerm(user, "announcements")) return { ok: false, error: "غير مسموح." };
  DB.teacherAbsences = DB.teacherAbsences.filter(x => x.id !== id);
  saveDB();
  return { ok: true };
}


/* ---------- الإذاعة المدرسية (بث لقاءات وندوات) ---------- */
const RADIO_TYPES = ["لقاء", "ندوة", "برنامج إذاعي", "حفل / مناسبة"];
function canBroadcast(user) {
  if (hasPerm(user, "radio")) return true;
  if (user && user.role === "teacher") { const te = getTeacherByUser(user.id); return !!(te && (DB.radioEditors || []).includes(te.id)); }
  return false;
}
/* المدير وحده يكلّف الأساتذة بالبث (والإدارة تُكلَّف بإضافة صلاحية «الإذاعة» لحسابها) */
function setRadioEditors(user, ids) {
  if (!user || user.role !== "admin") return { ok: false, error: "تكليف الأساتذة بالإذاعة من صلاحيات المدير وحده." };
  DB.radioEditors = (ids || []).filter(id => DB.teachers.some(t => t.id === id));
  saveDB();
  return { ok: true };
}
function canManageBroadcast(user, b) { return hasPerm(user, "radio") || (canBroadcast(user) && b.hostId === user.id); }
function saveBroadcast(user, d) {
  if (!canBroadcast(user)) return { ok: false, error: "البث في الإذاعة المدرسية للمكلَّفين من المدير فقط." };
  const type = String(d.type || ""), title = String(d.title || "").trim(), description = String(d.description || "").trim();
  const guests = String(d.guests || "").trim(), url = String(d.streamUrl || "").trim(), when = String(d.scheduledAt || "");
  if (!RADIO_TYPES.includes(type)) return { ok: false, error: "اختر نوع البث." };
  if (title.length < 3 || title.length > 120) return { ok: false, error: "العنوان بين 3 و120 حرفًا." };
  if (description.length < 10 || description.length > 600) return { ok: false, error: "الوصف بين 10 و600 حرف." };
  if (guests.length > 120) return { ok: false, error: "نص الضيوف طويل جدًا." };
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(when)) return { ok: false, error: "حدّد تاريخ البث وساعته." };
  let b = d.id ? DB.broadcasts.find(x => x.id === d.id) : null;
  if (d.id && !b) return { ok: false, error: "البث غير موجود." };
  if (b && !canManageBroadcast(user, b)) return { ok: false, error: "لا تملك صلاحية تعديل هذا البث." };
  const fields = { type, title, description, guests, scheduledAt: when, streamUrl: url };
  if (b) Object.assign(b, fields);
  else {
    b = Object.assign({ id: uid("br"), status: "scheduled", hostId: user.id, hostName: user.fullName, recordingMediaId: "", recordingKind: "", recordingUrl: "", startedAt: "", endedAt: "" }, fields);
    DB.broadcasts.unshift(b);
  }
  saveDB();
  return { ok: true, broadcast: b };
}
/* status: "live" (بدء) | "ended" (إنهاء) | "scheduled" */
function setBroadcastStatus(user, id, status) {
  const b = DB.broadcasts.find(x => x.id === id);
  if (!b) return { ok: false, error: "البث غير موجود." };
  if (!canManageBroadcast(user, b)) return { ok: false, error: "لا تملك صلاحية التحكم في هذا البث." };
  if (!["live", "ended", "scheduled"].includes(status)) return { ok: false, error: "حالة غير صالحة." };
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  if (status === "live") {
    if (DB.broadcasts.some(x => x.status === "live" && x.id !== id)) return { ok: false, error: "يوجد بث مباشر جارٍ؛ أنهِه أولًا." };
    b.startedAt = now; b.endedAt = "";
  }
  if (status === "ended") b.endedAt = now;
  b.status = status;
  saveDB();
  return { ok: true, broadcast: b };
}
function setBroadcastRecording(user, id, rec) {   // rec: {mediaId, kind} أو {url}
  const b = DB.broadcasts.find(x => x.id === id);
  if (!b) return { ok: false, error: "البث غير موجود." };
  if (!canManageBroadcast(user, b)) return { ok: false, error: "لا تملك صلاحية." };
  if (rec.mediaId) {
    if (!/^md-[a-z0-9]{6,20}$/.test(String(rec.mediaId)) || !["audio", "video"].includes(rec.kind)) return { ok: false, error: "ملف غير صالح." };
    if (b.recordingMediaId && typeof mediaDelete === "function") mediaDelete(b.recordingMediaId);
    b.recordingMediaId = rec.mediaId; b.recordingKind = rec.kind;
  } else if (rec.url !== undefined) {
    if (rec.url && !parseMedia(rec.url)) return { ok: false, error: "رابط غير صالح." };
    b.recordingUrl = rec.url;
  }
  saveDB();
  return { ok: true };
}
function deleteBroadcast(user, id) {
  const b = DB.broadcasts.find(x => x.id === id);
  if (!b) return { ok: false };
  if (!canManageBroadcast(user, b)) return { ok: false, error: "لا تملك صلاحية." };
  if (b.recordingMediaId && typeof mediaDelete === "function") mediaDelete(b.recordingMediaId);
  DB.broadcasts = DB.broadcasts.filter(x => x.id !== id);
  saveDB();
  return { ok: true };
}


/* ---------- التعريف بالمؤسسة في الصفحة الرئيسية (نص / صورة / فيديو) ---------- */
const ABOUT_TYPES = { text: "نص", image: "صورة", video: "فيديو" };
function saveAboutItem(user, d) {
  if (!hasPerm(user, "about")) return { ok: false, error: "نشر التعريف بالمؤسسة للمدير ومن يكلّفه من الإدارة." };
  const type = String(d.type || ""), title = String(d.title || "").trim(), text = String(d.text || "").trim();
  if (!ABOUT_TYPES[type]) return { ok: false, error: "اختر نوع المحتوى." };
  if (title.length < 3 || title.length > 80) return { ok: false, error: "العنوان بين 3 و80 حرفًا." };
  if (text.length > 1500) return { ok: false, error: "النص طويل جدًا (1500 حرف)." };
  if (type === "text" && text.length < 10) return { ok: false, error: "اكتب نصًا من 10 أحرف على الأقل." };
  const old = d.id ? DB.about.find(x => x.id === d.id) : null;
  if (d.id && !old) return { ok: false, error: "العنصر غير موجود." };
  let image = old ? old.image : "", mediaId = old ? old.mediaId : "", mediaKind = old ? old.mediaKind : "", videoUrl = old ? old.videoUrl : "";
  if (type === "image") {
    if (d.image) { if (!IMG_RE.test(d.image) || d.image.length > 3000000) return { ok: false, error: "الصورة غير صالحة (PNG أو JPG أو WebP)." }; image = d.image; }
    if (!image) return { ok: false, error: "اختر صورة." };
  } else image = "";
  if (type === "video") {
    if (d.mediaId) {
      if (!/^md-[a-z0-9]{6,20}$/.test(String(d.mediaId)) || d.mediaKind !== "video") return { ok: false, error: "ملف الفيديو غير صالح." };
      if (old && old.mediaId && old.mediaId !== d.mediaId && typeof mediaDelete === "function") mediaDelete(old.mediaId);
      mediaId = d.mediaId; mediaKind = "video"; videoUrl = "";
    } else if (d.videoUrl !== undefined && String(d.videoUrl).trim()) {
      const m = parseMedia(String(d.videoUrl).trim());
      if (!m || !["youtube", "video"].includes(m.kind)) return { ok: false, error: "الرابط يجب أن يكون فيديو يوتيوب أو ملف mp4/webm بصيغة https." };
      videoUrl = String(d.videoUrl).trim();
      if (mediaId && typeof mediaDelete === "function") mediaDelete(mediaId);
      mediaId = ""; mediaKind = "";
    }
    if (!mediaId && !videoUrl) return { ok: false, error: "ارفع فيديو أو ضع رابطًا." };
  } else { if (mediaId && typeof mediaDelete === "function") mediaDelete(mediaId); mediaId = ""; mediaKind = ""; videoUrl = ""; }
  const rec = { type, title, text, image, mediaId, mediaKind, videoUrl };
  if (old) Object.assign(old, rec);
  else DB.about.push(Object.assign({ id: uid("ab"), createdAt: today() }, rec));
  saveDB();
  return { ok: true };
}
function deleteAboutItem(user, id) {
  if (!hasPerm(user, "about")) return { ok: false, error: "غير مسموح." };
  const it = DB.about.find(x => x.id === id);
  if (!it) return { ok: false };
  if (it.mediaId && typeof mediaDelete === "function") mediaDelete(it.mediaId);
  DB.about = DB.about.filter(x => x.id !== id);
  saveDB();
  return { ok: true };
}
function moveAboutItem(user, id, dir) {
  if (!hasPerm(user, "about")) return { ok: false, error: "غير مسموح." };
  const i = DB.about.findIndex(x => x.id === id), j = i + (dir < 0 ? -1 : 1);
  if (i < 0 || j < 0 || j >= DB.about.length) return { ok: false };
  [DB.about[i], DB.about[j]] = [DB.about[j], DB.about[i]];
  saveDB();
  return { ok: true };
}

/* ---------- تغيير المدير لاسمه (أو أي مستخدم لاسمه الشخصي) ---------- */
function updateOwnName(userId, name) {
  const n = String(name || "").trim().replace(/\s+/g, " ");
  if (n.length < 3 || n.length > 60) return { ok: false, error: "الاسم بين 3 و60 حرفًا." };
  const u = DB.users.find(x => x.id === userId);
  if (!u) return { ok: false, error: "الحساب غير موجود." };
  u.fullName = n;
  u.avatarInitial = n.replace(/^(السيد(ة)?|الأستاذ(ة)?|أ\.|د\.)\s*/, "").charAt(0) || n.charAt(0);
  saveDB();
  return { ok: true, user: u };
}

/* ---------- الميكروفون التربوي ---------- */
const MIC_TYPES = ["بودكاست", "وثائقي قصير", "حوار", "تسجيل صوتي"];
function canPostMic(user) {
  if (hasPerm(user, "mic")) return true;
  if (user && user.role === "teacher") { const te = getTeacherByUser(user.id); return !!(te && (DB.micEditors || []).includes(te.id)); }
  return false;
}
function setMicEditors(user, ids) {
  if (!hasPerm(user, "mic")) return { ok: false, error: "غير مسموح." };
  DB.micEditors = (ids || []).filter(id => DB.teachers.some(t => t.id === id));
  saveDB();
  return { ok: true };
}
/* يحوّل الرابط إلى نوع عرض آمن: يوتيوب (iframe بمعرّف مُتحقَّق منه)، ملف صوت/فيديو مباشر، أو رابط عادي */
function parseMedia(url) {
  const u = String(url || "").trim();
  if (!u) return null;
  let m = u.match(/^https:\/\/(?:www\.)?youtube\.com\/watch\?(?:[^#]*&)?v=([\w-]{11})(?:[&#].*)?$/) || u.match(/^https:\/\/youtu\.be\/([\w-]{11})(?:[?#].*)?$/) || u.match(/^https:\/\/(?:www\.)?youtube\.com\/live\/([\w-]{11})(?:[?#].*)?$/);
  if (m) return { kind: "youtube", id: m[1] };
  if (/^https:\/\/[^\s<>"']+\.(mp3|m4a|wav|ogg)(\?[^\s<>"']*)?$/i.test(u)) return { kind: "audio", url: u };
  if (/^https:\/\/[^\s<>"']+\.(mp4|webm)(\?[^\s<>"']*)?$/i.test(u)) return { kind: "video", url: u };
  if (/^https:\/\/[^\s<>"']+$/i.test(u)) return { kind: "link", url: u };
  return null;
}
function saveMicPost(user, d) {
  if (!canPostMic(user)) return { ok: false, error: "النشر في الميكروفون التربوي للإدارة والأساتذة المكلَّفين فقط." };
  const type = String(d.type || ""), title = String(d.title || "").trim(), description = String(d.description || "").trim(), url = String(d.mediaUrl || "").trim();
  if (!MIC_TYPES.includes(type)) return { ok: false, error: "اختر نوع الإنتاج." };
  if (title.length < 3 || title.length > 100) return { ok: false, error: "العنوان بين 3 و100 حرف." };
  if (description.length < 10 || description.length > 600) return { ok: false, error: "الوصف بين 10 و600 حرف." };
  if (url && !parseMedia(url)) return { ok: false, error: "الرابط يجب أن يبدأ بـ https:// (يوتيوب أو ملف صوت/فيديو أو أي رابط آمن)." };
  let mediaId = null, mediaKind = null, mediaName = "";
  if (d.mediaId) {
    if (!/^md-[a-z0-9]{6,20}$/.test(String(d.mediaId)) || !["audio", "video"].includes(d.mediaKind)) return { ok: false, error: "ملف غير صالح." };
    mediaId = d.mediaId; mediaKind = d.mediaKind; mediaName = String(d.mediaName || "").slice(0, 120);
  }
    const post = { id: uid("mc"), type, title, description, mediaUrl: url, mediaId, mediaKind, mediaName, authorId: user.id, authorName: user.fullName, createdAt: today(), likes: [], comments: [] };
  DB.micPosts.unshift(post);
  saveDB();
  return { ok: true, post };
}
function deleteMicPost(user, id) {
  const p = DB.micPosts.find(x => x.id === id);
  if (!p) return { ok: false };
  if (!hasPerm(user, "mic") && !(canPostMic(user) && p.authorId === user.id)) return { ok: false, error: "غير مسموح." };
  DB.micPosts = DB.micPosts.filter(x => x.id !== id);
  if (p.mediaId && typeof mediaDelete === "function") mediaDelete(p.mediaId);
  saveDB();
  return { ok: true };
}

/* ---------- الإعجاب والتعليق (مقالات + ميكروفون) ---------- */
function reactItem(kind, id) {
  const list = kind === "mic" ? DB.micPosts : DB.articles;
  const it = list.find(x => x.id === id);
  if (!it || (kind !== "mic" && it.status !== "published")) return null;
  if (!it.likes) it.likes = [];
  if (!it.comments) it.comments = [];
  return it;
}
function toggleLike(user, kind, id) {
  const it = reactItem(kind, id);
  if (!user || !it) return { ok: false, error: "سجّل الدخول للإعجاب." };
  const i = it.likes.indexOf(user.id);
  if (i >= 0) it.likes.splice(i, 1); else it.likes.push(user.id);
  saveDB();
  return { ok: true, liked: i < 0, count: it.likes.length };
}
function addComment(user, kind, id, text) {
  const it = reactItem(kind, id);
  if (!user || !it) return { ok: false, error: "سجّل الدخول للتعليق." };
  const t = String(text || "").trim();
  if (t.length < 2) return { ok: false, error: "اكتب تعليقًا (حرفان على الأقل)." };
  if (t.length > 500) return { ok: false, error: "التعليق طويل (500 حرف كحد أقصى)." };
  const last = it.comments.filter(c => c.userId === user.id).pop();
  if (last && last.text === t) return { ok: false, error: "تم نشر هذا التعليق من قبل." };
  it.comments.push({ id: uid("cm"), userId: user.id, authorName: user.fullName, role: user.role, text: t, createdAt: today() });
  saveDB();
  return { ok: true };
}
function deleteComment(user, kind, id, cid) {
  const it = reactItem(kind, id);
  if (!user || !it) return { ok: false };
  const c = it.comments.find(x => x.id === cid);
  if (!c) return { ok: false };
  if (c.userId !== user.id && !hasPerm(user, kind === "mic" ? "mic" : "press")) return { ok: false, error: "غير مسموح." };
  it.comments = it.comments.filter(x => x.id !== cid);
  saveDB();
  return { ok: true };
}

/* ---------- رخصة الصحافة ---------- */
function requestLicense(studentId, motivation) {
  const st = DB.students.find(s => s.id === studentId);
  if (!st || st.status !== "approved") return { ok: false, error: "يجب أن تتم الموافقة على ملفك أولًا." };
  if (st.journalistLicense) return { ok: false, error: "لديك رخصة صحافة بالفعل." };
  if (st.licenseRequest === "pending") return { ok: false, error: "طلبك قيد الدراسة." };
  const m = String(motivation || "").trim();
  if (m.length < 10) return { ok: false, error: "اكتب دافعك للانضمام لفريق الصحافة (10 أحرف على الأقل)." };
  if (m.length > 400) return { ok: false, error: "النص طويل جدًا (400 حرف)." };
  st.licenseRequest = "pending"; st.licenseNote = m;
  saveDB();
  return { ok: true };
}

function reviewLicense(studentId, decision, reason) {
  const st = DB.students.find(s => s.id === studentId);
  if (!st || st.licenseRequest !== "pending") return { ok: false, error: "لا يوجد طلب قيد الدراسة." };
  if (decision === "approved") { st.journalistLicense = true; st.licenseRequest = "none"; st.licenseNote = ""; }
  else if (decision === "rejected") {
    if (!String(reason || "").trim()) return { ok: false, error: "اكتب سبب الرفض." };
    st.licenseRequest = "rejected"; st.licenseNote = String(reason).trim();
  } else return { ok: false, error: "قرار غير معروف." };
  saveDB();
  return { ok: true };
}

/* ---------- معلومات المؤسسة (يعدّلها المدير) ---------- */
const PHONE_RE = /^[0-9+\-\s().]{6,20}$/;
const URL_RE = /^https?:\/\/[^\s<>"']+$/i;   // يمنع javascript: وما شابه

function saveSchoolInfo(d) {
  const t = v => String(v == null ? "" : v).trim();
  const text = (label, v, min, max, required) => {
    v = t(v);
    if (!v && !required) return { v: "" };
    if (v.length < min) return { err: label + " مطلوب (" + min + " أحرف على الأقل)." };
    if (v.length > max) return { err: label + " طويل جدًا (الحد الأقصى " + max + " حرفًا)." };
    return { v };
  };
  const out = {};
  const rules = [
    ["schoolName", "اسم المؤسسة", 3, 80, true],
    ["city", "المدينة", 2, 40, true],
    ["tagline", "السطر التعريفي", 0, 80, false],
    ["address", "العنوان", 0, 200, false],
    ["heroEyebrow", "العبارة الصغيرة في الواجهة", 0, 60, false],
    ["heroTitle", "عنوان الواجهة", 5, 120, true],
    ["heroLead", "نص الواجهة", 0, 300, false],
  ];
  for (const [k, label, min, max, req] of rules) {
    const r = text(label, d[k], min, max, req);
    if (r.err) return { ok: false, error: r.err };
    out[k] = r.v;
  }

  const email = t(d.email);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "البريد الإلكتروني غير صالح." };
  out.email = email;
  for (const [k, label] of [["phone", "الهاتف"], ["fax", "الفاكس"]]) {
    const v = t(d[k]);
    if (v && !PHONE_RE.test(v)) return { ok: false, error: label + " غير صالح (أرقام وعلامات + - ( ) فقط)." };
    out[k] = v;
  }
  for (const [k, label] of [["facebook", "فيسبوك"], ["youtube", "يوتيوب"], ["instagram", "إنستغرام"], ["whatsapp", "واتساب"]]) {
    const v = t(d[k]);
    if (v && (!URL_RE.test(v) || v.length > 200)) return { ok: false, error: "رابط " + label + " يجب أن يبدأ بـ https://" };
    out[k] = v;
  }

  const evTitle = text("عنوان الحدث القادم", d.eventTitle, 0, 80, false);
  if (evTitle.err) return { ok: false, error: evTitle.err };
  out.eventTitle = evTitle.v;
  const evDate = t(d.eventDate);
  if (evDate && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(evDate) || isNaN(new Date(evDate).getTime()))) {
    return { ok: false, error: "تاريخ الحدث القادم غير صالح." };
  }
  if (evDate && !out.eventTitle) return { ok: false, error: "أدخل عنوان الحدث القادم أو امسح تاريخه." };
  out.eventDate = evDate;

  const lines = String(d.ticker || "").split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  if (lines.length > 10) return { ok: false, error: "الحد الأقصى 10 أخبار عاجلة." };
  if (lines.some(x => x.length > 140)) return { ok: false, error: "كل خبر عاجل يجب ألا يتجاوز 140 حرفًا." };
  out.ticker = lines;

  const num = (label, v, max, integer) => {
    if (t(v) === "") return { err: label + " مطلوب." };
    const n = Number(v);
    if (!isFinite(n) || n < 0 || n > max || (integer && !Number.isInteger(n))) {
      return { err: label + " غير صالح (" + (integer ? "عدد صحيح" : "رقم") + " بين 0 و " + max + ")." };
    }
    return { n };
  };
  const st = {};
  for (const [k, label, max, integer] of [
    ["successRate", "نسبة النجاح العامة", 100, false],
    ["regionalExamRate", "نسبة الامتحان الموحد الإقليمي", 100, false],
    ["maleCount", "عدد الذكور", 100000, true],
    ["femaleCount", "عدد الإناث", 100000, true],
    ["classroomsCount", "عدد الأقسام", 1000, true],
  ]) {
    const r = num(label, d[k], max, integer);
    if (r.err) return { ok: false, error: r.err };
    st[k] = r.n;
  }
  st.totalStudents = st.maleCount + st.femaleCount;

  DB.settings = Object.assign(DB.settings || {}, out);
  DB.stats = Object.assign(DB.stats || {}, st);
  saveDB();
  return { ok: true };
}

function resetSchoolInfo() {
  DB.settings = cloneJSON(SEED.settings);
  DB.stats = Object.assign(DB.stats || {}, {
    successRate: SEED.stats.successRate, regionalExamRate: SEED.stats.regionalExamRate,
    maleCount: SEED.stats.maleCount, femaleCount: SEED.stats.femaleCount,
    classroomsCount: SEED.stats.classroomsCount, totalStudents: SEED.stats.totalStudents,
  });
  saveDB();
  return { ok: true };
}

/* ===================================================================
   إعادة تعيين كلمة المرور تحت إشراف المدير (النسخة 6)
   - لا توجد إعادة تعيين ذاتية: صاحب الحساب يرسل «طلبًا» فقط.
   - المدير وحده ينفّذ الإعادة (يُولَّد رمز مؤقت يُسلَّم لصاحب الحساب مباشرة)،
     ويُلزَم صاحب الحساب بتغييره عند أول دخول.
   - المدير لا يُعاد تعيين كلمة مروره: يصادق بنفسه ويغيّرها بعد إدخال الحالية.
   =================================================================== */
const RESETTABLE_ROLES = ["student", "teacher", "staff", "parent"];

function requestPasswordReset(email) {
  const e = String(email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return { ok: false, error: "أدخل بريدًا إلكترونيًا صالحًا." };
  DB.resetRequests = DB.resetRequests || [];
  const u = DB.users.find(x => x.email.toLowerCase() === e);
  if (u && u.role === "admin") return { ok: false, error: "حساب المدير لا يُعاد تعيينه عبر الموقع. يصادق المدير بنفسه ويغيّر كلمة مروره من لوحته." };
  /* رسالة موحّدة سواء وُجد الحساب أم لا (لا نكشف وجود الحسابات) */
  if (u && !DB.resetRequests.some(r => r.userId === u.id && r.status === "pending")) {
    DB.resetRequests.push({ id: uid("rp"), userId: u.id, email: u.email, role: u.role, status: "pending", requestedAt: today(), handledAt: null });
    saveDB();
  }
  return { ok: true };
}

function pendingResets() { return (DB.resetRequests || []).filter(r => r.status === "pending"); }

function genTempPassword() {
  const abc = "abcdefghjkmnpqrstuvwxyz23456789";   // بدون أحرف ملتبسة
  const arr = new Uint32Array(8);
  (window.crypto || window.msCrypto).getRandomValues(arr);
  return Array.from(arr).map(n => abc[n % abc.length]).join("");
}

/* actor: المدير فقط. */
function resetPasswordByDirector(actor, userId) {
  if (!actor || actor.role !== "admin") return { ok: false, error: "إعادة تعيين كلمات المرور من صلاحيات المدير وحده." };
  const u = DB.users.find(x => x.id === userId);
  if (!u) return { ok: false, error: "الحساب غير موجود." };
  if (!RESETTABLE_ROLES.includes(u.role)) return { ok: false, error: "لا تُعاد كلمة مرور المدير بهذه الطريقة. استعمل «تغيير كلمة مروري»." };
  const temp = genTempPassword();
  u.password = temp;
  u.mustChange = true;
  (DB.resetRequests || []).forEach(r => { if (r.userId === u.id && r.status === "pending") { r.status = "done"; r.handledAt = today(); } });
  DB.resetLog = DB.resetLog || [];
  DB.resetLog.unshift({ userId: u.id, name: u.fullName, role: u.role, at: new Date().toISOString().slice(0, 16).replace("T", " ") });
  DB.resetLog = DB.resetLog.slice(0, 50);
  saveDB();
  return { ok: true, tempPassword: temp, user: u };
}

function dismissResetRequest(actor, id) {
  if (!actor || actor.role !== "admin") return { ok: false, error: "من صلاحيات المدير وحده." };
  const r = (DB.resetRequests || []).find(x => x.id === id);
  if (!r) return { ok: false };
  r.status = "rejected"; r.handledAt = today();
  saveDB();
  return { ok: true };
}

/* تغيير كلمة المرور من صاحب الحساب نفسه بعد إدخال الحالية (مصادقة) */
function changeOwnPassword(userId, current, next) {
  const u = DB.users.find(x => x.id === userId);
  if (!u) return { ok: false, error: "الحساب غير موجود." };
  if (u.password !== current) return { ok: false, error: "كلمة المرور الحالية غير صحيحة." };
  if (String(next || "").length < 6) return { ok: false, error: "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف." };
  if (next === current) return { ok: false, error: "اختر كلمة مرور مختلفة عن الحالية." };
  u.password = next; u.mustChange = false;
  saveDB();
  return { ok: true, user: u };
}
