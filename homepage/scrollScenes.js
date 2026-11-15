import { butterflyPaths } from "./butterflyPaths.js";

export function attachScrollScenes(scene) {
  const stage = scene.querySelector(".stage");
  const cue = scene.querySelector(".scroll-cue");
  const flight = scene.querySelector(".butterfly-flight");
  const butterflies = [...flight.querySelectorAll(".butterfly")];
  const landing = scene.querySelector(".blog-landing");
  const portrait = scene.querySelector(".portrait-frame");
  const immersiveLayout = matchMedia("(prefers-reduced-motion: no-preference)");

  let frame = 0;

  function clamp(value) {
    return Math.max(0, Math.min(1, value));
  }

  function between(progress, start, end) {
    return clamp((progress - start) / (end - start));
  }

  function ease(progress) {
    return progress * progress * (3 - 2 * progress);
  }

  function render() {
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
    scene.style.setProperty("--intro-scene-opacity", 1 - ease(between(scroll, 1.94, 2.60)));
    renderTransition(scroll, width / height);
  }

  function renderTransition(scroll, aspectRatio) {
    const paper = ease(between(scroll, 2.09, 2.9));
    const content = ease(between(scroll, 2.52, 3.06));
    landing.style.setProperty("--paper-opacity", paper);
    landing.style.setProperty("--paper-spread", `${18 + 130 * paper}%`);
    landing.style.setProperty("--landing-opacity", content);
    landing.inert = content === 0;
    portrait.inert = scroll >= 2.60;
    const isFlying = scroll > 1.78 && scroll < 3.17;
    flight.classList.toggle("is-flying", isFlying);
    if (!isFlying) return;

    butterflies.forEach((butterfly, index) => {
      const { start, end, origin, bend, exit, size } = butterflyPaths[index];
      const progress = between(scroll, start, end);
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
