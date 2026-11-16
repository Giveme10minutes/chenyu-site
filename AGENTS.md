# 陈煜的个人网站

开始接续工作时查看 Git 状态、最近提交及 `handoff/progress.md`。保留已有的未提交修改。

网站入口、书架和详情构建源文件在 `homepage/`。正文与文章素材在 `content/blog/`。新增文章前先看 `content/README.md`。已发布文章应保留分类与文件夹名以维持链接。公开仓库只提交适合公开的内容。

运行 `npm run build` 生成 `dist/`，用本地 HTTP 服务检查。空白测试书由 `npm run build:preview` 单独生成。核验阶段完成后记录进度并提交。

## 发布到 GitHub Pages

线上个人站是 [yuchen.ink](https://yuchen.ink/)。发布仓库为 [Giveme10minutes/chenyu-site](https://github.com/Giveme10minutes/chenyu-site)，由 `main` 的 `.github/workflows/pages.yml` 构建并发布 `dist/`。`Giveme10minutes/Giveme10minutes` 是旧站仓库。

发布前用 `git remote -v` 检查实际推送地址，用 GitHub Pages 设置核对仓库、发布方式和线上域名。地址或部署配置不一致时先查明原因。以线上仓库最新的 `main` 为基线集成和验证改动，推送后检查对应提交的部署结果，并打开本次修改的线上页面。
