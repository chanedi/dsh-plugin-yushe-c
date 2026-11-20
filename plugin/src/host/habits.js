/**
 * 她的上网习惯 = 两层配置（F-41 → F-59 / 任务 47b）存储 + 路由。设置页和 DSH 工具改的是同一份 habits.json。
 *
 *   设置页（粗）：GET  /api/dsh-yushe/habits   { habits, summary, fields（只给 ui 字段）, knobs: [{key,label,levels,level}], fine: 细项分组（只读） }
 *                POST /api/dsh-yushe/habits   { 字段: 值 }（只认 ui 字段）或 { knob: 'depth', level: '深', force? }
 *                     档位现在是「自定义」（聊天定制过）时不带 force 会返回 needsForce，让页面先问一句「会覆盖」。
 *   配置页-1（F-97）：GET 带 full=1 多回 page（左侧五个 tab 的细配置视图，含今天的用量）；
 *                POST { page: true, base: { 字段: 页面看到的旧值 }, 字段: 新值 }（细项直接改；旧值对不上 = 刚被聊天改过 → 回 stale 不写）、
 *                POST { reset: tab }（这一页恢复默认）。
 *   DSH 工具（细）：propose(changes) 起草、不写，返回 proposalId；apply(proposalId) 才写（30 分钟内有效，只能用一次）。
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { readJsonBody } from './game-routes.js';
import { nowMs } from './clock.js';
import { normalizeHabits, patchHabits, describeHabits, schemaWith, knobLevel, knobPatch, fineView, draftChanges, pageView, same, CUSTOM } from '../shared/habits.js';

export const HABITS_PATH = '/api/dsh-yushe/habits';
const RESET_KEEP = new Set(['speakMode']); // 恢复默认时留在原地的项
const PROPOSAL_TTL = 30 * 60_000;

export function createHabits(storage, { caps = [], usage } = {}) {
  const { fields, knobs } = schemaWith(caps);
  // 配置页用量（F-97）：usage 是宿主给的 { 字段: 今天用了几 }；没给 / 出错就当 {}（页面不显示用量）
  const usageOf = () => { let u = {}; try { u = usage?.() || {}; } catch { u = {}; } return u && typeof u === 'object' ? u : {}; };
  const file = join(storage, 'habits.json');
  const get = () => { try { return normalizeHabits(JSON.parse(readFileSync(file, 'utf8')), fields); } catch { return normalizeHabits(null, fields); } };
  const write = (h) => { mkdirSync(storage, { recursive: true }); const tmp = `${file}.tmp`; writeFileSync(tmp, JSON.stringify(h, null, 2)); renameSync(tmp, file); };
  const proposals = new Map();
  const habits = {
    fields, knobs,
    get,
    /** 改一部分。only = 'ui'（设置页）/ 'chat'（工具）/ 'page'（配置页，ui 和 chat 都能改）/ null（宿主内部）。 */
    patch(p, { only = null } = {}) {
      const r = patchHabits(get(), p, { fields, only });
      if (r.changed.length) { write(r.habits); try { habits.onChange?.(r.habits, r.changed); } catch { /* 通知失败不影响写 */ } }
      return r;
    },
    /** 配置页改一项（F-97）：base 是页面看到的旧值——对不上说明刚被聊天改过，一项都不写，回 stale（现在是多少）。 */
    pagePatch(p, { base = {} } = {}) {
      const h = get();
      const stale = [];
      for (const [k, v] of Object.entries(base || {})) {
        if (!fields[k] || !(fields[k].ui || fields[k].chat)) continue;
        if (!same(h[k], v)) stale.push({ key: k, label: fields[k].label, now: h[k] });
      }
      if (stale.length) return { ok: false, stale };
      const r = habits.patch(p, { only: 'page' });
      return { ok: true, changed: r.changed, ignored: r.ignored };
    },
    /** 配置页整页恢复默认（F-97）：只动这一页的项，走 patch（onChange 照旧触发）。 */
    resetTab(tab) {
      const t = pageView(get(), { fields, knobs }).tabs.find((x) => x.key === tab);
      if (!t) return { ok: false, error: `没有「${tab}」这一页` };
      // 「要我批准」是爸妈给她系的安全绳：恢复默认不把它悄悄改回「自己发」（总指挥验收时按审查意见补）
      const r = habits.patch(Object.fromEntries(t.items.filter((it) => !RESET_KEEP.has(it.key)).map((it) => [it.key, fields[it.key].def])), { only: 'page' });
      return { ok: true, changed: r.changed };
    },
    knobList: () => Object.entries(knobs).map(([key, k]) => ({ key, label: k.label, levels: k.levels, level: knobLevel(get(), key, knobs) })),
    /** 设置页拖档位。档位是「自定义」时要 force（页面先问过爸妈）。 */
    setKnob(key, level, { force = false } = {}) {
      const p = knobPatch(key, level, knobs);
      if (!p) return { ok: false, error: '没有这个档位' };
      if (knobLevel(get(), key, knobs) === CUSTOM && !force) return { ok: false, needsForce: true, error: `「${knobs[key].label}」现在是细调过的一套，换成「${level}」会覆盖掉` };
      return { ok: true, ...habits.patch(p) };
    },
    summary: () => describeHabits(get(), { fields, knobs }),
    /** 视图。withUiChat=true 时把「设置页上的、但聊得动」的那几项也并进 fine（工具视图用）；full=true 多回 page（配置页用，含用量）。 */
    view({ withUiChat = false, full = false } = {}) {
      const h = get();
      const v = { habits: h, summary: describeHabits(h, { fields, knobs }), fields: Object.fromEntries(Object.entries(fields).filter(([, f]) => f.ui)), knobs: habits.knobList(), fine: fineView(h, fields, { withUiChat }) };
      if (full) v.page = pageView(h, { fields, knobs, usage: usageOf() });
      return v;
    },
    /** 她起草一份改动（不写）：返回 { ok, proposalId, diff, rejected }。 */
    propose(changes, { reason = '' } = {}) {
      for (const [id, p] of proposals) if (nowMs() - p.at > PROPOSAL_TTL) proposals.delete(id);
      const d = draftChanges(get(), changes, { fields, knobs });
      if (!d.diff.length) return { ok: false, diff: [], rejected: d.rejected, error: d.rejected.length ? '这些都改不了' : '和现在一样，不用改' };
      const id = `P${randomUUID().slice(0, 8)}`;
      proposals.set(id, { at: nowMs(), patch: d.patch, reason: String(reason).slice(0, 80) });
      return { ok: true, proposalId: id, diff: d.diff, rejected: d.rejected };
    },
    /** 爸妈同意后写入：只认 30 分钟内起草过、还没用过的那一份。 */
    apply(id) {
      const p = proposals.get(String(id || ''));
      if (!p || nowMs() - p.at > PROPOSAL_TTL) return { ok: false, error: '找不到这份改动（超过 30 分钟或者已经改过了），重新起草一份' };
      proposals.delete(String(id));
      const r = habits.patch(p.patch, { only: 'chat' });
      return { ok: true, changed: r.changed, reason: p.reason, summary: habits.summary() };
    },
  };
  return habits;
}

export function registerHabitsRoutes({ scope, habits, isLoopbackRequest, writeJson }) {
  scope.effect(() => scope.webServer.register({
    kind: 'exact', path: HABITS_PATH,
    handler: async (req, res) => {
      if (!isLoopbackRequest(req)) return writeJson(res, 403, { ok: false, error: 'loopback requests only' });
      if (req.method === 'GET') return writeJson(res, 200, { ok: true, ...habits.view({ full: String(req.url || '').includes('full=1') }) }); // full=1：配置页要多带 page
      if (req.method !== 'POST') return writeJson(res, 405, { ok: false, error: 'method not allowed' });
      const b = await readJsonBody(req);
      if (!b || typeof b !== 'object') return writeJson(res, 400, { ok: false, error: '请求格式不对' });
      if (b.reset) { const r = habits.resetTab(String(b.reset)); return writeJson(res, 200, { ...r, ...habits.view({ full: true }) }); } // 配置页「恢复这一页默认」
      if (b.page === true) { // 配置页改细项：去掉信封，base 是页面看到的旧值（对不上回 stale）
        const p = { ...b }; delete p.page; delete p.base;
        const r = habits.pagePatch(p, { base: b.base });
        return writeJson(res, 200, { ...r, ...habits.view({ full: true }) });
      }
      if (b.knob) { const r = habits.setKnob(String(b.knob), String(b.level || ''), { force: b.force === true }); return writeJson(res, 200, { ...r, ...habits.view(), ok: r.ok }); }
      const r = habits.patch(b, { only: 'ui' }); // 细项只能聊天改（配置页走上面的 page 分支）
      writeJson(res, 200, { ok: true, ...habits.view(), changed: r.changed, ignored: r.ignored });
    },
  }), 'dsh-yushe: habits route');
}
