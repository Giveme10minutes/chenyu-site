import React, { useEffect, useRef, useState } from "react";

const coverWidth = 0.56;
const spineWidth = 0.16;
const gap = 0.035;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function arrangeBooks(count, position) {
  let edge = 0;
  const books = Array.from({ length: count }, (_, index) => {
    const distance = clamp(Math.abs(index - position), 0, 1);
    const openness = 1 - distance * distance * (3 - 2 * distance);
    const angle = distance * Math.PI / 2;
    const width = coverWidth * Math.cos(angle) + spineWidth * Math.sin(angle);
    const center = edge + width / 2;
    edge += width + gap + 0.035 * openness;
    return { center, openness, angle };
  });
  const left = Math.floor(position);
  const right = Math.min(left + 1, count - 1);
  const origin = books[left].center + (position - left) * (books[right].center - books[left].center);
  return books.map(({ center, openness, angle }) => ({
    "--book-x": center - origin,
    "--book-open": openness,
    "--book-turn": `${angle}rad`,
    zIndex: Math.round(openness * 100),
  }));
}

export default function BookRow({ row, active, assets }) {
  const initialIndex = Math.floor(row.entries.length / 2);
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

  return (
    <section className="book-row" id={row.id} aria-label={row.title} inert={!active} onKeyDown={handleKeys}>
      <div className="book-track" ref={track} onPointerDown={startDrag} onPointerMove={drag}
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
          <button type="button" key={book.title} className={`shelf-book tone-${book.tone}`}
            style={bookStyles[index]} aria-label={book.title} aria-pressed={selected === index}
            onClick={() => select(index)}>
            <span className="book-box" aria-hidden="true">
              <span className="book-face book-cover">
                <span className="cover-category">{row.title}</span>
                {book.image ? <img src={assets + book.image} alt="" draggable="false" />
                  : <span className="cover-mark">{book.mark}</span>}
                <span className="cover-title">{book.title}</span>
              </span>
              <span className="book-face book-spine">{book.spine ?? book.title}</span>
              <span className="book-face book-pages" />
            </span>
          </button>
        ))}
      </div>
      <div className="book-row-caption">
        <button type="button" aria-label="上一本" disabled={selected === 0 && position === 0} onClick={() => select(target.current - 1)}>←</button>
        <div className="book-caption-text" aria-live="polite">
          <h2>{entry.title}</h2>
          <p>{entry.subtitle}</p>
        </div>
        <button type="button" aria-label="下一本" disabled={selected === last && position === last} onClick={() => select(target.current + 1)}>→</button>
      </div>
    </section>
  );
}
