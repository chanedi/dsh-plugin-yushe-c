// dsh-yushe client bundle — 由 plugin/scripts/build.mjs 生成，勿手改
window.__ModuleLoader__.load({ id: 'dsh-plugin-yushe', factory(require) {
var __dshYushe = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // plugin/src/client/index.js
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default
  });
  var import_react = __toESM(__require("react"), 1);
  var h = import_react.default.createElement;
  var Ic = (n, size = 16) => h("img", { src: `/api/dsh-yushe/game/assets/icons/${n}.webp`, alt: "", style: { width: size, height: size, verticalAlign: "-3px", objectFit: "contain", marginRight: 3 } });
  var STATUS_PATH = "/api/dsh-yushe/status";
  var SAY_PATH = "/api/dsh-yushe/probe/say";
  var ROAM_PATH = "/api/dsh-yushe/probe/roam";
  var GAME_URL = "/api/dsh-yushe/game/";
  var CURRENT_PATH = "/api/dsh-yushe/current";
  var gameStore = {
    open: false,
    listeners: /* @__PURE__ */ new Set(),
    set(open) {
      gameStore.open = open;
      for (const l of [...gameStore.listeners]) l();
    },
    subscribe(l) {
      gameStore.listeners.add(l);
      return () => gameStore.listeners.delete(l);
    }
  };
  var statusStore = { tick: 0, listeners: /* @__PURE__ */ new Set(), bump() {
    statusStore.tick++;
    for (const l of [...statusStore.listeners]) l();
  } };
  function GameOverlay() {
    const [open, setOpen] = import_react.default.useState(gameStore.open);
    import_react.default.useEffect(() => gameStore.subscribe(() => setOpen(gameStore.open)), []);
    import_react.default.useEffect(() => {
      if (!open) return void 0;
      const onMsg = (e) => {
        if (e.origin === location.origin && e.data?.type === "dsh-yushe:close") {
          gameStore.set(false);
          statusStore.bump();
        }
      };
      const onKey = (e) => {
        if (e.key === "Escape") gameStore.set(false);
      };
      window.addEventListener("message", onMsg);
      window.addEventListener("keydown", onKey);
      return () => {
        window.removeEventListener("message", onMsg);
        window.removeEventListener("keydown", onKey);
      };
    }, [open]);
    if (!open) return null;
    return h(
      "div",
      { "data-dsh-yushe": "overlay", style: { position: "fixed", inset: 0, zIndex: 1e3, background: "var(--dsw-alias-bg-mask-1, rgba(0,0,0,.45))", display: "flex", alignItems: "center", justifyContent: "center", padding: "min(3vw, 28px)" } },
      h("iframe", { title: "\u9C7C\u793E", src: GAME_URL, style: { width: "100%", height: "100%", maxWidth: 1400, border: 0, borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,.35)", background: "#7fd0f2" }, allow: "clipboard-write" })
    );
  }
  var PANEL_KEY = "dsh-yushe";
  function YushePage() {
    return h(
      "div",
      { "data-dsh-yushe": "page", style: { height: "100%", width: "100%", display: "flex", background: "#7fd0f2", overflow: "hidden" } },
      h("iframe", { title: "\u9C7C\u793E", src: `${GAME_URL}?mode=panel`, style: { flex: 1, width: "100%", height: "100%", border: 0 }, allow: "clipboard-write" })
    );
  }
  var FishGlyph = ({ size = 16 } = {}) => h(
    "svg",
    { width: size, height: size, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.5, "aria-hidden": true },
    h("path", { d: "M13.5 8c-1.6-2.6-5.6-3.2-8 0l-3-2.2.9 2.2-.9 2.2 3-2.2c2.4 3.2 6.4 2.6 8 0z", strokeLinejoin: "round" }),
    h("circle", { cx: 10.6, cy: 7.4, r: 0.6, fill: "currentColor" })
  );
  var wsLine = (f) => {
    const ws = Array.isArray(f?.workspaces) ? f.workspaces : f?.workspace ? [f.workspace] : [];
    return ws.length > 2 ? `\u300C${ws[0].title}\u300D\u7B49 ${ws.length} \u5904` : ws.map((w) => `\u300C${w.title}\u300D`).join("");
  };
  function FishDock() {
    const [st, setSt] = import_react.default.useState(null);
    import_react.default.useEffect(() => {
      let alive = true;
      const load = () => fetch(STATUS_PATH, { headers: { accept: "application/json" } }).then((r) => r.json()).then((d) => {
        if (alive) setSt(d);
      }).catch(() => {
      });
      load();
      const timer = setInterval(load, 6e4);
      const l = () => load();
      statusStore.listeners.add(l);
      return () => {
        alive = false;
        clearInterval(timer);
        statusStore.listeners.delete(l);
      };
    }, []);
    const f = st?.fish;
    if (!f) return null;
    const n = f.now || {};
    const sleeping = n.where === "sleep";
    return h(
      "button",
      {
        type: "button",
        "data-dsh-yushe": "dock",
        onClick: () => gameStore.set(true),
        title: `${f.name}\uFF08${f.rarity} \xB7 ${f.personality}\uFF09${wsLine(f) ? `\u5728${wsLine(f)}\u91CC\u66FF\u4F60\u5E72\u6D3B` : "\u6B63\u5728\u66FF\u4F60\u5E72\u6D3B"}\uFF0C\u70B9\u6211\u53BB\u9C7C\u793E\u770B\u5979`,
        style: { display: "inline-flex", alignItems: "center", gap: 6, margin: "0 0 6px", padding: "2px 10px 2px 3px", borderRadius: 999, border: "1px solid var(--dsw-alias-border-default, #ddd)", background: "var(--dsw-alias-bg-default, #fff)", cursor: "pointer", fontSize: 12, color: "var(--dsw-alias-text-default, inherit)" }
      },
      h("img", { src: `/api/dsh-yushe/game/assets/head-${f.proto}.webp`, alt: "", style: { width: 20, height: 20, borderRadius: "50%", objectFit: "cover" } }),
      h("b", { style: { fontWeight: 600 } }, f.name),
      // 这一条在所有对话的输入框上都会出现（插槽不告诉我们当前对话在哪个工作区），所以写清楚她在哪儿上工（F-64）
      h("span", { style: { opacity: 0.75 } }, Ic(sleeping ? "moon" : "work", 14), wsLine(f) ? `${sleeping ? "\u7761\u7740\u4E86\uFF0C" : ""}\u5728${wsLine(f)}\u4E0A\u5DE5` : sleeping ? "\u7761\u7740\u4E86\u4E5F\u5728\u4E0A\u5DE5" : "\u4E0A\u5DE5\u4E2D"),
      n.moodIcon && h("span", { title: `\u5FC3\u60C5${n.moodWord} \xB7 \u7CBE\u529B ${n.energy}` }, Ic(n.moodIcon, 16))
    );
  }
  function HeroChip() {
    return h("button", { type: "button", onClick: () => gameStore.set(true), title: "\u53BB\u9C7C\u793E\u9886\u517B\u4E00\u6761 AI \u9C7C", style: { padding: "4px 12px", borderRadius: 999, border: "1px solid var(--dsw-alias-border-default, #ddd)", background: "var(--dsw-alias-bg-default, #fff)", cursor: "pointer", fontSize: 13 } }, Ic("rod", 16), "\u9886\u517B\u4E00\u6761\u9C7C");
  }
  function FishCard({ status, reload }) {
    const f = status?.fish;
    const rest = async (on) => {
      await fetch(CURRENT_PATH, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: on ? status.lastFish : null }) });
      reload();
    };
    return h(
      "div",
      { style: box },
      h("div", { style: { fontSize: 18, fontWeight: 700, marginBottom: 4 } }, Ic("fish", 20), "\u9C7C\u793E"),
      f ? h("div", { style: { fontSize: 14 } }, `\u6B63\u5728\u4E0A\u5DE5\uFF1A`, h("b", null, f.name), `\uFF08${f.rarity} \xB7 ${f.personality}\uFF09\uFF0C\u5979\u53EB\u4F60\u300C${f.parentCall}\u300D\u3002\u4E0B\u4E00\u6761\u6D88\u606F\u8D77\u5C31\u662F\u5979\u5728\u56DE\u7B54\u3002`) : h("div", { style: { ...dim, fontSize: 13.5 } }, status?.lastFish ? "\u5979\u5728\u6B47\u7740\uFF0CDSH \u91CC\u73B0\u5728\u6CA1\u6709\u9C7C\u793E\u7684\u4EBA\u8BBE\u3002" : "\u8FD8\u6CA1\u6709\u9886\u517B\u8FC7\u9C7C\u3002\u53BB\u9C7C\u793E\u6492\u4E00\u628A\u8C37\u5B50\uFF0C\u5B75\u4E00\u6761\u5C5E\u4E8E\u4F60\u7684 AI \u9C7C\u5427\u3002"),
      h(
        "div",
        { style: { display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" } },
        h("button", { type: "button", onClick: () => gameStore.set(true), style: { ...btn, marginTop: 0, fontWeight: 600 } }, f ? "\u56DE\u9C7C\u793E\u770B\u770B" : "\u53BB\u9886\u517B\u4E00\u6761\u9C7C"),
        f && h("button", { type: "button", onClick: () => rest(false), style: { ...btn, marginTop: 0 } }, "\u8BA9\u5979\u6B47\u7740"),
        !f && status?.lastFish && h("button", { type: "button", onClick: () => rest(true), style: { ...btn, marginTop: 0 } }, "\u53EB\u5979\u56DE\u6765\u4E0A\u5DE5")
      )
    );
  }
  var fmtTok = (u) => u ? `\u8F93\u5165 ${u.inputTokens ?? 0} \xB7 \u8F93\u51FA ${u.outputTokens ?? 0}${u.reasoningTokens ? ` \xB7 \u601D\u8003 ${u.reasoningTokens}` : ""} \xB7 \u5408\u8BA1 ${u.totalTokens ?? (u.inputTokens || 0) + (u.outputTokens || 0)} tokens` : "token \u672A\u77E5";
  var btn = { marginTop: 10, padding: "5px 14px", borderRadius: 8, cursor: "pointer" };
  function SayProbe() {
    const [s, setS] = import_react.default.useState({ text: "" });
    const run = import_react.default.useCallback(async () => {
      setS({ text: "", busy: true });
      try {
        const r = await fetch(SAY_PATH, { method: "POST" });
        const reader = r.body.getReader();
        const dec = new TextDecoder();
        let buf = "", text = "";
        for (; ; ) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, i);
            buf = buf.slice(i + 1);
            if (!line) continue;
            const m = JSON.parse(line);
            if (m.type === "delta") {
              text += m.text;
              setS({ text, busy: true });
            } else if (m.type === "done") setS({ text: m.text, done: m });
            else if (m.type === "error") setS({ text, error: m.error });
          }
        }
      } catch (e) {
        setS((p) => ({ ...p, busy: false, error: String(e?.message || e) }));
      }
    }, []);
    return h(
      "div",
      { style: box },
      h("div", { style: { fontWeight: 600 } }, "\u63A2\u9488 S2 \xB7 \u8BA9\u672C\u9C7C\u8BF4\u4E00\u53E5"),
      h("div", { style: { ...dim, fontSize: 12.5 } }, "\u901A\u9053 A\uFF1A\u5BBF\u4E3B\u6A21\u578B\u670D\u52A1 + \u4F60\u7684\u9ED8\u8BA4\u6A21\u578B\uFF0C\u4E0D\u6302\u4EFB\u4F55\u5DE5\u5177\uFF0C\u6D41\u5F0F\u8FD4\u56DE\u3002"),
      (s.text || s.busy) && h("div", { style: { margin: "10px 0 4px", fontSize: 15 } }, Ic("fish", 16), s.text || "\u2026"),
      s.done && h("div", { style: { ...dim, fontSize: 12.5 } }, `${s.done.provider}/${s.done.model} \xB7 ${s.done.ms} ms \xB7 ${fmtTok(s.done.usage)}`),
      s.error && h("div", { style: { color: "var(--dsw-alias-text-danger, #c0392b)", fontSize: 13 } }, `\u5931\u8D25\uFF1A${s.error}`),
      h("button", { type: "button", onClick: run, disabled: s.busy, style: btn }, s.busy ? "\u5979\u5728\u60F3\u2026" : "\u8BA9\u672C\u9C7C\u8BF4\u4E00\u53E5")
    );
  }
  function RoamProbe() {
    const [s, setS] = import_react.default.useState({});
    const poll = import_react.default.useRef(null);
    import_react.default.useEffect(() => () => clearInterval(poll.current), []);
    const run = import_react.default.useCallback(async () => {
      clearInterval(poll.current);
      setS({ busy: true });
      try {
        const { id, error } = await (await fetch(ROAM_PATH, { method: "POST" })).json();
        if (!id) throw new Error(error || "\u6CA1\u62FF\u5230\u4EFB\u52A1 id");
        poll.current = setInterval(async () => {
          const j2 = await (await fetch(`${ROAM_PATH}?id=${encodeURIComponent(id)}`)).json();
          if (j2.state === "running") setS({ busy: true, elapsed: j2.elapsedMs });
          else {
            clearInterval(poll.current);
            setS({ job: j2 });
          }
        }, 3e3);
      } catch (e) {
        setS({ error: String(e?.message || e) });
      }
    }, []);
    const j = s.job;
    return h(
      "div",
      { style: box },
      h("div", { style: { fontWeight: 600 } }, "\u63A2\u9488 S3 \xB7 \u8BD5\u7740\u51FA\u95E8\u4E00\u6B21"),
      h("div", { style: { ...dim, fontSize: 12.5 } }, "\u901A\u9053 B\uFF1A\u5BBF\u4E3B\u5148\u53D6\u597D\u4ECA\u5929\u7684\u65B0\u95FB\u548C B\u7AD9\u70ED\u95E8\uFF0C\u5979\u8D77\u4E00\u8F6E headless \u6311\u559C\u6B22\u7684\u3001\u6700\u591A\u8BFB 3 \u9875\uFF1B\u53EA\u770B\u4E0D\u8BF4\u3002\u5927\u7EA6 1 \u5206\u949F\u3002"),
      s.busy && h("div", { style: { marginTop: 8 } }, Ic("bag", 16), `\u5979\u51FA\u95E8\u4E86\u2026 ${s.elapsed ? Math.round(s.elapsed / 1e3) + " \u79D2" : ""}`),
      s.error && h("div", { style: { color: "var(--dsw-alias-text-danger, #c0392b)", fontSize: 13, marginTop: 8 } }, `\u5931\u8D25\uFF1A${s.error}`),
      j && h(
        "div",
        { style: { marginTop: 8, fontSize: 13.5 } },
        h("div", null, `${j.state === "done" ? "\u56DE\u5BB6\u4E86" : j.state === "timeout" ? "\u8D85\u65F6\u4E86" : "\u51FA\u9519\u4E86"} \xB7 ${Math.round((j.ms || 0) / 1e3)} \u79D2 \xB7 ${fmtTok(j.usage)}${j.usage ? ` \xB7 \u8C03\u4E86 ${j.usage.calls} \u6B21\u6A21\u578B` : ""}`),
        j.usage?.toolCalls && Object.keys(j.usage.toolCalls).length > 0 && h("div", { style: dim }, `\u7528\u5230\u7684\u5DE5\u5177\uFF1A${Object.entries(j.usage.toolCalls).map(([k, v]) => `${k}\xD7${v}`).join("\u3001")}`),
        j.error && h("pre", { style: { whiteSpace: "pre-wrap", fontSize: 12, ...dim } }, j.error),
        j.result?.seen && h("ul", { style: { margin: "8px 0", paddingLeft: 18 } }, j.result.seen.map((x, i) => h("li", { key: i }, `${x.verified ? "\u5DF2\u6838\u5B9E" : "\u672A\u6838\u5B9E"} [${x.source || x.kind}] `, h("a", { href: x.url, target: "_blank", rel: "noreferrer" }, x.title), ` \u2014\u2014 ${x.why}`))),
        j.result?.postcard && h("div", { style: { padding: "8px 12px", borderRadius: 10, background: "var(--dsw-alias-bg-subtle, #f6f3ee)" } }, Ic("postcard", 16), j.result.postcard),
        !j.result && j.rawTail && h("pre", { style: { whiteSpace: "pre-wrap", fontSize: 12, ...dim } }, j.rawTail)
      ),
      h("button", { type: "button", onClick: run, disabled: s.busy, style: btn }, s.busy ? "\u5728\u5916\u9762\u2026" : "\u8BD5\u7740\u51FA\u95E8\u4E00\u6B21")
    );
  }
  var box = { border: "1px solid var(--dsw-alias-border-default, #ddd)", borderRadius: 12, padding: "14px 16px", marginBottom: 12, lineHeight: 1.7 };
  var row = { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 };
  var dim = { color: "var(--dsw-alias-text-secondary, #888)" };
  function Flag({ ok, yes, no }) {
    return h("span", { style: { color: ok ? "var(--dsw-alias-text-success, #2e7d5b)" : "var(--dsw-alias-text-warning, #b4502a)", fontWeight: 600 } }, ok ? yes : no);
  }
  function YusheSettings() {
    const [state, setState] = import_react.default.useState({ loading: true });
    const load = import_react.default.useCallback(() => {
      setState({ loading: true });
      fetch(STATUS_PATH, { headers: { accept: "application/json" } }).then((r) => r.json()).then((data) => setState({ data })).catch((error) => setState({ error: String(error?.message || error) }));
    }, []);
    import_react.default.useEffect(load, [load]);
    import_react.default.useEffect(() => {
      const l = () => load();
      statusStore.listeners.add(l);
      return () => statusStore.listeners.delete(l);
    }, [load]);
    const d = state.data;
    return h(
      "div",
      { "data-dsh-yushe": "settings", style: { maxWidth: 640 } },
      h(FishCard, { status: d, reload: load }),
      h(
        "div",
        { style: box },
        h("div", { style: { fontWeight: 600, marginBottom: 6 } }, "\u5BBF\u4E3B\u72B6\u6001"),
        state.loading && h("div", { style: dim }, "\u8BFB\u53D6\u4E2D\u2026"),
        state.error && h("div", { style: { color: "var(--dsw-alias-text-danger, #c0392b)" } }, `\u8BFB\u53D6\u5931\u8D25\uFF1A${state.error}`),
        d && h(
          import_react.default.Fragment,
          null,
          h("div", { style: row }, h("span", null, "\u63D2\u4EF6\u7248\u672C"), h("span", null, `${d.plugin} ${d.version}`)),
          h("div", { style: row }, h("span", null, "\u5BBF\u4E3B\u6A21\u578B\u670D\u52A1\uFF08\u901A\u9053 A\uFF09"), h(Flag, { ok: d.host?.llm, yes: "\u53EF\u7528", no: "\u62FF\u4E0D\u5230" })),
          h("div", { style: row }, h("span", null, "\u9ED8\u8BA4\u6A21\u578B"), h("span", null, d.host?.defaultModel ? `${d.host.defaultModel.provider} / ${d.host.defaultModel.model}` : "\u672A\u9009\u62E9")),
          h("div", { style: row }, h("span", null, "\u4F1A\u8BDD\u670D\u52A1 agents"), h(Flag, { ok: d.host?.agents, yes: "\u53EF\u7528", no: "\u62FF\u4E0D\u5230" })),
          h("div", { style: row }, h("span", null, "\u9C7C\u7684 B\u7AD9\u53F7"), h(Flag, { ok: d.bili?.loggedIn, yes: "\u5DF2\u767B\u5F55", no: "\u672A\u767B\u5F55\uFF08\u8FD0\u884C tools/bili-login.mjs\uFF09" })),
          h("div", { style: { ...row, ...dim, marginTop: 6 } }, h("span", null, "\u5BBF\u4E3B\u7AEF\u542F\u52A8\u4E8E"), h("span", null, d.startedAt))
        ),
        h("button", { type: "button", onClick: load, style: { marginTop: 10, padding: "4px 12px", borderRadius: 8, cursor: "pointer" } }, "\u5237\u65B0")
      ),
      h(SayProbe),
      h(RoamProbe)
    );
  }
  var index_default = {
    inject: ["slots"],
    apply(ctx) {
      if (typeof ctx.inject === "function") {
        ctx.inject(["sessions", "uiWorkspace"], (scope) => {
          scope.effect(() => {
            const onMsg = async (e) => {
              if (e.origin !== location.origin || e.data?.type !== "dsh-yushe:work") return;
              gameStore.set(false);
              try {
                const ws = scope.uiWorkspace ?? scope.get("uiWorkspace");
                const name = typeof e.data.name === "string" ? e.data.name.slice(0, 20) : "";
                const wsId = typeof e.data.workspaceId === "string" && e.data.workspaceId ? e.data.workspaceId : void 0;
                if (typeof ws?.startSession === "function") {
                  try {
                    ws.startSession(wsId, { prompt: name ? `${name}\uFF0C\u5E2E\u6211\u4E2A\u5FD9\uFF1A` : "", clearPreviousDraft: false });
                  } catch {
                    ws.startSession(void 0, { prompt: name ? `${name}\uFF0C\u5E2E\u6211\u4E2A\u5FD9\uFF1A` : "", clearPreviousDraft: false });
                  }
                } else {
                  const sessions = scope.sessions ?? scope.get("sessions");
                  await ws.openSession(await sessions.create({}));
                }
              } catch (err) {
                console.warn("[dsh-yushe] open work session failed:", err);
              }
            };
            window.addEventListener("message", onMsg);
            return () => window.removeEventListener("message", onMsg);
          }, "dsh-yushe: work session bridge");
        });
      }
      ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: PANEL_KEY }, YushePage));
      ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({ name: "sidebar.panellist", id: PANEL_KEY, order: 4, label: () => "\u9C7C\u793E" }, FishGlyph));
      ctx.slots.inject("shell.overlay", () => ctx.slots.register({ name: "shell.overlay", id: "dsh-yushe-game", order: 60 }, GameOverlay));
      ctx.slots.inject("conversation.hero.options", () => ctx.slots.register({ name: "conversation.hero.options", id: "dsh-yushe-hero", order: 45 }, HeroChip));
      ctx.slots.inject("conversation.composer.dock", () => ctx.slots.register({ name: "conversation.composer.dock", id: "dsh-yushe-dock", order: 61 }, FishDock));
      ctx.slots.inject("settings.section", () => ctx.slots.register({
        name: "settings.section",
        id: "dsh-yushe",
        order: 19,
        label: () => "\u9C7C\u793E"
      }, YusheSettings));
    }
  };
  return __toCommonJS(index_exports);
})();
return __dshYushe.default;
} });
