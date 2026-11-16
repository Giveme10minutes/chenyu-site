import React from "react";

export default function BlogNav({ shelfHref, introHref, onIntro, onShelf, current }) {
  return (
    <nav className="blog-nav blog-glass" aria-label="网站导航">
      <a className="blog-brand" href={shelfHref} onClick={onShelf}>陈煜</a>
      <div className="blog-nav-links">
        <a href={shelfHref} onClick={onShelf}
          aria-current={current === "shelf" ? "page" : undefined}>博客</a>
        <a href={introHref} onClick={onIntro}>关于</a>
      </div>
    </nav>
  );
}
