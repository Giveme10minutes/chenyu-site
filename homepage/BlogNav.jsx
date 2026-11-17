import React from "react";

export default function BlogNav({ shelfHref, introHref, aboutHref, current }) {
  return (
    <nav className="blog-nav blog-glass" aria-label="网站导航">
      <a className="blog-brand" href={introHref}>陈煜</a>
      <div className="blog-nav-links">
        <a href={shelfHref}
          aria-current={current === "shelf" ? "page" : undefined}>博客</a>
        <a href={aboutHref} aria-current={current === "about" ? "page" : undefined}>关于</a>
      </div>
    </nav>
  );
}
