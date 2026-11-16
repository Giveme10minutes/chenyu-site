# 个人网站与面试复习

接续任务前先查看 Git 状态、最近的提交和 [进度](handoff/progress.md)，并阅读 [已定方案](handoff/decisions.md)。未提交的文件可能来自其他聊天，保留其现有内容。

线上个人站是 [yuchen.ink](https://yuchen.ink/)，发布仓库是 [Giveme10minutes/chenyu-site](https://github.com/Giveme10minutes/chenyu-site)。发布前切到同级的 `../chenyu-site` 工作目录，以该仓库最新的 `main` 集成改动，并用 `git remote -v` 和 GitHub Pages 设置核对推送仓库、发布方式和域名。线上由 `main` 的 GitHub Actions 构建并发布 `dist/`，以对应提交的部署结果确认发布状态。仅在用户明确要求时进行线上网页效果验证。

`Giveme10minutes/Giveme10minutes` 保留旧站。本目录的博客实验源码在 `homepage/`，预览构建输出到 `docs/blog/`。旧版页面和资源保存在 `docs/classic/`、`docs/showcase/`，学习区在 `docs/study/`。知识点内容放在 `topics.js`，请保留既有知识点 ID，浏览器进度和直达链接会用到它们。

根据原项目的源码或公开记录更新学习材料，并注明适用版本。区分项目现状、通用原理、改进设想和用户本人确认的贡献。公开仓库里只提交适合公开的内容。

每次修复 Bug，或修改功能、交互、视觉与动效、性能、构建或部署，都在提交前更新 `handoff/progress.md`。同一任务的多次打磨可合并记录，小改动写清问题或需求、具体改动与验证状态。重要功能和复杂排查在 `handoff/` 新增独立 Markdown，并从进度链接过去。记录可核验的源码、提交或对照结果，注明本地、线上或待验证。用于简历时区分用户本人已确认的贡献与 Agent 协助范围，仅使用有证据的数据。

测试可通过站点目录的本地 HTTP 服务进行，例如在仓库根目录运行 `python3 -m http.server 8000 --directory docs`。
