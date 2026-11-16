# 陈煜的个人网站

个人介绍与博客。介绍有肖像和蝴蝶转场，博客用两排书展示生活记录和项目。

- 第一次从首页进入会打开介绍。完成开场或点击「进入书架」后，浏览器记住这次访问，下次从首页直接进入书架。
- `/blog/intro/` 始终可以重看介绍，`/blog/` 直接打开书架。文章各有独立链接。
- 新文章从 `content/blog/` 中的 Markdown 生成。参见[添加书本说明](content/README.md)。

## 本地预览

```sh
npm ci
npm run build
python3 -m http.server 8000 --directory dist
```

满架测试可用 `npm run build:preview`，并从 `.preview/` 提供本地预览。推送到 `main` 后，GitHub Actions 构建并发布 `dist/` 到 GitHub Pages。
