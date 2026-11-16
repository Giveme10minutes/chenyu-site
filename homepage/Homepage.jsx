import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import PortraitScene from "./PortraitScene.jsx";
import ButterflyTransition from "./ButterflyTransition.jsx";
import Bookshelf from "./Bookshelf.jsx";
import { attachScrollScenes } from "./scrollScenes.js";

export default function Homepage({ initialRoute, base, assets, navigationBase = base, stableAssets = assets }) {
  const [route, setRoute] = useState(initialRoute);
  const [hydrated, setHydrated] = useState(false);
  const scene = useRef(null);
  const shelfUrl = navigationBase;
  const introUrl = navigationBase + "intro/";
  const shelfHref = hydrated ? shelfUrl : base;
  const introHref = hydrated ? introUrl : "intro/";
  const assetPath = hydrated ? stableAssets : assets;

  const navigate = useCallback((next) => {
    const url = next === "shelf" ? shelfUrl : introUrl;
    if (location.pathname === url) return;
    history.pushState(null, "", url);
    setRoute(next);
  }, [introUrl, shelfUrl]);

  useLayoutEffect(() => {
    document.querySelector('link[rel="icon"]').href = stableAssets + "butterfly-blue.webp";
    setHydrated(true);
    const restoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const restoreRoute = () => setRoute(location.pathname === introUrl ? "intro" : "shelf");
    addEventListener("popstate", restoreRoute);
    return () => {
      history.scrollRestoration = restoration;
      removeEventListener("popstate", restoreRoute);
    };
  }, [introUrl, stableAssets]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = route === "intro" ? "陈煜 · 自我介绍" : "陈煜 · 个人博客";
    if (route === "intro") {
      return attachScrollScenes(scene.current, () => navigate("shelf"));
    }
    scene.current.querySelector("#blog-title").focus({ preventScroll: true });
  }, [route, navigate]);

  function follow(event, next) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(next);
  }

  return (
    <main ref={scene} className="scene" aria-label={route === "intro" ? "陈煜的自我介绍" : "陈煜的个人博客"}>
      <div className="stage">
        {route === "intro" && <PortraitScene assets={assetPath} />}
        <Bookshelf route={route} assets={assetPath} introHref={introHref}
          onIntro={(event) => follow(event, "intro")} />
        {route === "intro" && <>
          <ButterflyTransition />
          <a className="shelf-skip" href={shelfHref} onClick={(event) => follow(event, "shelf")}>进入书架 →</a>
          <a className="scroll-cue" href="#portrait-revealed">
            <span>向下滚动</span>
            <span className="scroll-arrow" aria-hidden="true" />
          </a>
        </>}
      </div>
      {route === "intro" && <div id="portrait-revealed" />}
    </main>
  );
}
