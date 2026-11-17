import React, { useLayoutEffect, useRef, useState } from "react";
import Footer from "./Footer.jsx";
import BookRow from "./BookRow.jsx";
import BlogNav from "./BlogNav.jsx";

function scrollToRow(container, index) {
  container.scrollTo({
    top: index === 0 ? 0 : container.lastElementChild.offsetTop,
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
  });
}

export default function Bookshelf({ route, rows, base, restoration, introHref, aboutHref }) {
  const restoredIndex = Math.max(0, rows.findIndex(row => row.id === restoration?.row));
  const [rowIndex, setRowIndex] = useState(restoredIndex);
  const landing = useRef(null);
  const scrollport = useRef(null);
  const nextRow = rows[1 - rowIndex];

  useLayoutEffect(() => {
    const container = scrollport.current;
    const index = route === "shelf" ? restoredIndex : 0;
    container.scrollTo({ top: index === 0 ? 0 : container.lastElementChild.offsetTop, behavior: "instant" });
    setRowIndex(index);
    if (route === "intro") return;

    function focusBook(row) {
      document.getElementById(row)?.querySelector('.shelf-book[aria-pressed="true"]')?.focus({ preventScroll: true });
    }

    if (restoration) focusBook(restoration.row);
    const onPageShow = (event) => {
      if (event.persisted) focusBook(history.state?.bookshelf?.row);
    };
    addEventListener("pageshow", onPageShow);
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
    return () => {
      shelf.removeEventListener("wheel", handleWheel);
      removeEventListener("pageshow", onPageShow);
    };
  }, [route, restoredIndex, restoration]);

  function rememberSelection(row) {
    const selections = Object.fromEntries([...scrollport.current.children].map(section => [
      section.id, section.querySelector('.shelf-book[aria-pressed="true"]')?.dataset.bookId,
    ]));
    history.replaceState({ ...history.state, bookshelf: { row, selections } }, "");
  }

  return (
    <section ref={landing} className="blog-landing" aria-labelledby="blog-title" data-shelf-page={route === "shelf"}>
      <BlogNav shelfHref={base} introHref={introHref} aboutHref={aboutHref} current="shelf" />
      <header className="shelf-header">
        <h2 id="blog-title" tabIndex="-1">陈煜的博客</h2>
        <p>{rows[rowIndex].title}</p>
      </header>
      <div className="shelf-scrollport" ref={scrollport} onScroll={(event) => {
        const container = event.currentTarget;
        setRowIndex(Number(container.scrollTop >= container.lastElementChild.offsetTop / 2));
      }}>
        {rows.map((row, index) => (
          <BookRow key={row.id} row={row} base={base} active={rowIndex === index}
            initialBook={restoration?.selections?.[row.id]} onOpen={() => rememberSelection(row.id)} />
        ))}
      </div>
      <button type="button" className="shelf-switch" onClick={() => scrollToRow(scrollport.current, 1 - rowIndex)}
        aria-controls={nextRow.id}>
        <span className="shelf-switch-circle blog-glass" aria-hidden="true">{rowIndex === 0 ? "↓" : "↑"}</span>
        <span className="shelf-switch-label">{nextRow.title}</span>
      </button>
      <Footer linkClass="blog-action blog-glass" />
    </section>
  );
}
