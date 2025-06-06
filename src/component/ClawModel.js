// component/ClawModel.js
"use client";

import { useGLTF } from "@react-three/drei";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function ClawModel({ clawPos, isClawDown, isWin }) {
  const clawModel = useGLTF("/claw.glb");
  const clawRef = useRef();

  useFrame(() => {
    if (!clawRef.current) return;

    const baseY = 2.85;
    const clawY = baseY + clawPos.y;

    clawRef.current.traverse((child) => {
      if (child.name === "claw") {
        child.position.set(clawPos.x, clawY, clawPos.z);
      }
      if (child.name === "clawBase") {
        child.position.set(clawPos.x, baseY, clawPos.z);
      }
      if (child.name === "track") {
        child.position.set(0, baseY, clawPos.z);
      }
      if (child.name === "bear") {
        child.visible = isWin;
      }
    });
  });

  return (
    <primitive
      ref={clawRef}
      object={clawModel.scene}
      scale={[0.6, 0.6, 0.6]}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}
