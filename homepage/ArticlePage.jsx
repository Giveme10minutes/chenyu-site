import React from "react";
import BlogNav from "./BlogNav.jsx";

const assets = "../../../assets/";

export default function ArticlePage({ category, entry, body, version }) {
  const back = `../../../?book=${encodeURIComponent(category.id + "/" + entry.id)}`;
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{entry.title + " · 陈煜的博客"}</title>
        {entry.summary && <meta name="description" content={entry.summary} />}
        <link rel="icon" href={assets + "butterfly-blue.webp"} type="image/webp" />
        <link rel="stylesheet" href={assets + "blog.css?v=" + version} />
        <link rel="stylesheet" href={assets + "article.css?v=" + version} />
        <script src={assets + "article-return.js?v=" + version} defer />
      </head>
      <body>
        <BlogNav shelfHref="../../../" introHref="../../../intro/" />
        <main className="reading-page">
          <a className="blog-action blog-glass" href={back}><span aria-hidden="true">←</span> 返回书架</a>
          <article>
            <header className="reading-header">
              <p className="reading-meta">
                <span>{category.title}</span>
                {entry.date && <time dateTime={entry.date}>{entry.date}</time>}
              </p>
              <h1>{entry.title}</h1>
              {entry.summary && <p className="reading-summary">{entry.summary}</p>}
            </header>
            {entry.cover && <img className="reading-cover" src={entry.cover} alt={entry.title + "的封面"} />}
            <div className="reading-body" dangerouslySetInnerHTML={{ __html: body }} />
          </article>
        </main>
      </body>
    </html>
  );
}
