import React, { useEffect, useRef, useState } from "react";

const coverWidth = 0.56;
const spineWidth = 0.16;
const gap = 0.035;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function arrangeBooks(count, position) {
  if (!count) return [];
  let edge = 0;
  const books = Array.from({ length: count }, (_, index) => {
    const distance = clamp(Math.abs(index - position), 0, 1);
    const openness = 1 - distance * distance * (3 - 2 * distance);
    const angle = distance * Math.PI / 2;
    const width = coverWidth * Math.cos(angle) + spineWidth * Math.sin(angle);
    const center = edge + width / 2;
    edge += width + gap + 0.035 * openness;
    return { center, openness, angle, width };
  });
  const left = Math.floor(position);
  const right = Math.min(left + 1, count - 1);
  const origin = books[left].center + (position - left) * (books[right].center - books[left].center);
  return books.map(({ center, openness, angle, width }) => ({
    "--book-x": center - origin,
    "--book-open": openness,
    "--book-width": width,
    "--book-turn": `${angle}rad`,
    zIndex: Math.round(openness * 100),
  }));
}

export default function BookRow({ row, active, base, initialBook, onOpen }) {
  const restoredIndex = row.entries.findIndex(book => book.id === initialBook);
  const featuredIndex = row.entries.findIndex(book => book.featured);
  const firstIndex = row.entries.findIndex(book => !book.blank);
  const initialIndex = restoredIndex >= 0 ? restoredIndex : Math.max(0, featuredIndex >= 0 ? featuredIndex : firstIndex);
  const [position, setPosition] = useState(initialIndex);
  const [selected, setSelected] = useState(initialIndex);
  const positionRef = useRef(initialIndex);
  const target = useRef(initialIndex);
  const animation = useRef(0);
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const track = useRef(null);
  const last = row.entries.length - 1;
  const entry = row.entries[selected];
  const bookStyles = arrangeBooks(row.entries.length, position);

  useEffect(() => () => cancelAnimationFrame(animation.current), []);

  useEffect(() => {
    const books = track.current;
    if (books.contains(document.activeElement)) {
      books.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
    }
  }, [selected]);

  function updatePosition(value) {
    positionRef.current = value;
    setPosition(value);
  }

  function select(index) {
    const destination = clamp(index, 0, last);
    target.current = destination;
    cancelAnimationFrame(animation.current);
    const start = positionRef.current;
    if (start === destination || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      updatePosition(destination);
      setSelected(destination);
      return;
    }
    const duration = Math.min(620, 330 + Math.abs(destination - start) * 70);
    const began = performance.now();
    function render(now) {
      const elapsed = clamp((now - began) / duration, 0, 1);
      updatePosition(start + (destination - start) * (1 - (1 - elapsed) ** 3));
      if (elapsed < 1) {
        animation.current = requestAnimationFrame(render);
      } else {
        setSelected(destination);
      }
    }
    animation.current = requestAnimationFrame(render);
  }

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
  }

  function drag(event) {
    const press = gesture.current;
    if (press?.id !== event.pointerId) return;
    const x = event.clientX - press.x;
    const y = event.clientY - press.y;
    if (!press.horizontal) {
      if (Math.max(Math.abs(x), Math.abs(y)) < 9) return;
      if (Math.abs(y) >= Math.abs(x)) {
        gesture.current = null;
        return;
      }
      press.horizontal = true;
      press.start = positionRef.current;
      cancelAnimationFrame(animation.current);
      track.current.setPointerCapture(event.pointerId);
    }
    updatePosition(clamp(press.start - x / Math.max(56, track.current.clientHeight * 0.38), 0, last));
  }

  function endDrag(event) {
    const press = gesture.current;
    if (press?.id !== event.pointerId) return;
    gesture.current = null;
    if (press.horizontal) {
      suppressClick.current = true;
      select(Math.round(positionRef.current));
    }
  }

  function handleKeys(event) {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!step) return;
    event.preventDefault();
    select(target.current + step);
  }

  function activate(book, index) {
    if (book.href && index === selected && position === index) {
      onOpen();
      location.assign(base + book.href);
      return;
    }
    select(index);
  }

  if (!entry) {
    return (
      <section className="book-row" id={row.id} aria-label={row.title} inert={!active}>
        <p className="book-row-empty">这一排还没有文章。</p>
      </section>
    );
  }

  return (
    <section className="book-row" id={row.id} aria-label={row.title} inert={!active} onKeyDown={handleKeys}>
      <div className="book-track" data-sliding={position !== selected} ref={track}
        onPointerDown={startDrag} onPointerMove={drag}
        onPointerUp={endDrag} onPointerCancel={endDrag}
        onLostPointerCapture={(event) => {
          if (event.target === track.current) endDrag(event);
        }}
        onClickCapture={(event) => {
          if (suppressClick.current && event.detail > 0) {
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}>
        {row.entries.map((book, index) => (
          <button type="button" key={book.id} data-book-id={book.id} className={`shelf-book tone-${book.tone}`}
            data-cover-style={book.coverStyle} data-jacket={Boolean(book.jacket)}
            style={bookStyles[index]} aria-label={book.title} aria-pressed={selected === index}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => activate(book, index)}>
            <span className="book-motion" aria-hidden="true">
              <span className="book-box">
                <span className="book-face book-cover">
                  {book.jacket && <img src={base + book.href + book.jacket} alt="" draggable="false" />}
                  {!book.blank && !book.jacket && <>
                    {book.coverStyle === "type" ? <span className="cover-mark">{book.mark}</span>
                      : <img src={base + book.href + book.cover} alt="" draggable="false" />}
                    <span className="cover-title">{book.title}</span>
                  </>}
                </span>
                <span className="book-face book-spine">
                  {!book.blank && <span className="spine-title">{book.spine ?? book.title}</span>}
                  {book.coverStyle === "photo" && (book.jacket || book.cover) &&
                    <img src={base + book.href + (book.jacket ?? book.cover)} alt="" draggable="false" />}
                </span>
                <span className="book-face book-pages" />
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="book-row-caption" aria-live="polite">
        <h2>{entry.title}</h2>
        {(entry.date || entry.summary) && <p>
          {entry.date && <time dateTime={entry.date}>{entry.date}</time>}
          {entry.date && entry.summary && " · "}
          {entry.summary}
        </p>}
        {entry.href && position === selected && <a className="book-read-link" href={base + entry.href}
          onClick={(event) => {
            if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) onOpen();
          }}>阅读全文</a>}
      </div>
    </section>
  );
}
