import React from "react";
import { butterflyPaths } from "./butterflyPaths.js";

export default function ButterflyTransition() {
  return (
    <div className="butterfly-flight" aria-hidden="true">
      {butterflyPaths.map(({ sprite, start, foreground }) => (
        <div className={`butterfly butterfly-${sprite}${foreground ? " butterfly-foreground" : ""}`} key={start}>
          <span className="butterfly-wing butterfly-wing-left" />
          <span className="butterfly-wing butterfly-wing-right" />
          <span className="butterfly-body" />
        </div>
      ))}
    </div>
  );
}
