import { butterflyPaths } from "./butterflyPaths.js";

const butterflyOffset = 3.55;
const transitionStart = 1.78;
const transitionEnd = Math.max(...butterflyPaths.map(({ end }) => end));

export function attachScrollScenes(scene, finish) {
  const stage = scene.querySelector(".stage");
  const cue = scene.querySelector(".scroll-cue");
  const flight = scene.querySelector(".butterfly-flight");
  const butterflies = [...flight.querySelectorAll(".butterfly")];
  const landing = scene.querySelector(".blog-landing");
  const portrait = scene.querySelector(".portrait-frame");
  const [opening, invite, call, team] = portrait.querySelectorAll(".portrait-shot");
  const immersiveLayout = matchMedia("(prefers-reduced-motion: no-preference)");

  scene.style.setProperty("--intro-screens", 1 + butterflyOffset + transitionEnd);

  let frame = 0;
  let transitionScroll;
  let previousFrameTime;

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
    const brightness = clamp(reveal / 0.25);
    const spread = reveal ** 1.72;
    const cueZoom = between(progress, 0, 0.14);
    const cueFade = between(progress, 0, 0.40);
    const cueScale = 1 + 0.55 * (1 - (1 - cueZoom) ** 2);

    scene.style.setProperty("--portrait-opacity", brightness);
    opening.style.setProperty("--caption-opacity", ease(between(progress, 0.10, 0.40)));
    scene.style.setProperty("--light-width", `${16 + 162 * spread}%`);
    scene.style.setProperty("--light-height", `${8 + 174 * spread}%`);
    scene.style.setProperty("--portrait-scale", 1 + 0.035 * reveal);
    scene.style.setProperty("--portrait-rise", (1 - rise) ** 3);
    renderShot(opening, 1 - ease(between(scroll, 1.21, 1.54)));
    renderEntrance(invite, scroll - 1.47, 1.34, -1);
    renderEntrance(call, scroll - 2.77, 1.31, 1);

    const teamLight = ease(between(scroll, 4.08, 4.66));
    renderShot(team, ease(between(scroll, 4.07, 4.37)), teamLight);
    team.style.setProperty("--team-scale", 1.12 - 0.12 * teamLight);
    team.style.setProperty("--team-caption", ease(between(scroll, 4.50, 4.84)));
    scene.style.setProperty("--cue-opacity", 1 - cueFade);
    scene.style.setProperty("--cue-rise", 1 - (1 - cueFade) ** 1.7);
    scene.style.setProperty("--cue-scale", cueScale);
    cue.classList.toggle("is-hidden", cueFade === 1);
    // Allow the last pixel of travel to round down on fractional viewport sizes.
    const target = Math.max(transitionStart, Math.min(transitionEnd, scroll - butterflyOffset + 1 / height));
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

    renderTransition(transitionScroll, width / height);
    if (transitionScroll === transitionEnd) finish();
  }

  function renderShot(shot, opacity, light = 1) {
    shot.style.setProperty("--shot-opacity", opacity);
    shot.style.setProperty("--shot-light", light);
    shot.inert = opacity === 0;
  }

  function renderEntrance(shot, scroll, duration, direction) {
    const light = ease(between(scroll, 0, 0.51));
    const turn = ease(between(scroll, 0.23, 0.70));
    const exit = ease(between(scroll, duration - 0.25, duration));
    renderShot(shot, ease(between(scroll, 0, 0.19)) * (1 - exit), light);
    shot.style.setProperty("--turn", `${direction * 30 * (1 - turn)}deg`);
    shot.style.setProperty("--actor-shift", `${direction * 7 * (1 - turn)}%`);
    shot.style.setProperty("--caption-opacity", ease(between(scroll, 0.36, 0.61)));
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
    landing.inert = true;
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
      landing.inert = false;
      portrait.inert = false;
      for (const shot of [opening, invite, call, team]) shot.inert = false;
      flight.classList.remove("is-flying");
    }
    scheduleRender();
  }

  addEventListener("scroll", scheduleRender, { passive: true });
  addEventListener("resize", scheduleRender);
  immersiveLayout.addEventListener("change", applyLayoutPreference);
  applyLayoutPreference();

  return () => {
    scene.classList.remove("is-interactive");
    landing.inert = false;
    cancelAnimationFrame(frame);
    removeEventListener("scroll", scheduleRender);
    removeEventListener("resize", scheduleRender);
    immersiveLayout.removeEventListener("change", applyLayoutPreference);
  };
}
