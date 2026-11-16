const posterExitStart = 5.15;
const posterExitEnd = 6.05;

export function attachScrollScenes(scene, finish) {
  const stage = scene.querySelector(".stage");
  const cue = scene.querySelector(".scroll-cue");
  const landing = scene.querySelector(".blog-landing");
  const portrait = scene.querySelector(".portrait-frame");
  const [opening, invite, call, team] = portrait.querySelectorAll(".portrait-shot");
  const immersiveLayout = matchMedia("(prefers-reduced-motion: no-preference)");

  scene.style.setProperty("--intro-screens", 1 + posterExitEnd);

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
    const { height } = stage.getBoundingClientRect();
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
    opening.style.setProperty("--greeting-opacity", ease(between(progress, 0.10, 0.32)));
    opening.style.setProperty("--name-opacity", ease(between(progress, 0.20, 0.40)));
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
    const exit = between(scroll + 1 / height, posterExitStart, posterExitEnd);
    const revealShelf = ease(exit);
    scene.style.setProperty("--poster-offset", `${-100 * exit}%`);
    scene.style.setProperty("--poster-scale", 1 - 0.045 * revealShelf);
    scene.style.setProperty("--poster-shadow", 0.24 * (1 - revealShelf));
    scene.style.setProperty("--shelf-rise", `${24 * (1 - revealShelf)}px`);
    if (exit === 1) finish();
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

  function scheduleRender() {
    if (immersiveLayout.matches && !frame) {
      frame = requestAnimationFrame(render);
    }
  }

  function applyLayoutPreference() {
    scene.classList.toggle("is-interactive", immersiveLayout.matches);
    landing.inert = immersiveLayout.matches;
    if (!immersiveLayout.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      for (const shot of [opening, invite, call, team]) shot.inert = false;
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
