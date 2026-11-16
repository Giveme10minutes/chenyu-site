import { hasSeenIntro } from "./visit.js";

const link = document.getElementById(hasSeenIntro() ? "open-shelf" : "open-intro");
location.replace(link.href);
