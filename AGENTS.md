# 陈煜的个人网站

开始接续工作时查看 Git 状态、最近提交及 `handoff/progress.md`。保留已有的未提交修改。

网站入口、书架和详情构建源文件在 `homepage/`。正文与文章素材在 `content/blog/`。新增文章前先看 `content/README.md`。已发布文章应保留分类与文件夹名以维持链接。公开仓库只提交适合公开的内容。

运行 `npm run build` 生成 `dist/`，用本地 HTTP 服务检查。空白测试书由 `npm run build:preview` 单独生成。核验阶段完成后记录进度并提交。

## 记录改动与验证

每次修复 Bug，或修改功能、交互、视觉与动效、性能、构建或部署，都要在提交前更新 `handoff/progress.md`。同一任务的多次打磨可归在一条记录下。小改动用一段话写清原问题或需求、具体改动、验证结果。复杂排查或重要功能按[改动记录模板](handoff/change-record-template.md)在 `handoff/` 写独立 Markdown，再从进度记录链接过去。

给足可复查的证据，例如修改涉及的页面与文件、复现环境、对照结果、相关提交或部署链接。区分本地验证与线上验证，标明待确认的结果。适合整理简历的改动应注明用户已确认的个人贡献和 Agent 协助范围。没有实测的数据或未确认的个人贡献留待核实。

## 发布到 GitHub Pages

线上个人站是 [yuchen.ink](https://yuchen.ink/)。发布仓库为 [Giveme10minutes/chenyu-site](https://github.com/Giveme10minutes/chenyu-site)，由 `main` 的 `.github/workflows/pages.yml` 构建并发布 `dist/`。`Giveme10minutes/Giveme10minutes` 是旧站仓库。

发布前用 `git remote -v` 检查实际推送地址，用 GitHub Pages 设置核对仓库、发布方式和线上域名。地址或部署配置不一致时先查明原因。以线上仓库最新的 `main` 为基线集成和验证改动，推送后以对应提交的部署结果确认发布状态。仅在用户明确要求时进行线上网页效果验证。
