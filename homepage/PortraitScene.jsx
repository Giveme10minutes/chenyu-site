import React from "react";

export default function PortraitScene({ assets }) {
  return (
    <div className="portrait-frame">
      <div className="portrait">
        <img src={assets + "portrait.webp"} width="1122" height="1402" alt="陈煜身穿深蓝色 Polo 衫，在左上方柔光下直视镜头" />
      </div>
      <div className="intro">
        <h1>陈煜 <span className="latin-name" lang="en">Chen Yu</span></h1>
        <div className="intro-summary">
          <p className="education">内江师范学院 · 软件工程本科生</p>
          <p className="bio">我关注 AI 应用开发，也在做 Java 后端项目。</p>
          <p className="interests">个人爱好：电吉他、音乐和摄影</p>
        </div>
      </div>
    </div>
  );
}
