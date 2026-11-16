import React from "react";

export default function Footer({ linkClass } = {}) {
  return (
    <footer className="showcase-footer">
      <div className="showcase-footer-inner">
        <nav className="showcase-footer-links" aria-label="页脚链接">
          <a className={linkClass} href="https://github.com/Giveme10minutes">GitHub 主页 <span aria-hidden="true">↗</span></a>
          <a className={linkClass} href="https://yuchen.ink/">原版主页 <span aria-hidden="true">↗</span></a>
        </nav>
      </div>
    </footer>
  );
}
