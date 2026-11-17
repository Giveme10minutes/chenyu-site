import { bindIntroGestures } from "./introGestures.js";

const shotDurations = [820, 760, 760, 860];
const handoffDuration = 390;
const posterExitProgress = 0.88;

export function attachScrollScenes(scene, finish) {
  const portrait = scene.querySelector(".portrait-frame");
  const cue = scene.querySelector(".scroll-cue");
  const landing = scene.querySelector(".blog-landing");
  const shots = [...scene.querySelectorAll(".portrait-shot")];
  const layers = shots.map(() => ({ opacity: 0, offset: 0, progress: 0 }));
  const immersiveLayout = matchMedia("(prefers-reduced-motion: no-preference)");
  let active = -1;
  let playback = 0;
  let enteringShelf = false;
  const atPoster = () => active === shots.length - 1;

  function between(progress, start, end) {
    return Math.max(0, Math.min(1, (progress - start) / (end - start)));
  }

  function ease(progress) {
    return progress * progress * (3 - 2 * progress);
  }

  function renderOpening(shot, progress) {
    const light = between(progress, 0, 0.83);
    const spread = light ** 1.72;
    scene.style.setProperty("--portrait-opacity", between(light, 0, 0.32));
    scene.style.setProperty("--light-width", `${16 + 162 * spread}%`);
    scene.style.setProperty("--light-height", `${8 + 174 * spread}%`);
    scene.style.setProperty("--portrait-scale", 1 + 0.035 * light);
    scene.style.setProperty("--portrait-rise", (1 - between(progress, 0, 0.87)) ** 3);
    shot.style.setProperty("--greeting-opacity", ease(between(progress, 0.26, 0.75)));
    shot.style.setProperty("--name-opacity", ease(between(progress, 0.50, 1)));
  }

  function renderEntrance(shot, progress, direction) {
    const light = ease(between(progress, 0, 0.72));
    const turn = ease(between(progress, 0.22, 0.93));
    shot.style.setProperty("--shot-light", light);
    shot.style.setProperty("--turn", `${direction * 30 * (1 - turn)}deg`);
    shot.style.setProperty("--actor-shift", `${direction * 7 * (1 - turn)}%`);
    shot.style.setProperty("--caption-opacity", ease(between(progress, 0.47, 0.89)));
  }

  function renderTeam(shot, progress) {
    const light = ease(between(progress, 0, 0.77));
    shot.style.setProperty("--shot-light", light);
    shot.style.setProperty("--team-scale", 1.12 - 0.12 * light);
    shot.style.setProperty("--team-caption", ease(between(progress, 0.54, 1)));
  }

  const renderShots = [
    renderOpening,
    (shot, progress) => renderEntrance(shot, progress, -1),
    (shot, progress) => renderEntrance(shot, progress, 1),
    renderTeam,
  ];

  function renderLayer(index, opacity, offset) {
    const layer = layers[index];
    layer.opacity = opacity;
    layer.offset = offset;
    shots[index].style.setProperty("--shot-opacity", opacity);
    shots[index].style.setProperty("--shot-offset", `${offset}px`);
  }

  function settleLayers() {
    shots.forEach((_, index) => renderLayer(index, index === active ? 1 : 0, 0));
  }

  function show(index) {
    cancelAnimationFrame(playback);
    playback = 0;
    const direction = Math.sign(index - active);
    const fromBlack = active === -1 && layers.every(layer => layer.opacity === 0);
    const previous = layers.map(layer => ({ ...layer }));
    active = index;
    shots.forEach((shot, position) => {
      shot.inert = position !== index;
    });
    cue.classList.toggle("is-hidden", index >= 0);
    if (index < 0 && fromBlack) return;

    const started = performance.now();
    const startProgress = previous[index]?.opacity ? previous[index].progress : 0;
    const duration = Math.max(handoffDuration, (shotDurations[index] ?? 0) * (1 - startProgress));
    const render = renderShots[index];
    render?.(shots[index], startProgress);

    function play(now) {
      const elapsed = Math.max(0, now - started);
      const progress = between(elapsed, 0, duration);
      const arriving = fromBlack ? 1 : ease(between(elapsed, 0, 300));
      const leaving = ease(between(elapsed, 65, handoffDuration));
      previous.forEach(({ opacity, offset }, position) => {
        if (position === index) {
          const start = opacity || fromBlack ? offset : direction * 12;
          renderLayer(position, opacity + (1 - opacity) * arriving, start * (1 - arriving));
        } else if (opacity) {
          renderLayer(position, opacity * (1 - leaving), offset - direction * 10 * leaving);
        }
      });
      // If the visitor reverses mid-transition, resume the returning scene's lighting.
      if (render) {
        const shotProgress = startProgress + (1 - startProgress) * progress;
        layers[index].progress = shotProgress;
        render(shots[index], shotProgress);
      }
      if (progress === 1) settleLayers();
      playback = progress < 1 ? requestAnimationFrame(play) : 0;
    }
    playback = requestAnimationFrame(play);
  }

  function step(direction) {
    if (enteringShelf) return;
    if (atPoster() && direction > 0) {
      if (layers[active].progress < posterExitProgress) return;
      enteringShelf = true;
      cancelAnimationFrame(playback);
      playback = 0;
      renderTeam(shots[active], 1);
      settleLayers();
      portrait.inert = true;
      scene.classList.add("is-entering-shelf");
      return;
    }
    const next = active + direction;
    if (next >= -1 && next < shots.length) show(next);
  }

  function finishPosterExit(event) {
    if (event.target === portrait && event.animationName === "portrait-exit") finish();
  }

  function applyLayoutPreference() {
    if (enteringShelf && !immersiveLayout.matches) {
      finish();
      return;
    }
    cancelAnimationFrame(playback);
    playback = 0;
    scene.classList.toggle("is-interactive", immersiveLayout.matches);
    landing.inert = immersiveLayout.matches;
    if (immersiveLayout.matches) {
      active = -1;
      settleLayers();
      show(-1);
      window.scrollTo({ top: 0, behavior: "instant" });
    } else {
      shots.forEach(shot => { shot.inert = false; });
    }
  }

  function activateCue() {
    scene.focus({ preventScroll: true });
    step(1);
  }

  const unbindGestures = bindIntroGestures(scene, { enabled: () => immersiveLayout.matches, step });
  cue.addEventListener("click", activateCue);
  portrait.addEventListener("animationend", finishPosterExit);
  immersiveLayout.addEventListener("change", applyLayoutPreference);
  applyLayoutPreference();

  return () => {
    scene.classList.remove("is-interactive", "is-entering-shelf");
    portrait.inert = false;
    landing.inert = false;
    cancelAnimationFrame(playback);
    unbindGestures();
    cue.removeEventListener("click", activateCue);
    portrait.removeEventListener("animationend", finishPosterExit);
    immersiveLayout.removeEventListener("change", applyLayoutPreference);
  };
}
