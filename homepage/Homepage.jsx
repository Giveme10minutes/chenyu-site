import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import PortraitScene from "./PortraitScene.jsx";
import Bookshelf from "./Bookshelf.jsx";
import { rememberIntro } from "./visit.js";
import { attachScrollScenes } from "./scrollScenes.js";

function readShelfState(rows) {
  const saved = history.state?.bookshelf;
  const [requestedRow, requestedBook] = new URLSearchParams(location.search).get("book")?.split("/") ?? [];
  const request = rows.find(row => row.id === requestedRow && row.entries.some(book => book.id === requestedBook));
  if (request) {
    return { row: request.id, selections: { ...saved?.selections, [request.id]: requestedBook } };
  }
  return rows.some(row => row.id === saved?.row) ? saved : null;
}

export default function Homepage({ initialRoute, base, assets, rows, navigationBase = base, stableAssets = assets }) {
  const [route, setRoute] = useState(initialRoute);
  const [hydrated, setHydrated] = useState(false);
  const [restoration, setRestoration] = useState(null);
  const scene = useRef(null);
  const shelfUrl = navigationBase;
  const introUrl = navigationBase + "intro/";
  const shelfHref = hydrated ? shelfUrl : base;
  const introHref = hydrated ? introUrl : base + "intro/";
  const assetPath = hydrated ? stableAssets : assets;

  const navigate = useCallback((next) => {
    const url = next === "shelf" ? shelfUrl : introUrl;
    if (location.pathname === url) return;
    if (next === "shelf" && location.pathname === introUrl) rememberIntro();
    history.pushState(null, "", url);
    setRoute(next);
  }, [introUrl, shelfUrl]);

  useLayoutEffect(() => {
    document.querySelector('link[rel="icon"]').href = stableAssets + "butterfly-blue.webp";
    setHydrated(true);
    const restoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    if (initialRoute === "shelf") setRestoration(readShelfState(rows));
    const restoreRoute = () => {
      const next = location.pathname === introUrl ? "intro" : "shelf";
      setRestoration(next === "shelf" ? readShelfState(rows) : null);
      setRoute(next);
    };
    addEventListener("popstate", restoreRoute);
    return () => {
      history.scrollRestoration = restoration;
      removeEventListener("popstate", restoreRoute);
    };
  }, [introUrl, initialRoute, rows, stableAssets]);

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
    <main ref={scene} className="scene" tabIndex={-1} aria-label={route === "intro" ? "陈煜的自我介绍" : "陈煜的个人博客"}>
      <div className="stage">
        {route === "intro" && <PortraitScene assets={assetPath} />}
        <Bookshelf key={JSON.stringify(restoration)} route={route} rows={rows} base={shelfHref}
          restoration={restoration} introHref={introHref} onIntro={(event) => follow(event, "intro")}
          onShelf={(event) => follow(event, "shelf")} />
        {route === "intro" && <>
          <a className="shelf-continue blog-action blog-glass" href={shelfHref} onClick={(event) => follow(event, "shelf")}>进入书架 <span aria-hidden="true">→</span></a>
          <button className="scroll-cue" type="button" aria-label="向下滚动，点亮肖像">
            <span className="scroll-arrow" aria-hidden="true" />
          </button>
        </>}
      </div>
    </main>
  );
}
