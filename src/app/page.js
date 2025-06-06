"use client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import {
  CameraControls,
  Environment,
  ContactShadows,
  KeyboardControls,
} from "@react-three/drei";
import { Suspense, useState } from "react";
import ClawCamera from "@/component/ClawCamera";

// ✅ Dynamic import 避免 SSR 出錯
const ClawModel = dynamic(() => import("@/component/ClawModel"), {
  ssr: false,
});

// ✅ Modal 元件
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

// ✅ 主畫面元件
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
          {/* 光源 */}
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

          {/* 模型與相機 */}
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
