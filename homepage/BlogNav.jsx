import React from "react";

export default function BlogNav({ shelfHref, introHref, aboutHref, portraitSrc, onIntro, onShelf, current }) {
  return (
    <nav className="blog-nav blog-glass" aria-label="网站导航">
      <a className="blog-brand" href={introHref} onClick={onIntro}
        aria-label="陈煜的自我介绍" title="陈煜的自我介绍">
        <img className="blog-portrait" src={portraitSrc} alt="" width="34" height="34" />
      </a>
      <div className="blog-nav-links">
        <a href={shelfHref} onClick={onShelf}
          aria-current={current === "shelf" ? "page" : undefined}>博客</a>
        <a href={aboutHref} aria-current={current === "about" ? "page" : undefined}>关于</a>
      </div>
    </nav>
  );
}
