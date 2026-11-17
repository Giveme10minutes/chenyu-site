import React from "react";
import BlogNav from "./BlogNav.jsx";

const assets = "../assets/";

export default function AboutPage({ version }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>关于我 · 陈煜</title>
        <meta name="description" content="陈煜的个人简介" />
        <link rel="icon" href={assets + "butterfly-blue.webp"} type="image/webp" />
        <link rel="stylesheet" href={assets + "blog.css?v=" + version} />
        <link rel="stylesheet" href={assets + "article.css?v=" + version} />
      </head>
      <body>
        <BlogNav shelfHref="../" introHref="../intro/" aboutHref="./" portraitSrc={assets + "portrait.webp"} current="about" />
        <main className="reading-page about-page">
          <article>
            <header className="reading-header">
              <p className="reading-meta"><span>关于我</span></p>
              <h1>陈煜</h1>
              <p className="reading-summary">这里是个人简介页，以下内容待补充。</p>
            </header>
            <div className="reading-body">
              <h2>你好</h2>
              <p>（待补充：一两句话介绍自己。）</p>
              <h2>正在做</h2>
              <p>（待补充：近况与在做的事。）</p>
              <h2>找我</h2>
              <p><a href="https://github.com/Giveme10minutes">GitHub 主页</a> · <a href="https://giveme10minutes.github.io/Giveme10minutes/">原版主页</a></p>
              <p>（待补充：其他联系方式。）</p>
            </div>
          </article>
        </main>
      </body>
    </html>
  );
}
