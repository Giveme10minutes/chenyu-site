# 博客书架封面

书架支持照片、图文和文字三种排版。每篇文章的 `index.md` 可用 `coverStyle` 选模板。省略时，有图片用图文模板，无图片用文字模板。照片书脊从封面取图，其余书脊使用配色色带。独立设计好的竖版封面可以用 `jacket` 指定，文章详情页使用原有的 `cover`。

- 录入方法与字段示例见[内容维护说明](../content/README.md)。
- [雪山留影](../content/blog/life/snow-mountain/index.md)用用户提供的照片示范照片封面。WebP 仅含图像，未带入原照片的元数据。生活记录默认展开这篇，方便预览。
- [职业探索与学习行动 Agent](../content/blog/projects/career-agent/index.md)示范图文封面，[Java 社区论坛](../content/blog/projects/community-forum/index.md)示范文字封面。
- 本地正常与满架构建均生成 7 篇文章。浏览器桌面预览检查了三种封面、换书换排，以及雪山文章的打开和返回。
