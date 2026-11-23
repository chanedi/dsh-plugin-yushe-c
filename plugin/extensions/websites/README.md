# 可配置网站扩展

所有功能代码、测试与升级说明集中在本目录。支持 RSS/Atom 与普通静态网页；不支持登录或 JavaScript 渲染。B站功能沿用原来的实现。

## 文件

- host.js：宿主初始化入口。
- config.js：网站校验、本地存储、回环配置路由。
- read.js：公网读取、逐跳重定向检查、超时与大小限制，不携带 B站 Cookie。
- sources.js：来源选择和读取适配，复用宿主解析与清洗函数。
- client.js：设置中的「访问网站」页面，新增、编辑、启停、删除及保存。
- verify.mjs：配置持久化、路由、来源启停与读取适配测试。
- integration.patch：相对原 main 的最小接入补丁。

## 原有代码接入点

只修改四个文件：host/index.js 初始化并挂载路由；host/sources.js 接入来源列表和读取适配；game/main.js 挂载设置页；tools/read/news.js 更新工具说明。其余上游逻辑不变。不复制上游文件，不依赖构建后的代码替换。

## 升级

1. 保留整个 plugin/extensions/websites/ 目录。
2. 合并上游更新，若接入点有冲突，参考 integration.patch 手动保留上述几行。
3. 若是全新上游源码，先运行 `git apply --check plugin/extensions/websites/integration.patch`，通过后运行 `git apply plugin/extensions/websites/integration.patch`；已接入的分支不要重复应用。
4. 运行 `npm ci`、`npm run build`、`node plugin/extensions/websites/verify.mjs` 和 `npm run verify`。
5. 重启 DSH，打开设置 → 访问网站；在本机 DSH 运行时执行 `npm run smoke`。

生成的 plugin/lib/ 和 plugin/game/ 按仓库 .gitignore 留在本地，必须构建后再运行或发布，不提交到源码分支。

## 配置兼容与验证

沿用插件存储目录的 websites.json（version 1），本次整理无需迁移已保存的网站。未配置时保留六个默认源；空列表表示不读取额外网站。配置供新闻工具、念新闻和旧 headless 素材预取共用，鱼自主决定去哪，不保证每趟访问所有站点。

Windows 上原验证存在权限 600 和验证脚本自身脱敏两项失败；本机 DSH 未启动，实际界面及 smoke 尚待验证。
