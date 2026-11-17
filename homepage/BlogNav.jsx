import React from "react";

export default function BlogNav({ shelfHref, introHref, aboutHref, onIntro, onShelf, current }) {
  return (
    <nav className="blog-nav blog-glass" aria-label="网站导航">
      <a className="blog-brand" href={introHref} onClick={onIntro}>陈煜</a>
      <div className="blog-nav-links">
        <a href={shelfHref} onClick={onShelf}
          aria-current={current === "shelf" ? "page" : undefined}>博客</a>
        <a href={aboutHref} aria-current={current === "about" ? "page" : undefined}>关于</a>
      </div>
    </nav>
  );
}
