# 给书架加一本书

1. 在 `content/blog/life/` 或 `content/blog/projects/` 下新建文件夹。文件夹名用小写英文字母、数字和连字符，例如 `weekend-photography`。
2. 复制[生活记录模板](templates/life.md)或[项目模板](templates/project.md)到新文件夹并改名为 `index.md`，然后写标题和正文。可以另外填短书脊名、摘要和真实日期。
3. 有封面就把图片放在文章文件夹内，并在开头填 `cover: cover.webp`。正文图片可用 `![说明](images/photo.webp)`。没有封面时，书架根据标题和分类配色生成文字封面。
4. 在项目根目录运行 `npm run build`，再运行 `python3 -m http.server 8000 --directory dist`。打开 [本地书架](http://127.0.0.1:8000/blog/)检查新书与详情。

## 维护已写好的书

- 修改标题或正文时，保留文件夹名和所属分类，已有详情链接就能继续使用。日期以记录的真实日期为准，未知时可以省略。
- 书架按日期从新到旧排列，无日期的条目按文件夹名排列。每排可在一本书的开头填 `featured: true`，把它设为默认展开的书。
- 源文件在 `content/blog/`。构建生成 `dist/blog/`，平时只编辑源文件。需要删除一本书时删掉对应的源文件夹，再重新构建。
- 需要看满书架的效果时，运行 `npm run build:preview`，再运行 `python3 -m http.server 8001 --directory .preview`，打开[满书架预览](http://127.0.0.1:8001/blog/)。这里会附加空白测试书。
- 公开仓库中的正文和图片均应可公开。私人草稿放在仓库之外。
