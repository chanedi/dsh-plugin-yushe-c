import { request } from 'node:https';
import { request as httpRequest } from 'node:http';
import { lookup } from 'node:dns/promises';
export function publicAddress(ip) {
  if (ip.includes(':')) return /^[23][0-9a-f]{3}:/i.test(ip) && !ip.toLowerCase().startsWith('2001:');
  const [a,b] = ip.split('.').map(Number);
  return a > 0 && a < 224 && ![10,127].includes(a) && !(a===169 && b===254) && !(a===172 && b>=16 && b<=31) && !(a===192 && [0,168].includes(b)) && !(a===100 && b>=64 && b<=127) && !(a===198 && [18,19].includes(b));
}
export async function readWebsite(url, hops = 0) {
  const u = new URL(url);
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password || hops > 4) throw new Error('网站地址或重定向不受支持');
  const hostname = u.hostname.replace(/^\[|\]$/g, '');
  const addresses = await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(x => !publicAddress(x.address))) throw new Error('仅支持公网网站');
  const chosen = addresses[0];
  return new Promise((resolve, reject) => {
    const req = (u.protocol === 'https:' ? request : httpRequest)(u, {
      headers: { 'User-Agent': 'Yushe/1.0', Accept: 'text/html,application/rss+xml,application/atom+xml,text/xml' },
      lookup: (_host, opts, cb) => opts.all ? cb(null, [chosen]) : cb(null, chosen.address, chosen.family),
    }, res => {
      if ([301,302,303,307,308].includes(res.statusCode)) { res.resume(); clearTimeout(timer); if (!res.headers.location) return reject(new Error('重定向缺少地址')); resolve(readWebsite(new URL(res.headers.location, u).href, hops + 1)); return; }
      if (res.statusCode !== 200) { res.resume(); clearTimeout(timer); return reject(new Error(`HTTP ${res.statusCode}`)); }
      let size = 0; const chunks = [];
      res.on('data', chunk => { size += chunk.length; if (size > 1024 * 1024) req.destroy(new Error('页面超过 1MB')); else chunks.push(chunk); });
      res.on('end', () => { clearTimeout(timer); resolve(Buffer.concat(chunks).toString('utf8')); });
      res.on('error', reject);
    });
    const timer = setTimeout(() => req.destroy(new Error('读取网站超时')), 8000);
    req.on('error', e => { clearTimeout(timer); reject(e); }); req.end();
  });
}
