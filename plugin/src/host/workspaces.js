/**
 * 她在哪些工作区上工（F-64 → F-96 多选）。领养时勾；设置里能换；空列表 = 所有工作区（老鱼没选过就是这样）。
 * 鱼记录里存 `workspaces: [{id,title,path}]`；老存档的单个 `workspace` 读鱼塘时迁成一项的列表（pond.js）。
 *
 * 勾了工作区以后：勾中的任一个工作区里爸妈发的每一句都算她干的活（合成一个总数），人设和近况只放进这些工作区的对话；
 * 别的工作区里她不出现。「找她干活」在勾中的里面挑最近用过的那个开新对话。
 *
 *   GET  /api/dsh-yushe/workspaces   { list:[{id,title,path}]（最近用过的在前）, current: 当前鱼的工作区列表（最近用过的在前；[] = 所有） }
 *   POST /api/dsh-yushe/workspaces   { workspaceIds: [...] }  换当前鱼的工作区（id 必须是 DSH 里真有的；[] = 所有工作区）
 *                                    老写法 { workspaceId | null } 照收
 *
 * 工作区来自宿主的 workspaceRegistry（path 是 realpath）；会话属于哪个工作区看 agent.session.header.cwd。
 */
import { readJsonBody } from './game-routes.js';

export const WORKSPACES_PATH = '/api/dsh-yushe/workspaces';

/** 会话的工作目录在不在她的工作区里（null = 所有工作区都算）。 */
export function inWorkspace(cwd, ws) {
  if (!ws) return true;
  const p = String(ws.path || '').replace(/\/+$/, '');
  const c = String(cwd || '');
  if (!p || !c) return false;
  return c === p || c.startsWith(`${p}/`);
}

/** 鱼的工作区列表（F-96）：新存档 workspaces，老存档单个 workspace；都没有 = []（所有工作区）。 */
export function workspacesOf(f) {
  if (Array.isArray(f?.workspaces)) return f.workspaces.filter((w) => w && w.path);
  return f?.workspace?.path ? [f.workspace] : [];
}

/** 会话在不在她勾的任一个工作区里（空列表 / null = 所有工作区都算）。 */
export function inWorkspaces(cwd, list) {
  const ls = Array.isArray(list) ? list : (list ? [list] : []);
  return !ls.length || ls.some((w) => inWorkspace(cwd, w));
}

/** 按最近用过排序（registry 顺序）；不在表里的排后面，保持原序。 */
export function byRecency(list, registryList) {
  const rank = new Map((registryList || []).map((w, i) => [w.id, i]));
  return list.map((w, i) => [w, rank.has(w.id) ? rank.get(w.id) : 1e6 + i]).sort((a, b) => a[1] - b[1]).map(([w]) => w);
}

/** 从会话里拿工作目录。 */
export const cwdOfAgent = (agent) => agent?.session?.header?.cwd || agent?.session?.header?.meta?.cwd || null;

export function createWorkspaces({ getRegistry }) {
  const list = () => {
    let reg; try { reg = getRegistry(); } catch { reg = null; }
    if (!reg?.list) return [];
    try {
      return reg.list().filter((w) => w?.id && w.path)
        .map((w) => ({ id: String(w.id), title: String(w.title || w.path.split('/').pop() || w.path).slice(0, 40), path: String(w.path), updatedAt: String(w.updatedAt || '') }))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch { return []; }
  };
  return {
    list,
    /** 按 id 找；找不到返回 null。存进鱼里的只留 id / 标题 / 路径。 */
    resolve(id) { const w = list().find((x) => x.id === String(id)); return w ? { id: w.id, title: w.title, path: w.path } : null; },
  };
}

/** 请求里要的工作区 id：{workspaceIds:[...]}，或老写法 {workspaceId|null}；去重、最多 20 个；格式不对返回 null。 */
export function idsOf(b) {
  if (Array.isArray(b?.workspaceIds)) return [...new Set(b.workspaceIds.filter((x) => typeof x === 'string' && x).map(String))].slice(0, 20);
  if (b && 'workspaceId' in b) return b.workspaceId ? [String(b.workspaceId)] : [];
  return null;
}

export function registerWorkspaceRoutes({ scope, pond, workspaces, isLoopbackRequest, writeJson }) {
  scope.effect(() => scope.webServer.register({ kind: 'exact', path: WORKSPACES_PATH, handler: async (req, res) => {
    if (!isLoopbackRequest(req)) return writeJson(res, 403, { ok: false, error: 'loopback requests only' });
    const f = pond.current();
    const all = workspaces.list();
    const view = (fish) => byRecency(workspacesOf(fish), all);
    if (req.method === 'GET') return writeJson(res, 200, { ok: true, list: all.map(({ id, title, path }) => ({ id, title, path })), current: view(f) });
    if (req.method !== 'POST') return writeJson(res, 405, { ok: false, error: 'method not allowed' });
    const b = await readJsonBody(req);
    if (!f) return writeJson(res, 200, { ok: false, error: '现在没有鱼在上工' });
    const ids = idsOf(b);
    if (!ids) return writeJson(res, 200, { ok: false, error: '请求格式不对' });
    const picked = ids.map((id) => workspaces.resolve(id));
    if (picked.some((w) => !w)) return writeJson(res, 200, { ok: false, error: '没有这个工作区' });
    writeJson(res, 200, { ok: true, current: view(pond.setWorkspaces(f.id, picked)) });
  } }), 'dsh-yushe: workspaces route');
}
