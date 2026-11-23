/** Independent website configuration. No platform credentials are used here. */
import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { readJsonBody } from '../game-routes.js';
let file;
let defaults = [];
export function initWebsites(storage, initial) { file = join(storage, 'websites.json'); defaults = initial; }
export function validateSites(sites) {
  if (!Array.isArray(sites) || sites.length > 30) throw new Error('最多配置 30 个网站');
  const urls = new Set();
  return sites.map((s, i) => {
    const u = new URL(s.url);
    if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password || u.hash) throw new Error('请填写不含账号、密码或锚点的 HTTP(S) 地址');
    if (!s.name?.trim() || s.name.length > 40 || !['rss', 'page'].includes(s.type) || typeof s.enabled !== 'boolean') throw new Error('请检查网站名称、类型和启用状态');
    if (urls.has(u.href)) throw new Error('网站地址不能重复'); urls.add(u.href);
    return { id: `site-${i}`, name: s.name.trim(), url: u.href, kind: String(s.kind || '网站').slice(0, 20), type: s.type, enabled: s.enabled };
  });
}
export function websiteSources(fallback = defaults) {
  if (!file) return fallback;
  try { return validateSites(JSON.parse(readFileSync(file, 'utf8')).sites); }
  catch (e) { if (e.code === 'ENOENT') return defaults.map(s => ({ ...s, type: 'rss', enabled: true })); throw e; }
}
export function registerWebsiteRoutes({ scope, isLoopbackRequest, writeJson }) {
  scope.effect(() => scope.webServer.register({ kind: 'exact', path: '/api/dsh-yushe/websites', handler: async (req, res) => {
    if (!isLoopbackRequest(req)) return writeJson(res, 403, { ok: false });
    try {
      if (req.method === 'GET') return writeJson(res, 200, { ok: true, sites: websiteSources() });
      if (req.method !== 'POST') return writeJson(res, 405, { ok: false });
      if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) return writeJson(res, 403, { ok: false });
      const b = await readJsonBody(req);
      const sites = validateSites(b?.sites);
      mkdirSync(join(file, '..'), { recursive: true });
      writeFileSync(file + '.tmp', JSON.stringify({ version: 1, sites }, null, 2), { mode: 0o600 });
      renameSync(file + '.tmp', file);
      writeJson(res, 200, { ok: true, sites });
    } catch (e) { writeJson(res, 400, { ok: false, error: e.message }); }
  }}), 'dsh-yushe: websites');
}
