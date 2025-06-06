"use client";
import dynamic from "next/dynamic";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  KeyboardControls,
  CameraControls,
} from "@react-three/drei";
import { Suspense, useRef, useState, useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// 动态导入 ClawCamera，避免 SSR 问题
const ClawCamera = dynamic(() => import("../component/ClawCamera"), {
  ssr: false,
});

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

// 使用基础几何体的爪子机组件
function BasicClawModel({ clawPos, isClawDown, isWin }) {
  const clawRef = useRef();
  const bearRef = useRef();

  useFrame(() => {
    if (clawRef.current) {
      const baseY = 2.85;
      const clawY = baseY + clawPos.y;
      clawRef.current.position.set(clawPos.x, clawY, clawPos.z);
    }
    
    if (bearRef.current) {
      bearRef.current.visible = isWin;
      if (isWin) {
        bearRef.current.position.set(clawPos.x, 2.85 + clawPos.y - 0.4, clawPos.z);
      }
    }
  });

  return (
    <group>
      {/* 轨道 */}
      <mesh position={[0, 2.85, clawPos.z]}>
        <boxGeometry args={[2, 0.1, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* 爪子基座 */}
      <mesh position={[clawPos.x, 2.85, clawPos.z]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
      
      {/* 爪子 */}
      <mesh ref={clawRef} position={[clawPos.x, 2.85 + clawPos.y, clawPos.z]}>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color="#F7CB82" />
      </mesh>
      
      {/* 爪子的钩子 */}
      <mesh position={[clawPos.x, 2.85 + clawPos.y - 0.15, clawPos.z]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#D2691E" />
      </mesh>
      
      {/* 兔兔 (获胜时显示) */}
      <mesh ref={bearRef} visible={false}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>
      
      {/* 兔兔的耳朵 */}
      {isWin && (
        <group position={[clawPos.x, 2.85 + clawPos.y - 0.2, clawPos.z]}>
          <mesh position={[0.08, 0.1, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
          <mesh position={[-0.08, 0.1, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="#FFB6C1" />
          </mesh>
        </group>
      )}
      
      {/* 机器外壳 */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2.5, 3, 1.5]} />
        <meshStandardMaterial color="#E6E6FA" transparent opacity={0.3} />
      </mesh>
      
      {/* 底座 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.8, 0.2, 1.8]} />
        <meshStandardMaterial color="#4682B4" />
      </mesh>
    </group>
  );
}

// 尝试加载 GLTF 模型的组件
function GLTFClawModel({ clawPos, isClawDown, isWin }) {
  const [gltf, setGltf] = useState(null);
  const [error, setError] = useState(false);
  const clawRef = useRef();

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      "/claw.glb",
      (loadedGltf) => {
        setGltf(loadedGltf);
      },
      undefined,
      (error) => {
        console.warn("GLTF loading failed, using basic model:", error);
        setError(true);
      }
    );
  }, []);

  useFrame(() => {
    if (!clawRef.current || !gltf) return;
    
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

  // 如果加载失败或还在加载中，使用基础模型
  if (error || !gltf) {
    return <BasicClawModel clawPos={clawPos} isClawDown={isClawDown} isWin={isWin} />;
  }

  return (
    <primitive
      ref={clawRef}
      object={gltf.scene}
      scale={[0.6, 0.6, 0.6]}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// 动态导入主要的爪子模型组件
const ClawModel = dynamic(() => Promise.resolve(GLTFClawModel), {
  ssr: false,
});

export default function Home() {
  const [clawPos, setClawPos] = useState({ x: 0, y: 0, z: 0 });
  const [isClawDown, setIsClawDown] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // 如果不是客户端，显示简单的加载界面
  if (!isClient) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700 mb-4">拯救兔兔大作戰</div>
          <div className="text-lg text-gray-600 mb-6">遊戲載入中...</div>
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

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

          <Suspense fallback={<BasicClawModel clawPos={clawPos} isClawDown={isClawDown} isWin={isWin} />}>
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