import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const YetiLoginAnimation = () => {
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = document.querySelector('#email') as HTMLInputElement;
    const password = document.querySelector('#password') as HTMLInputElement;

    const armL = document.querySelector('.armL');
    const armR = document.querySelector('.armR');

    function coverEyes() {
      gsap.to(armL, { duration: .45, x: -93, y: 2, rotation: 0 });
      gsap.to(armR, { duration: .45, x: -93, y: 2, rotation: 0, delay: .1 });
    }

    function uncoverEyes() {
      gsap.to(armL, { duration: 1.2, y: 220, rotation: 105 });
      gsap.to(armR, { duration: 1.2, y: 220, rotation: -105 });
    }

    password?.addEventListener("focus", coverEyes);
    password?.addEventListener("blur", uncoverEyes);

    return () => {
      password?.removeEventListener("focus", coverEyes);
      password?.removeEventListener("blur", uncoverEyes);
    };

  }, []);

  return (
    <div ref={svgRef} className="svgContainer">
      {/* paste FULL SVG Yeti di sini tanpa diubah */}
    </div>
  );
};

export default YetiLoginAnimation;