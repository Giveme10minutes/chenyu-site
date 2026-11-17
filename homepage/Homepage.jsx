import React, { useLayoutEffect, useRef, useState } from "react";
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

export default function Homepage({ initialRoute: route, base, assets, rows, navigationBase = base, stableAssets = assets }) {
  const [hydrated, setHydrated] = useState(false);
  const [restoration, setRestoration] = useState(null);
  const scene = useRef(null);
  const shelfUrl = navigationBase;
  const introUrl = navigationBase + "intro/";
  const aboutUrl = navigationBase + "about/";
  const shelfHref = hydrated ? shelfUrl : base;
  const introHref = hydrated ? introUrl : base + "intro/";
  const aboutHref = hydrated ? aboutUrl : base + "about/";
  const assetPath = hydrated ? stableAssets : assets;

  useLayoutEffect(() => {
    document.querySelector('link[rel="icon"]').href = stableAssets + "butterfly-blue.webp";
    setHydrated(true);
    const restoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    if (route === "shelf") setRestoration(readShelfState(rows));
    return () => {
      history.scrollRestoration = restoration;
    };
  }, [route, rows, stableAssets]);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (route === "intro") {
      return attachScrollScenes(scene.current, () => {
        rememberIntro();
        // A new document lets iOS sample the shelf color for its system bars.
        location.assign(shelfUrl);
      });
    }
    scene.current.querySelector("#blog-title").focus({ preventScroll: true });
  }, [route, shelfUrl]);

  return (
    <main ref={scene} className="scene" tabIndex={-1} aria-label={route === "intro" ? "陈煜的自我介绍" : "陈煜的个人博客"}>
      <div className="stage">
        {route === "intro" && <PortraitScene assets={assetPath} />}
        <Bookshelf key={JSON.stringify(restoration)} route={route} rows={rows} base={shelfHref}
          restoration={restoration} introHref={introHref} aboutHref={aboutHref} />
        {route === "intro" && <>
          <a className="shelf-continue blog-action blog-glass" href={shelfHref} onClick={rememberIntro}>进入书架 <span aria-hidden="true">→</span></a>
          <button className="scroll-cue" type="button" aria-label="向下滚动，点亮肖像">
            <span className="scroll-arrow" aria-hidden="true" />
          </button>
        </>}
      </div>
    </main>
  );
}
