import React from "react";

export default function ButterflyTransition() {
  return (
    <div className="butterfly-flight" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div className="butterfly" key={index}>
          <span className="butterfly-wing butterfly-wing-left" />
          <span className="butterfly-wing butterfly-wing-right" />
          <span className="butterfly-body" />
        </div>
      ))}
    </div>
  );
}
