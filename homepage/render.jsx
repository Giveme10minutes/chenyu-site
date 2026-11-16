import React from "react";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { renderToString } from "react-dom/server";
import Homepage from "./Homepage.jsx";

const docs = new URL("../docs/", import.meta.url);
const template = await readFile(new URL("./template.html", import.meta.url), "utf8");
const bundle = await readFile(new URL("showcase/react/homepage.js", docs));
const shelfStyles = await readFile(new URL("showcase/bookshelf.css", docs));
const version = createHash("sha256").update(bundle).update(shelfStyles).digest("hex").slice(0, 12);
const butterflySprites = ["blue", "ivory", "swallowtail", "amber", "jade", "rose"];

for (const { route, directory, base, assets, title } of [
  { route: "shelf", directory: "blog/", base: "./", assets: "../showcase/", title: "陈煜 · 个人博客" },
  { route: "intro", directory: "blog/intro/", base: "../", assets: "../../showcase/", title: "陈煜 · 自我介绍" },
]) {
  const html = template
    .replace("{{PRELOAD}}", route === "intro" ? butterflySprites.map(sprite =>
      `  <link rel="preload" href="${assets}butterfly-${sprite}.webp" as="image" media="(prefers-reduced-motion: no-preference)">`
    ).join("\n") : "")
    .replaceAll("{{ASSETS}}", assets)
    .replace("{{ROUTE}}", route)
    .replace("{{BASE}}", base)
    .replace("{{TITLE}}", title)
    .replace("{{APP}}", () => renderToString(<Homepage initialRoute={route} base={base} assets={assets} />))
    .replaceAll("{{VERSION}}", version);
  const folder = new URL(directory, docs);
  await mkdir(folder, { recursive: true });
  await writeFile(new URL("index.html", folder), html);
}

await writeFile(new URL("index.html", docs), `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=blog/intro/">
  <title>陈煜 · 个人博客预览</title>
</head>
<body><a href="blog/intro/">打开个人博客预览</a></body>
</html>
`);
