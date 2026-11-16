export const introKey = "chenyu-site:seen-intro";

export function hasSeenIntro() {
  try {
    return localStorage.getItem(introKey) === "1";
  } catch {
    return false;
  }
}

export function rememberIntro() {
  try {
    localStorage.setItem(introKey, "1");
  } catch {
    // The site also works when the browser disallows storage.
  }
}
