"use client";
import Image from "next/image";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  RoundedBox,
  CameraControls,
  Environment,
  useGLTF,
  ContactShadows,
  KeyboardControls,
} from "@react-three/drei";
import { Suspense, useEffect, useState, useRef } from "react";
import ClawCamera from "@/component/ClawCamera";

function Modal({ title, text, buttonText, onClose }) {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-[#00000080] flex items-center justify-center z-50">
      <div className="bg-[#ECEAE1] rounded-2xl shadow-lg p-8 max-w-sm text-center border-4 border-[#CBD7E3]">
        <h2 className="text-xl font-bold text-[#A77653] mb-4">{title}</h2>
        <p className="text-[#788DAC] whitespace-pre-line mb-6">{text}</p>
        <button
          onClick={onClose}
          className="bg-[#F7CB82] hover:bg-[#D58E66] text-[#A77653] font-semibold px-4 py-2 rounded-full transition"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

function ClawModel({ clawPos, isClawDown, isWin }) {
  const clawModel = useGLTF("/claw.glb"); // <-- 使用公開路徑
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

export default function Home() {
  const [clawPos, setClawPos] = useState({ x: 0, y: 0, z: 0 });
  const [isClawDown, setIsClawDown] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isWin, setIsWin] = useState(false);

  const handleJumpResult = (result) => {
    setIsWin(result);
    setTimeout(() => {
      setShowResultModal(true);
    }, 2000);
  };

  const resetGame = () => {
    setClawPos({ x: 0, y: 0, z: 0 });
    setIsClawDown(false);
    setShowResultModal(false);
    setIsWin(false);
  };

  return (
    <div className="w-full h-screen relative">
      {showStartModal && (
        <Modal
          title="拯救兔兔大作戰"
          text={"用上下左右鍵控制爪子\n瞄準後按下空白鍵\n把兔兔解救出來！"}
          buttonText="確認"
          onClose={() => setShowStartModal(false)}
        />
      )}

      {showResultModal && (
        <Modal
          title={isWin ? "恭喜中獎！" : "未中獎"}
          text={isWin ? "兔兔鎖定你，一起回家去！" : "嗚嗚嗚...兔兔被持續囚禁了"}
          buttonText="再玩一次"
          onClose={resetGame}
        />
      )}

      <KeyboardControls
        map={[
          { name: "forward", keys: ["ArrowUp", "w", "W"] },
          { name: "backward", keys: ["ArrowDown", "s", "S"] },
          { name: "left", keys: ["ArrowLeft", "a", "A"] },
          { name: "right", keys: ["ArrowRight", "d", "D"] },
          { name: "jump", keys: ["Space"] },
        ]}
      >
        <Canvas>
          <ambientLight intensity={Math.PI / 2} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            decay={0}
            intensity={Math.PI}
          />
          <pointLight
            position={[-10, -10, -10]}
            decay={0}
            intensity={Math.PI}
          />

          <Suspense fallback={null}>
            <ClawModel
              clawPos={clawPos}
              isClawDown={isClawDown}
              isWin={isWin}
            />
          </Suspense>

          <Environment
            background={true}
            backgroundBlurriness={0.08}
            backgroundIntensity={1}
            environmentIntensity={1}
            preset={"park"}
          />

          <ContactShadows
            opacity={1}
            scale={10}
            blur={10}
            far={10}
            resolution={256}
            color="#DDDDDD"
          />

          {!showStartModal && (
            <ClawCamera
              clawPos={clawPos}
              setClawPos={setClawPos}
              isClawDown={isClawDown}
              setIsClawDown={setIsClawDown}
              onFinish={handleJumpResult}
            />
          )}

          <CameraControls />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}
