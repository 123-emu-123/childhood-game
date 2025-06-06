import { useGLTF } from "@react-three/drei";
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

export default function ClawModel({ clawPos, isClawDown, isWin }) {
  const clawRef = useRef();
  const { scene } = useGLTF("/claw.glb"); // ✅ 正確路徑

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
      object={scene}
      scale={[0.6, 0.6, 0.6]}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}
