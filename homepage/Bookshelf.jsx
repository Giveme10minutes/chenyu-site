import React, { useLayoutEffect, useRef, useState } from "react";
import Footer from "./Footer.jsx";
import BookRow from "./BookRow.jsx";
import { bookshelfRows } from "./bookshelfEntries.js";

function scrollToRow(container, index) {
  container.scrollTo({
    top: index === 0 ? 0 : container.lastElementChild.offsetTop,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

export default function Bookshelf({ route, assets, introHref, onIntro }) {
  const [rowIndex, setRowIndex] = useState(0);
  const landing = useRef(null);
  const scrollport = useRef(null);
  const nextRow = bookshelfRows[1 - rowIndex];

  useLayoutEffect(() => {
    const container = scrollport.current;
    container.scrollTo({ top: 0, behavior: "instant" });
    setRowIndex(0);
    if (route === "intro") return;

    const shelf = landing.current;
    const enabledAt = performance.now();
    let lastWheel = 0;
    let wheelTravel = 0;
    let wheelDestination;

    function handleWheel(event) {
      const units = event.deltaMode;
      if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      event.preventDefault();

      // Momentum from the introduction should settle before it can change rows.
      if (event.timeStamp - enabledAt < 220) return;
      if (event.timeStamp - lastWheel > 180) {
        wheelTravel = 0;
        wheelDestination = undefined;
      }
      lastWheel = event.timeStamp;
      const distance = event.deltaY * (units === 1 ? 16 : units === 2 ? container.clientHeight : 1);
      wheelTravel = Math.sign(distance) === Math.sign(wheelTravel) ? wheelTravel + distance : distance;
      if (Math.abs(wheelTravel) < 36) return;

      const index = Number(wheelTravel > 0);
      if (index !== wheelDestination) {
        wheelDestination = index;
        scrollToRow(container, index);
      }
    }

    shelf.addEventListener("wheel", handleWheel, { passive: false });
    return () => shelf.removeEventListener("wheel", handleWheel);
  }, [route]);

  return (
    <section ref={landing} className="blog-landing" aria-labelledby="blog-title" data-shelf-page={route === "shelf"}>
      <header className="shelf-header">
        <a className="shelf-back" href={introHref} onClick={onIntro}>← <span>自我介绍</span></a>
        <h2 id="blog-title" tabIndex="-1">陈煜的博客</h2>
        <p>{bookshelfRows[rowIndex].title}</p>
      </header>
      <div className="shelf-scrollport" ref={scrollport} onScroll={(event) => {
        const container = event.currentTarget;
        setRowIndex(Number(container.scrollTop >= container.lastElementChild.offsetTop / 2));
      }}>
        {bookshelfRows.map((row, index) => (
          <BookRow key={row.id} row={row} assets={assets} active={rowIndex === index} />
        ))}
      </div>
      <button type="button" className="shelf-switch" onClick={() => scrollToRow(scrollport.current, 1 - rowIndex)}
        aria-controls={nextRow.id}>
        <span aria-hidden="true">{rowIndex === 0 ? "↓" : "↑"}</span>
        <span>{nextRow.title}</span>
      </button>
      <Footer />
    </section>
  );
}
