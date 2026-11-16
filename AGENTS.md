# 陈煜的个人网站

开始接续工作时查看 Git 状态、最近提交及 `handoff/progress.md`。保留已有的未提交修改。

网站入口、书架和详情构建源文件在 `homepage/`。正文与文章素材在 `content/blog/`。新增文章前先看 `content/README.md`。已发布文章应保留分类与文件夹名以维持链接。公开仓库只提交适合公开的内容。

运行 `npm run build` 生成 `dist/`，用本地 HTTP 服务检查。GitHub Pages 由 `main` 上的 GitHub Actions 发布。空白测试书由 `npm run build:preview` 单独生成。核验阶段完成后记录进度并提交。
