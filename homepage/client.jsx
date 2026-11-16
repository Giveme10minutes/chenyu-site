import React from "react";
import { hydrateRoot } from "react-dom/client";
import Homepage from "./Homepage.jsx";

const root = document.getElementById("homepage");
const { route, base, assets } = root.dataset;
const rows = JSON.parse(document.getElementById("shelf-data").textContent);
hydrateRoot(root, <Homepage rows={rows} initialRoute={route} base={base} assets={assets}
  navigationBase={new URL(base, location.href).pathname} stableAssets={new URL(assets, location.href).pathname} />);
