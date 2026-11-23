/** Standalone settings page; dependencies supplied by the game shell. */
export function mountWebsites({ api, esc }) {
  const nav = document.getElementById('cfgTabs');
  const button = document.createElement('button'); button.className = 'cfgtab'; button.dataset.tab = 'sites'; button.textContent = '访问网站'; nav.append(button);
  const page = document.createElement('div'); page.className = 'cfgpage'; page.dataset.page = 'sites'; page.hidden = true; document.querySelector('#cfg .cfgbody').append(page);
  let sites = [];
  const draw = () => {
    page.innerHTML = `<h3>访问网站</h3><p class="cfgnote">她会从已启用的网站里挑选内容。RSS 填订阅地址；网页读取静态文字，不支持登录或动态页面。B站仍使用原来的账号设置。</p><div id="siteRows"></div><button class="gb sm" data-add>添加网站</button> <button class="gb green sm" data-save>保存</button><p role="status" id="siteStatus"></p>`;
    page.querySelector('#siteRows').innerHTML = sites.map((s,i) => `<div class="cfgrow" style="flex-wrap:wrap" data-row="${i}"><label><input type="checkbox" data-key="enabled" ${s.enabled ? 'checked' : ''}>启用</label><input aria-label="网站名称" data-key="name" maxlength="40" placeholder="网站名称" value="${esc(s.name)}"><input aria-label="网站地址" data-key="url" type="url" placeholder="https://" value="${esc(s.url)}" style="flex:1;min-width:200px"><select aria-label="读取方式" data-key="type"><option value="rss" ${s.type==='rss'?'selected':''}>RSS / Atom</option><option value="page" ${s.type==='page'?'selected':''}>普通网页</option></select><input aria-label="分类" data-key="kind" maxlength="20" value="${esc(s.kind)}"><button class="gb plain sm" data-delete="${i}">删除</button></div>`).join('');
  };
  page.addEventListener('input', e => { const key = e.target.dataset.key; if (key) sites[Number(e.target.closest('[data-row]').dataset.row)][key] = key === 'enabled' ? e.target.checked : e.target.value; });
  page.addEventListener('click', async e => {
    if (e.target.hasAttribute('data-add')) { if(sites.length>=30) return; sites.push({ name:'', url:'', kind:'网站', type:'rss', enabled:true }); draw(); }
    if (e.target.hasAttribute('data-delete')) { sites.splice(Number(e.target.dataset.delete),1); draw(); }
    if (e.target.hasAttribute('data-save')) {
      e.target.disabled = true;
      try { const r = await api('/websites', { sites }); if (!r.ok) throw new Error(r.error || '保存失败'); sites = r.sites; page.querySelector('#siteStatus').textContent = '已保存，下次读取生效'; }
      catch(err) { page.querySelector('#siteStatus').textContent = err.message; }
      finally { e.target.disabled = false; }
    }
  });
  let loaded = false;
  button.addEventListener('click', async () => { if (loaded) return; page.textContent = '正在读取…'; try { const r=await api('/websites'); if(!r.ok) throw new Error(r.error || '读取失败'); sites=r.sites; draw(); loaded=true; } catch(e) { page.textContent=e.message+'，点击访问网站重试'; } });
}
