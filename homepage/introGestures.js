const wheelPause = 170;
const swipeDistance = 32;

export function bindIntroGestures(scene, { enabled, atPoster, step }) {
  const listeners = new AbortController();
  const { signal } = listeners;
  let wheelTime = -Infinity;
  let wheelDirection = 0;
  let wheelTravel = 0;
  let wheelHandled = false;
  let touch;

  function shouldStep(direction) {
    return !atPoster() || (direction < 0 && window.scrollY <= 1);
  }

  function wheel(event) {
    if (!enabled() || event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const direction = Math.sign(event.deltaY);
    if (direction !== wheelDirection || event.timeStamp - wheelTime > wheelPause) {
      wheelHandled = false;
      wheelTravel = 0;
    }
    wheelTime = event.timeStamp;
    wheelDirection = direction;
    if (!wheelHandled && !shouldStep(direction)) return;

    event.preventDefault();
    if (wheelHandled) return;
    const delta = Math.abs(event.deltaY);
    wheelTravel += event.deltaMode === 0 ? delta : event.deltaMode === 1 ? delta * 16 : delta * innerHeight;
    if (wheelTravel >= 22) {
      wheelHandled = true;
      step(direction);
    }
  }

  function touchStart(event) {
    touch = undefined;
    if (!enabled() || event.touches.length !== 1) return;
    const { clientX, clientY } = event.touches[0];
    touch = { clientX, clientY, locked: !atPoster(), atTop: window.scrollY <= 1 };
  }

  function swipeDirection(point, threshold = swipeDistance) {
    const up = touch.clientY - point.clientY;
    const across = Math.abs(touch.clientX - point.clientX);
    return Math.abs(up) >= threshold && Math.abs(up) > across ? Math.sign(up) : 0;
  }

  function touchMove(event) {
    if (!touch || !enabled() || event.touches.length !== 1) return;
    if (touch.locked || (touch.atTop && swipeDirection(event.touches[0], 4) < 0)) {
      event.preventDefault();
    }
  }

  function touchEnd(event) {
    if (!touch || !enabled()) return;
    const direction = swipeDirection(event.changedTouches[0]);
    if (direction && (touch.locked || (touch.atTop && direction < 0))) step(direction);
    touch = undefined;
  }

  function keyDown(event) {
    if (!enabled() || event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target.closest?.('a, button, input, select, textarea, [contenteditable]')) return;
    const direction = {
      ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1, " ": event.shiftKey ? -1 : 1,
    }[event.key];
    if (!direction || !shouldStep(direction)) return;
    event.preventDefault();
    if (!event.repeat) step(direction);
  }

  window.addEventListener("wheel", wheel, { passive: false, signal });
  window.addEventListener("keydown", keyDown, { signal });
  scene.addEventListener("touchstart", touchStart, { passive: true, signal });
  scene.addEventListener("touchmove", touchMove, { passive: false, signal });
  scene.addEventListener("touchend", touchEnd, { passive: true, signal });
  scene.addEventListener("touchcancel", () => { touch = undefined; }, { signal });
  return () => listeners.abort();
}
