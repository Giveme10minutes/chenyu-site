import { bindIntroGestures } from "./introGestures.js";

const shotDurations = [820, 760, 760, 860];
const posterTravel = 0.9;

export function attachScrollScenes(scene, finish) {
  const stage = scene.querySelector(".stage");
  const cue = scene.querySelector(".scroll-cue");
  const landing = scene.querySelector(".blog-landing");
  const shots = [...scene.querySelectorAll(".portrait-shot")];
  const immersiveLayout = matchMedia("(prefers-reduced-motion: no-preference)");
  let active = -1;
  let playback = 0;
  let scrollFrame = 0;
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
    shot.style.setProperty("--shot-opacity", ease(between(progress, 0, 0.23)));
    shot.style.setProperty("--shot-light", light);
    shot.style.setProperty("--turn", `${direction * 30 * (1 - turn)}deg`);
    shot.style.setProperty("--actor-shift", `${direction * 7 * (1 - turn)}%`);
    shot.style.setProperty("--caption-opacity", ease(between(progress, 0.47, 0.89)));
  }

  function renderTeam(shot, progress) {
    const light = ease(between(progress, 0, 0.77));
    shot.style.setProperty("--shot-opacity", ease(between(progress, 0, 0.39)));
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

  function show(index) {
    cancelAnimationFrame(playback);
    playback = 0;
    active = index;
    shots.forEach((shot, position) => {
      shot.style.setProperty("--shot-opacity", position === index ? 1 : 0);
      shot.inert = position !== index;
    });
    scene.classList.toggle("is-poster-ready", atPoster());
    scene.style.setProperty("--intro-screens", atPoster() ? 1 + posterTravel : 1);
    cue.classList.toggle("is-hidden", index >= 0);
    if (index < 0) return;

    const started = performance.now();
    const duration = shotDurations[index];
    const render = renderShots[index];
    render(shots[index], 0);

    function play(now) {
      const progress = between(now - started, 0, duration);
      render(shots[index], progress);
      playback = progress < 1 ? requestAnimationFrame(play) : 0;
    }
    playback = requestAnimationFrame(play);
  }

  function step(direction) {
    const next = active + direction;
    if (next >= -1 && next < shots.length) show(next);
  }

  function renderPosterExit() {
    scrollFrame = 0;
    const offset = atPoster() ? Math.max(0, -scene.getBoundingClientRect().top) : 0;
    const distance = posterTravel * stage.clientHeight;
    const exit = offset > 0 ? between(offset + 1, 0, distance) : 0;
    if (exit > 0 && playback) {
      cancelAnimationFrame(playback);
      playback = 0;
      renderTeam(shots[active], 1);
    }

    const reveal = ease(exit);
    scene.style.setProperty("--poster-offset", `${-100 * exit}%`);
    scene.style.setProperty("--poster-scale", 1 - 0.045 * reveal);
    scene.style.setProperty("--poster-shadow", 0.24 * (1 - reveal));
    scene.style.setProperty("--shelf-rise", `${24 * (1 - reveal)}px`);
    if (exit === 1) finish();
  }

  function scheduleExit() {
    if (immersiveLayout.matches && !scrollFrame) scrollFrame = requestAnimationFrame(renderPosterExit);
  }

  function applyLayoutPreference() {
    cancelAnimationFrame(playback);
    cancelAnimationFrame(scrollFrame);
    playback = scrollFrame = 0;
    scene.classList.toggle("is-interactive", immersiveLayout.matches);
    landing.inert = immersiveLayout.matches;
    if (immersiveLayout.matches) {
      show(-1);
      window.scrollTo({ top: 0, behavior: "instant" });
      renderPosterExit();
    } else {
      shots.forEach(shot => { shot.inert = false; });
    }
  }

  function activateCue() {
    scene.focus({ preventScroll: true });
    step(1);
  }

  const unbindGestures = bindIntroGestures(scene, { enabled: () => immersiveLayout.matches, atPoster, step });
  cue.addEventListener("click", activateCue);
  addEventListener("scroll", scheduleExit, { passive: true });
  addEventListener("resize", scheduleExit);
  immersiveLayout.addEventListener("change", applyLayoutPreference);
  applyLayoutPreference();

  return () => {
    scene.classList.remove("is-interactive", "is-poster-ready");
    landing.inert = false;
    cancelAnimationFrame(playback);
    cancelAnimationFrame(scrollFrame);
    unbindGestures();
    cue.removeEventListener("click", activateCue);
    removeEventListener("scroll", scheduleExit);
    removeEventListener("resize", scheduleExit);
    immersiveLayout.removeEventListener("change", applyLayoutPreference);
  };
}
