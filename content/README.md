# 给书架加一本书

1. 在 `content/blog/life/` 或 `content/blog/projects/` 下新建文件夹。文件夹名用小写英文字母、数字和连字符，例如 `weekend-photography`。
2. 复制[生活记录模板](templates/life.md)或[项目模板](templates/project.md)到新文件夹并改名为 `index.md`，然后写标题和正文。可以另外填短书脊名、摘要和真实日期。
3. 有封面就把图片放在文章文件夹内，并在开头填 `cover: cover.webp`。这张图片也会出现在详情页。正文图片可用 `![说明](images/photo.webp)`。
4. 在项目根目录运行 `npm run build`，再运行 `python3 -m http.server 8000 --directory docs`。打开 [本地书架](http://127.0.0.1:8000/blog/)检查新书与详情。

## 维护已写好的书

- `coverStyle` 可选 `photo`（满版照片和底部标题）、`illustrated`（图片和独立标题区）、`type`（单字、色块和书名）。省略时，有 `cover` 使用图文封面，其余使用文字封面。文字封面可用 `mark` 指定大字。
- 自行排好书名和图案的竖版图片可填 `jacket: jacket.webp`，铺满书架封面。建议比例为 14:25。照片样式的书脊会自动取一段封面图，其余样式使用配色色带。

- 修改标题或正文时，保留文件夹名和所属分类，已有详情链接就能继续使用。日期以记录的真实日期为准，未知时可以省略。
- 书架按日期从新到旧排列，无日期的条目按文件夹名排列。每排可在一本书的开头填 `featured: true`，把它设为默认展开的书。
- 源文件在 `content/blog/`。构建生成 `docs/blog/`，平时只编辑源文件。需要删除一本书时删掉对应的源文件夹，再重新构建。
- 需要看满书架的效果时，运行 `npm run build:preview`，再运行 `python3 -m http.server 8001 --directory .preview`，打开[满书架预览](http://127.0.0.1:8001/blog/)。这里会附加空白测试书。
- 公开仓库中的正文和图片均应可公开。私人草稿放在仓库之外。

## 旋转 WebP 照片

在项目根目录运行下面的命令，支持一次传入多张照片。`left`、`right` 分别表示向左、向右旋转 90 度，`180` 表示旋转 180 度：

```sh
python3 scripts/rotate-webp.py right content/blog/life/snow-mountain/images/example.webp
python3 scripts/rotate-webp.py left '照片一.webp' '照片二.webp'
python3 scripts/rotate-webp.py 180 '照片.webp'
```

默认在原图旁生成带方向后缀的新文件，保留原图；如果确认要直接替换原图，在命令末尾加 `--in-place`。已有同名输出不会被覆盖。脚本使用 macOS 的 `sips` 和 WebP 工具（`brew install webp`），只支持静态 WebP。旋转会重新编码为无损 WebP，不保留原文件的元数据，文件大小可能改变。修改博客图片后记得重新构建预览。
