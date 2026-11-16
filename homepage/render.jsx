import React from "react";
import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { build } from "vite";
import ArticlePage from "./ArticlePage.jsx";
import Homepage from "./Homepage.jsx";
import { readBlog } from "./blogContent.js";
import { withBlankBooks } from "./bookshelfEntries.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const preview = process.argv.includes("--preview");
const destination = join(root, preview ? ".preview" : "dist");
const blog = await readBlog(join(root, "content/blog"));
const rows = blog.map(({ category, articles }) => {
  const entries = articles.map(({ entry }) => entry);
  return { id: category.id, title: category.title, entries: preview ? withBlankBooks(entries) : entries };
});
const serializedRows = JSON.stringify(rows).replaceAll("<", "\\u003c");
const template = await readFile(new URL("./template.html", import.meta.url), "utf8");
const sprites = ["blue", "ivory", "swallowtail", "amber", "jade", "rose"].map(color => `butterfly-${color}.webp`);

await mkdir(dirname(destination), { recursive: true });
const staging = await mkdtemp(join(dirname(destination), ".blog-build-"));
const output = join(staging, "site");
const blogOutput = join(output, "blog");
const assets = join(blogOutput, "assets");
const backup = join(staging, "previous");
let backedUp = false;
let installed = false;

try {
  await build({ build: { outDir: join(assets, "react") } });
  const hash = createHash("sha256").update(await readFile(join(assets, "react/homepage.js")));
  for (const style of ["portrait.css", "butterfly.css", "bookshelf.css", "article.css"]) {
    const stylesheet = await readFile(join(root, "homepage/styles", style));
    hash.update(stylesheet);
    await writeFile(join(assets, style), stylesheet);
  }
  const backScript = await readFile(join(root, "homepage/article-return.js"));
  hash.update(backScript).update(serializedRows);
  await writeFile(join(assets, "article-return.js"), backScript);
  await copyFile(join(root, "homepage/media/portrait.webp"), join(assets, "portrait.webp"));
  await Promise.all(sprites.map(sprite => copyFile(join(root, "homepage/media", sprite), join(assets, sprite))));
  for (const script of ["root-entry.js", "visit.js"]) {
    const source = await readFile(join(root, "homepage", script));
    hash.update(source);
    await writeFile(join(assets, script), source);
  }
  const version = hash.digest("hex").slice(0, 12);

  await writeFile(join(output, "index.html"), `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>陈煜 · 个人网站</title>
  <script type="module" src="blog/assets/root-entry.js?v=${version}"></script>
</head>
<body>
  <main>
    <h1>陈煜的个人网站</h1>
    <p><a id="open-intro" href="blog/intro/">自我介绍</a></p>
    <p><a id="open-shelf" href="blog/">进入博客</a></p>
  </main>
</body>
</html>
`);

  const originalSite = "https://giveme10minutes.github.io/Giveme10minutes/";
  for (const [path, name, target] of [
    ["study", "面试学习区", originalSite + "study/"],
    ["classic", "经典版主页", originalSite + "classic/"],
    ["showcase", "原版作品集", originalSite],
  ]) {
    const folder = join(output, path);
    await mkdir(folder, { recursive: true });
    await writeFile(join(folder, "index.html"), `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${name} · 陈煜</title>
</head>
<body>
  <p><a id="legacy-page" href="${target}">${name}</a></p>
  <script>
    const target = new URL(document.getElementById("legacy-page").href);
    target.search = location.search;
    target.hash = location.hash;
    location.replace(target.href);
  </script>
</body>
</html>
`);
  }

  for (const { route, directory, base, title } of [
    { route: "shelf", directory: "", base: "./", title: "陈煜 · 个人博客" },
    { route: "intro", directory: "intro", base: "../", title: "陈煜 · 自我介绍" },
  ]) {
    const assetsHref = base + "assets/";
    const values = {
      PRELOAD: route === "intro" ? sprites.map(sprite =>
        `  <link rel="preload" href="${assetsHref}${sprite}" as="image" media="(prefers-reduced-motion: no-preference)">`
      ).join("\n") : "",
      ASSETS: assetsHref,
      ROUTE: route,
      BASE: base,
      TITLE: title,
      VERSION: version,
      APP: renderToString(<Homepage initialRoute={route} base={base} assets={assetsHref} rows={rows} />),
      ROWS: serializedRows,
    };
    const html = template.replace(/\{\{([A-Z]+)\}\}/g, (_, name) => values[name]);
    const folder = join(blogOutput, directory);
    await mkdir(folder, { recursive: true });
    await writeFile(join(folder, "index.html"), html);
  }

  for (const { category, articles } of blog) {
    for (const { entry, body, images } of articles) {
      const folder = join(blogOutput, entry.href);
      await mkdir(folder, { recursive: true });
      const page = renderToStaticMarkup(<ArticlePage category={category} entry={entry} body={body} version={version} />);
      await writeFile(join(folder, "index.html"), "<!doctype html>\n" + page);
      for (const [path, source] of images) {
        const target = join(folder, path);
        await mkdir(dirname(target), { recursive: true });
        await copyFile(source, target);
      }
    }
  }

  try {
    await rename(destination, backup);
    backedUp = true;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  try {
    await rename(output, destination);
    installed = true;
  } catch (error) {
    if (backedUp) {
      try {
        await rename(backup, destination);
        backedUp = false;
      } catch (restoreError) {
        throw new AggregateError([error, restoreError], `无法替换博客目录。上次构建保存在 ${backup}`);
      }
    }
    throw error;
  }
  console.log(`已生成 ${blog.reduce((count, { articles }) => count + articles.length, 0)} 篇文章 · ${destination}`);
} finally {
  if (!backedUp || installed) await rm(staging, { recursive: true, force: true });
}
