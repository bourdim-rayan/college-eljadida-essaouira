/* ===================================================================
   radio-live.js — البث الصوتي المباشر داخل الموقع نفسه.
   المذيع: يلتقط الميكروفون في متصفحه ← يُرسل الصوت (PCM مُخفَّض إلى 16kHz أحادي) عبر WebSocket إلى خادم الموقع (server/server.js)
   المستمع: يستقبل الصوت من الخادم ويشغّله فورًا بذاكرة مؤقتة قصيرة (~0.3 ثانية).
   يحتاج تشغيل الموقع عبر خادم الموقع: node server/server.js
   =================================================================== */
const RADIO_RATE = 16000;

function radioWsUrl() {
  if (!/^https?:$/.test(location.protocol)) return null;
  return (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/radio";
}

/* ---------------- المستمع ---------------- */
function RadioListener(cb) {   // cb(status) حيث status: {connected, live, title, host, listeners, error}
  const self = this;
  let ws = null, ctx = null, next = 0, playing = false, closed = false, retry = null;
  self.frames = 0; self.status = { connected: false, live: false };

  function emit(extra) { self.status = Object.assign({}, self.status, extra); cb(self.status); }
  function connect() {
    const url = radioWsUrl();
    if (!url) { emit({ connected: false, error: "افتح الموقع عبر خادم الموقع (node server/server.js) لتفعيل الإذاعة المباشرة." }); return; }
    try { ws = new WebSocket(url); } catch (e) { emit({ connected: false, error: "تعذّر الاتصال بخادم الإذاعة." }); return; }
    ws.binaryType = "arraybuffer";
    ws.onopen = () => { ws.send(JSON.stringify({ type: "listen" })); emit({ connected: true, error: "" }); };
    ws.onmessage = e => {
      if (typeof e.data === "string") { try { const m = JSON.parse(e.data); if (m.type === "status") { emit({ live: m.live, title: m.title, host: m.host, listeners: m.listeners, startedAt: m.startedAt }); if (!m.live) next = 0; } } catch (x) {} return; }
      self.frames++;
      if (playing && ctx) schedule(e.data);
    };
    ws.onclose = () => { emit({ connected: false, live: false }); if (!closed) retry = setTimeout(connect, 3000); };
    ws.onerror = () => { try { ws.close(); } catch (x) {} };
  }
  function schedule(buf) {
    const i16 = new Int16Array(buf.byteLength >> 1 ? buf.slice(0, (buf.byteLength >> 1) << 1) : buf);
    if (!i16.length) return;
    const ab = ctx.createBuffer(1, i16.length, RADIO_RATE), ch = ab.getChannelData(0);
    for (let i = 0; i < i16.length; i++) ch[i] = i16[i] / 32768;
    const src = ctx.createBufferSource(); src.buffer = ab; src.connect(gain);
    const now = ctx.currentTime;
    if (next < now + 0.05) next = now + 0.3;          // إعادة ملء الذاكرة المؤقتة عند أي انقطاع
    src.start(next); next += ab.duration;
  }
  let gain = null;
  self.play = function () {   // يجب أن يُستدعى من نقرة المستخدم (سياسة التشغيل التلقائي)
    if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); gain = ctx.createGain(); gain.connect(ctx.destination); }
    ctx.resume(); playing = true; next = 0; emit({ playing: true });
  };
  self.pause = function () { playing = false; if (ctx) ctx.suspend(); next = 0; emit({ playing: false }); };
  self.setVolume = v => { if (gain) gain.gain.value = v; };
  self.close = function () { closed = true; clearTimeout(retry); try { ws && ws.close(); } catch (e) {} if (ctx) ctx.close(); };
  connect();
}

/* ---------------- المذيع ---------------- */
function RadioHost() {
  const self = this;
  let ws = null, stream = null, ctx = null, proc = null, srcNode = null, analyser = null, rec = null, chunks = [], live = false;
  self.level = 0; self.frames = 0;

  /* opts: {pin,title,host,record:true}; cb(status): {state:"connecting|live|ended|error", error, listeners} */
  self.start = async function (opts, cb) {
    const url = radioWsUrl();
    if (!url) throw new Error("افتح الموقع عبر خادم الموقع (node server/server.js) للبث المباشر.");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("متصفحك لا يدعم الوصول إلى الميكروفون (يلزم https أو localhost).");
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
    await new Promise((resolve, reject) => {
      ws = new WebSocket(url); ws.binaryType = "arraybuffer";
      ws.onopen = () => ws.send(JSON.stringify({ type: "host", pin: String(opts.pin || ""), title: opts.title, host: opts.host }));
      ws.onmessage = e => {
        let m; try { m = JSON.parse(e.data); } catch (x) { return; }
        if (m.type === "ok") { resolve(); }
        else if (m.type === "error") reject(new Error(m.error));
        else if (m.type === "status") cb && cb({ state: "live", listeners: m.listeners });
      };
      ws.onerror = () => reject(new Error("تعذّر الاتصال بخادم الإذاعة. تأكد أن الخادم يعمل."));
      ws.onclose = () => { if (live) { live = false; cleanup(); cb && cb({ state: "ended" }); } else reject(new Error("أُغلق الاتصال بالخادم.")); };
    }).catch(err => { cleanup(); throw err; });

    live = true;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    srcNode = ctx.createMediaStreamSource(stream);
    analyser = ctx.createAnalyser(); analyser.fftSize = 256; srcNode.connect(analyser);
    proc = ctx.createScriptProcessor(4096, 1, 1);
    const ratio = ctx.sampleRate / RADIO_RATE;
    proc.onaudioprocess = e => {
      if (!live || !ws || ws.readyState !== 1) return;
      const inp = e.inputBuffer.getChannelData(0), n = Math.floor(inp.length / ratio), out = new Int16Array(n);
      for (let i = 0; i < n; i++) {   // تخفيض العينة بالمتوسط لتقليل التشويه
        const a = Math.floor(i * ratio), b = Math.min(inp.length, Math.floor((i + 1) * ratio));
        let s = 0; for (let j = a; j < b; j++) s += inp[j];
        const v = Math.max(-1, Math.min(1, s / Math.max(1, b - a)));
        out[i] = v < 0 ? v * 32768 : v * 32767;
      }
      ws.send(out.buffer); self.frames++;
      const d = new Uint8Array(analyser.fftSize); analyser.getByteTimeDomainData(d);
      let mx = 0; for (let i = 0; i < d.length; i++) mx = Math.max(mx, Math.abs(d[i] - 128)); self.level = mx / 128;
    };
    srcNode.connect(proc); proc.connect(ctx.destination);   // ctx.destination بصمت لأن الإخراج صفر
    if (opts.record && window.MediaRecorder) { try { rec = new MediaRecorder(stream); chunks = []; rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); }; rec.start(1000); } catch (e) { rec = null; } }
    cb && cb({ state: "live" });
  };

  function cleanup() {
    try { proc && proc.disconnect(); srcNode && srcNode.disconnect(); } catch (e) {}
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (ctx) { try { ctx.close(); } catch (e) {} }
    stream = ctx = proc = srcNode = null;
  }
  /* يُنهي البث ويعيد التسجيل (File) إن طُلب */
  self.stop = function () {
    return new Promise(resolve => {
      live = false;
      try { ws && ws.readyState === 1 && ws.send(JSON.stringify({ type: "stop" })); ws && ws.close(); } catch (e) {}
      const finish = () => {
        cleanup();
        if (!chunks.length) return resolve(null);
        const type = (rec && rec.mimeType || "audio/webm").split(";")[0];
        resolve(new File([new Blob(chunks, { type })], "بث-مباشر-" + Date.now() + (/ogg/.test(type) ? ".ogg" : ".webm"), { type }));
      };
      if (rec && rec.state !== "inactive") { rec.onstop = finish; rec.stop(); } else finish();
    });
  };
}
