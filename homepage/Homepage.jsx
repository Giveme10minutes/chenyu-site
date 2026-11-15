import React, { useEffect, useRef } from "react";
import PortraitScene from "./PortraitScene.jsx";
import ButterflyTransition from "./ButterflyTransition.jsx";
import Footer from "./Footer.jsx";
import { attachScrollScenes } from "./scrollScenes.js";

export default function Homepage() {
  const scene = useRef(null);

  useEffect(() => attachScrollScenes(scene.current), []);

  return (
    <>
      <main ref={scene} className="scene" aria-label="陈煜的个人主页">
        <div className="stage">
          <PortraitScene />
          <section className="blog-landing" aria-labelledby="blog-title">
            <h2 id="blog-title">陈煜的博客</h2>
            <div className="blog-preview">
              <p>生活记录</p>
              <p>做过的项目</p>
            </div>
          </section>
          <ButterflyTransition />
          <a className="scroll-cue" href="#portrait-revealed">
            <span>向下滚动</span>
            <span className="scroll-arrow" aria-hidden="true" />
          </a>
        </div>
        <div id="portrait-revealed" />
      </main>
      <Footer />
    </>
  );
}
