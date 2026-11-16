# 开发进度

## 独立个人站首版 · 2026-11-16

- 从原项目的 `d9d6349` 提取双排书架、肖像、蝴蝶转场与 6 篇 Markdown 文章。肖像素材随新项目维护，原版仓库继续保留个人介绍、经典版和学习区。
- 根路径根据浏览器是否完成开场，进入介绍或书架。直达文章可直接读正文，书架可随时重看介绍。
- 构建输出到 `dist/`，由 GitHub Actions 发布。旧的学习区、经典版和作品集路径保留跳转入口。旧博客路径继续由新版博客使用。
- 干净安装与构建通过。用项目子路径在 Chrome 测试首次访问、中途离开、转场完成、跳过开场、回访和重看介绍。也覆盖手机、详情页直达与返回，以及关闭站点存储时的行为。

## GitHub Pages 上线 · 2026-11-16

- 独立仓库 [Giveme10minutes/chenyu-site](https://github.com/Giveme10minutes/chenyu-site) 的首发构建通过 [Pages 发布任务](https://github.com/Giveme10minutes/chenyu-site/actions/runs/43783953901)。
- 先验证默认 Pages 项目路径，再把 `yuchen.ink` 绑定到新仓库。HTTPS 已启用，原有 GitHub Pages DNS 记录继续使用。
- 已在新域名重测首次访问、回访、重看介绍、手机详情直达及返回。旧路径 `/study/`、`/classic/`、`/showcase/` 复查可达，学习区的锚点随跳转保留。原仓库仍通过 [原版主页](https://giveme10minutes.github.io/Giveme10minutes/) 提供对应内容。

### 首页跳转前的白页 · 2026-11-16

- 首页在读取 HTML 时就确定目的地，免去等待入口模块的网络请求。自动跳转期间隐藏备用链接，并使用与目的页一致的背景色。关闭 JavaScript 时可手动打开介绍或博客。旧入口模块继续提供给缓存了旧版首页的浏览器。
- 本地 Chrome 验证首次访问、回访、屏蔽存储、关闭 JavaScript 和跳转途中等待目的页的状态。
