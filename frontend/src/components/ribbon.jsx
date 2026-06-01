import { useEffect } from "react";

const HeartsTrail = () => {
  useEffect(() => {
    const mainHearts = document.querySelectorAll(".main-heart");

    const smallHearts = [];

    mainHearts.forEach(() => {
      const heart = document.createElement("div");
      heart.className = "mini-heart";
      document.body.appendChild(heart);
      smallHearts.push(heart);
    });

    const positions = smallHearts.map(() => ({ x: 0, y: 0 }));

    function animate() {
      mainHearts.forEach((mainHeart, index) => {
        const rect = mainHeart.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;

        positions[index].x += (targetX - positions[index].x) * 0.15;
        positions[index].y += (targetY - positions[index].y) * 0.15;

        smallHearts[index].style.transform = `translate(${positions[index].x}px, ${positions[index].y}px)`;
      });

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      smallHearts.forEach((heart) => heart.remove());
    };
  }, []);

  return null;
};

export default HeartsTrail;