import { butterflyPaths } from "./butterflyPaths.js";

const transitionStart = 1.78;
const transitionEnd = 3.17;
const handoffScroll = 2.65;
const endingDuration = 650;

export function attachScrollScenes(scene) {
  const stage = scene.querySelector(".stage");
  const cue = scene.querySelector(".scroll-cue");
  const flight = scene.querySelector(".butterfly-flight");
  const butterflies = [...flight.querySelectorAll(".butterfly")];
  const landing = scene.querySelector(".blog-landing");
  const portrait = scene.querySelector(".portrait-frame");
  const immersiveLayout = matchMedia("(prefers-reduced-motion: no-preference)");

  let frame = 0;
  let transitionScroll;
  let previousFrameTime;
  let endingStartedAt;
  let endingStartProgress;

  function clamp(value) {
    return Math.max(0, Math.min(1, value));
  }

  function between(progress, start, end) {
    return clamp((progress - start) / (end - start));
  }

  function ease(progress) {
    return progress * progress * (3 - 2 * progress);
  }

  function render(now) {
    frame = 0;
    const { top } = scene.getBoundingClientRect();
    const { width, height } = stage.getBoundingClientRect();
    const scroll = -top / height;
    const progress = clamp(scroll / 1.76);
    const rise = between(progress, 0, 0.43);
    const reveal = between(progress, 0.028, 0.448);
    const pan = ease(between(progress, 0.49, 0.8));
    const name = ease(between(progress, 0.56, 0.77));
    const summary = ease(between(progress, 0.73, 0.88));
    const brightness = clamp(reveal / 0.25);
    const spread = reveal ** 1.72;
    const cueZoom = between(progress, 0, 0.14);
    const cueFade = between(progress, 0, 0.40);
    const cueScale = 1 + 0.55 * (1 - (1 - cueZoom) ** 2);

    scene.style.setProperty("--portrait-opacity", brightness);
    scene.style.setProperty("--light-width", `${16 + 162 * spread}%`);
    scene.style.setProperty("--light-height", `${8 + 174 * spread}%`);
    scene.style.setProperty("--portrait-scale", 1 + 0.035 * reveal);
    scene.style.setProperty("--portrait-rise", (1 - rise) ** 3);
    scene.style.setProperty("--portrait-pan", pan);
    scene.style.setProperty("--name-opacity", name);
    scene.style.setProperty("--name-offset", `${12 * (1 - name)}px`);
    scene.style.setProperty("--summary-opacity", summary);
    scene.style.setProperty("--cue-opacity", 1 - cueFade);
    scene.style.setProperty("--cue-rise", 1 - (1 - cueFade) ** 1.7);
    scene.style.setProperty("--cue-scale", cueScale);
    cue.classList.toggle("is-hidden", cueFade === 1);

    advanceTransition(scroll, now);
    renderTransition(transitionScroll, width / height);
  }

  function advanceTransition(scroll, now) {
    const reachedHandoff = scroll >= handoffScroll;
    if (!reachedHandoff) endingStartedAt = undefined;

    const displayedProgress = transitionScroll ?? handoffScroll;
    if (reachedHandoff && endingStartedAt === undefined && displayedProgress >= handoffScroll - 0.025) {
      endingStartedAt = now;
      endingStartProgress = displayedProgress;
    }

    if (endingStartedAt !== undefined) {
      const elapsed = clamp((now - endingStartedAt) / endingDuration);
      const progress = 1 - (1 - elapsed) ** 2;
      transitionScroll = endingStartProgress + (transitionEnd - endingStartProgress) * progress;
      previousFrameTime = undefined;
      if (elapsed < 1) scheduleRender();
      return;
    }

    const target = Math.max(transitionStart, Math.min(handoffScroll, scroll));
    if (transitionScroll === undefined || Math.abs(target - transitionScroll) < 0.005) {
      transitionScroll = target;
      previousFrameTime = undefined;
    } else {
      // Ease wheel steps into motion without adding lag to the portrait reveal.
      const elapsed = Math.min(32, now - (previousFrameTime ?? now - 16.7));
      transitionScroll += (target - transitionScroll) * (1 - Math.exp(-elapsed / 52));
      previousFrameTime = now;
      scheduleRender();
    }
  }

  function renderTransition(scroll, aspectRatio) {
    const portraitExit = ease(between(scroll, 1.98, 2.67));
    const paper = ease(between(scroll, 2.04, 2.94));
    const content = ease(between(scroll, 2.49, 3.04));
    scene.style.setProperty("--intro-scene-opacity", 1 - portraitExit);
    landing.style.setProperty("--paper-opacity", ease(between(scroll, 2.02, 2.68)));
    landing.style.setProperty("--paper-spread", `${14 + 134 * paper}%`);
    landing.style.setProperty("--paper-x", `${87 - 32 * paper}%`);
    landing.style.setProperty("--paper-y", `${79 - 29 * paper}%`);
    landing.style.setProperty("--landing-opacity", content);
    landing.style.setProperty("--landing-offset", `${16 * (1 - content)}px`);
    landing.inert = content === 0;
    portrait.inert = portraitExit === 1;
    const isFlying = scroll > transitionStart && scroll < transitionEnd;
    flight.classList.toggle("is-flying", isFlying);
    if (!isFlying) return;

    butterflies.forEach((butterfly, index) => {
      const { start, end, origin, bend, exit, size } = butterflyPaths[index];
      const progress = between(scroll, start, end);
      if (progress === 0 || progress === 1) {
        butterfly.style.opacity = 0;
        return;
      }
      const remaining = 1 - progress;
      const point = origin.map((value, axis) => (
        remaining ** 2 * value + 2 * remaining * progress * bend[axis] + progress ** 2 * exit[axis]
      ));
      const [dx, dy] = origin.map((value, axis) => (
        remaining * (bend[axis] - value) + progress * (exit[axis] - bend[axis])
      ));

      butterfly.style.setProperty("--flight-x", `${point[0]}vw`);
      butterfly.style.setProperty("--flight-y", `${point[1]}svh`);
      butterfly.style.setProperty("--flight-angle", `${Math.atan2(dx * aspectRatio, -dy)}rad`);
      butterfly.style.setProperty("--flight-size", size * (0.74 + 0.36 * Math.sin(Math.PI * progress)));
      butterfly.style.opacity = ease(between(progress, 0, 0.12)) * (1 - ease(between(progress, 0.84, 1)));
    });
  }

  function scheduleRender() {
    if (immersiveLayout.matches && !frame) {
      frame = requestAnimationFrame(render);
    }
  }

  function applyLayoutPreference() {
    scene.classList.toggle("is-interactive", immersiveLayout.matches);
    if (!immersiveLayout.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      transitionScroll = undefined;
      previousFrameTime = undefined;
      endingStartedAt = undefined;
      landing.inert = false;
      portrait.inert = false;
      flight.classList.remove("is-flying");
    }
    scheduleRender();
  }

  addEventListener("scroll", scheduleRender, { passive: true });
  addEventListener("resize", scheduleRender);
  immersiveLayout.addEventListener("change", applyLayoutPreference);
  applyLayoutPreference();

  return () => {
    cancelAnimationFrame(frame);
    removeEventListener("scroll", scheduleRender);
    removeEventListener("resize", scheduleRender);
    immersiveLayout.removeEventListener("change", applyLayoutPreference);
  };
}
