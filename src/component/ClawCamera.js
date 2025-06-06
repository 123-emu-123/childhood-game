"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import gsap from "gsap";

function ClawCamera({ clawPos, setClawPos, isClawDown, setIsClawDown, onFinish }) {
  const camRef = useRef();
  const [, getKeys] = useKeyboardControls();

  const speed = 0.05;
  const limitX = 0.4;
  const limitZ = 0.3;

  useFrame(() => {
    const { forward, backward, left, right, jump } = getKeys();

    if (!isClawDown) {
      if (forward && clawPos.z > -limitZ) {
        setClawPos((prev) => ({ ...prev, z: prev.z - speed }));
      }
      if (backward && clawPos.z < limitZ) {
        setClawPos((prev) => ({ ...prev, z: prev.z + speed }));
      }
      if (right && clawPos.x < limitX) {
        setClawPos((prev) => ({ ...prev, x: prev.x + speed }));
      }
      if (left && clawPos.x > -limitX) {
        setClawPos((prev) => ({ ...prev, x: prev.x - speed }));
      }

      if (jump) {
        const random = Math.random();
        const isWin = random < 0.5;

        setIsClawDown(true);

        const animationTarget = { y: clawPos.y };

        gsap.to(animationTarget, {
          y: -0.7,
          duration: 2,
          onUpdate: () => {
            setClawPos((prev) => ({ ...prev, y: animationTarget.y }));
          },
          onComplete: () => {
            onFinish?.(isWin);
            gsap.to(animationTarget, {
              y: 0,
              duration: 1.5,
              onUpdate: () => {
                setClawPos((prev) => ({ ...prev, y: animationTarget.y }));
              },
              onComplete: () => {
                setIsClawDown(false);
              },
            });
          },
        });
      }
    }

    if (camRef.current) {
      camRef.current.lookAt(0, 1, 0);
    }
  });

  return <PerspectiveCamera ref={camRef} makeDefault position={[0, 1, 3]} />;
}

export default ClawCamera;