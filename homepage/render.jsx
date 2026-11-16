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
const destination = join(root, preview ? ".preview/blog" : "docs/blog");
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
const assets = join(output, "assets");
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
  await copyFile(join(root, "docs/showcase/portrait.webp"), join(assets, "portrait.webp"));
  await Promise.all(sprites.map(sprite => copyFile(join(root, "homepage/media", sprite), join(assets, sprite))));
  const version = hash.digest("hex").slice(0, 12);

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
    const folder = join(output, directory);
    await mkdir(folder, { recursive: true });
    await writeFile(join(folder, "index.html"), html);
  }

  for (const { category, articles } of blog) {
    for (const { entry, body, images } of articles) {
      const folder = join(output, entry.href);
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
