const wheelPause = 105;
const wheelDistance = 12;
const swipeDistance = 32;

export function bindIntroGestures(scene, { enabled, atPoster, step }) {
  const listeners = new AbortController();
  const { signal } = listeners;
  let wheelTime = -Infinity;
  let wheelSpeed = 0;
  let wheelTravel = 0;
  let wheelStep = -Infinity;
  let steppedDirection = 0;
  let reverseTravel = 0;
  let nativeScroll = false;
  let touch;

  function shouldStep(direction) {
    return !atPoster() || (direction < 0 && window.scrollY <= 1);
  }

  function wheel(event) {
    if (!enabled() || event.ctrlKey || !event.deltaY
      || Math.abs(event.deltaY) < Math.abs(event.deltaX) * 0.6) return;
    const unit = event.deltaMode === 0 ? 1 : event.deltaMode === 1 ? 16 : innerHeight;
    const travel = event.deltaY * unit;
    const speed = Math.abs(travel);
    const { timeStamp } = event;
    if (steppedDirection) {
      reverseTravel = Math.max(0, reverseTravel - travel * steppedDirection);
    }
    // A new swipe can start during the low-speed tail of the previous one.
    const renewed = timeStamp - wheelStep >= wheelPause
      && wheelSpeed <= 4 && speed >= Math.max(6, 2.5 * wheelSpeed);
    if (timeStamp - wheelTime > wheelPause || renewed || reverseTravel >= wheelDistance) {
      steppedDirection = 0;
      wheelTravel = 0;
      reverseTravel = 0;
      nativeScroll = false;
    }
    wheelTime = timeStamp;
    wheelSpeed = speed;
    if (nativeScroll) return;
    if (!steppedDirection && !shouldStep(Math.sign(travel))) {
      nativeScroll = true;
      return;
    }

    event.preventDefault();
    if (steppedDirection) return;
    wheelTravel += travel;
    if (Math.abs(wheelTravel) >= wheelDistance) {
      steppedDirection = Math.sign(wheelTravel);
      wheelStep = timeStamp;
      step(steppedDirection);
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
