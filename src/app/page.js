"use client";
import dynamic from "next/dynamic";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  KeyboardControls,
  CameraControls,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import ClawCamera from "../component/ClawCamera";

// 動態載入 ClawModel，避免 SSR 問題
const ClawModel = dynamic(() => Promise.resolve(ClawModelComponent), {
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

// 音效控制按鈕
function AudioControl({ isMuted, setIsMuted }) {
  return (
    <div className="fixed top-6 left-6 z-40">
      <button
        onClick={() => setIsMuted(!isMuted)}
        className={`bg-[#ECEAE1] rounded-full p-4 border-4 border-[#CBD7E3] shadow-lg transition-all duration-300 hover:scale-105 ${
          isMuted ? 'opacity-60' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 mb-1 flex items-center justify-center">
            {/* 當有音樂時顯示靜音圖示 */}
            {!isMuted ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 9L22 15M22 9L16 15M9 9H2V15H9L14 20V4L9 9Z" stroke="#A77653" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              /* 當沒音樂時顯示音樂圖示 */
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18V5L21 3V16M9 18C9 19.6569 7.65685 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15C7.65685 15 9 16.3431 9 18ZM21 16C21 17.6569 19.6569 19 18 19C16.3431 19 15 17.6569 15 16C15 14.3431 16.3431 13 18 13C19.6569 13 21 14.3431 21 16Z" stroke="#A77653" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="text-xs font-semibold text-[#A77653]">
            {!isMuted ? '靜音' : '音樂'}
          </div>
        </div>
      </button>
    </div>
  );
}

// 計時器UI組件
function Timer({ timer, isActive }) {
  if (!isActive || timer <= 0) return null;

  const getTimerColor = () => {
    if (timer <= 2) return "#D58E66"; // 紅色警告
    if (timer <= 4) return "#F7CB82"; // 黃色注意
    return "#788DAC"; // 正常藍色
  };

  const getTimerScale = () => {
    if (timer <= 2) return "scale-110";
    return "scale-100";
  };

  return (
    <div className="fixed top-6 right-6 z-40">
      <div className={`bg-[#ECEAE1] rounded-full p-4 border-4 border-[#CBD7E3] shadow-lg transition-all duration-300 ${getTimerScale()}`}>
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold text-[#A77653] mb-1">倒數計時</div>
          <div 
            className="text-3xl font-bold transition-colors duration-300"
            style={{ color: getTimerColor() }}
          >
            {timer}
          </div>
          <div className="text-xs text-[#788DAC] mt-1">秒</div>
        </div>
      </div>
    </div>
  );
}

// 音效管理
function AudioManager({ isMuted, timer, isTimerActive }) {
  const bgMusicRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // 創建快節奏可愛背景音樂
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const createTone = (frequency, duration, startTime, volume = 0.08) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, startTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.05);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // 快節奏可愛旋律
      const playBackgroundMusic = () => {
        if (isMuted || audioContext.state === 'closed') return;
        
        const melody = [
          { note: 659.25, duration: 0.2 }, // E5
          { note: 659.25, duration: 0.2 }, // E5
          { note: 0, duration: 0.2 },      // 休止符
          { note: 659.25, duration: 0.2 }, // E5
          { note: 0, duration: 0.2 },      // 休止符
          { note: 523.25, duration: 0.2 }, // C5
          { note: 659.25, duration: 0.4 }, // E5
          { note: 783.99, duration: 0.8 }, // G5
          { note: 392.00, duration: 0.8 }, // G4
        ];

        let currentTime = audioContext.currentTime + 0.1;
        melody.forEach((note) => {
          createTone(note.note, note.duration, currentTime, 0.06);
          currentTime += note.duration;
        });

        // 設定更快的循環間隔
        intervalRef.current = setTimeout(() => {
          if (!isMuted) {
            playBackgroundMusic();
          }
        }, 3500); // 更短的循環時間讓音樂更連貫
      };

      if (!isMuted) {
        playBackgroundMusic();
      }

      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      };
    }
  }, [isMuted]);

  // 清理定時器當靜音狀態改變時
  useEffect(() => {
    if (isMuted && intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isMuted]);

  // 計時器滴答聲
  useEffect(() => {
    if (timer <= 4 && timer > 0 && isTimerActive && !isMuted) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // 根據剩餘時間調整音調
      const frequency = timer <= 2 ? 1000 : 800;
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      
      return () => {
        if (audioContext.state !== 'closed') {
          audioContext.close();
        }
      };
    }
  }, [timer, isTimerActive, isMuted]);

  return null;
}

// 繩子組件
function Rope({ startPos, endPos }) {
  const ropeRef = useRef();
  
  useFrame(() => {
    if (!ropeRef.current) return;
    
    const distance = startPos.distanceTo(endPos);
    const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
    
    // 設置繩子的位置和縮放
    ropeRef.current.position.copy(midPoint);
    ropeRef.current.scale.y = distance;
    
    // 計算繩子的旋轉角度
    const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
    ropeRef.current.lookAt(endPos);
    ropeRef.current.rotateX(Math.PI / 2);
  });

  return (
    <mesh ref={ropeRef}>
      <cylinderGeometry args={[0.005, 0.005, 1, 8]} />
      <meshStandardMaterial color="#8B4513" />
    </mesh>
  );
}

// 包含 useGLTF 的元件，需要避免 SSR 問題
function ClawModelComponent({ clawPos, isClawDown, isWin }) {
  const clawModel = useGLTF("/claw.glb");
  const clawRef = useRef();
  const [clawWorldPos, setClawWorldPos] = useState(new THREE.Vector3());
  const [baseWorldPos, setBaseWorldPos] = useState(new THREE.Vector3());

  useFrame(() => {
    if (!clawRef.current) return;
    const baseY = 2.85;
    const clawY = baseY + clawPos.y;

    let clawObject = null;
    let baseObject = null;

    clawRef.current.traverse((child) => {
      if (child.name === "claw") {
        child.position.set(clawPos.x, clawY, clawPos.z);
        clawObject = child;
      }
      if (child.name === "clawBase") {
        child.position.set(clawPos.x, baseY, clawPos.z);
        baseObject = child;
      }
      if (child.name === "track") {
        child.position.set(0, baseY, clawPos.z);
      }
      if (child.name === "bear") {
        child.visible = isWin;
      }
    });

    // 更新世界座標位置用於繩子渲染
    if (clawObject && baseObject) {
      const clawPos3 = new THREE.Vector3();
      const basePos3 = new THREE.Vector3();
      
      clawObject.getWorldPosition(clawPos3);
      baseObject.getWorldPosition(basePos3);
      
      setClawWorldPos(clawPos3.clone());
      setBaseWorldPos(basePos3.clone());
    }
  });

  return (
    <group>
      <primitive
        ref={clawRef}
        object={clawModel.scene}
        scale={[0.6, 0.6, 0.6]}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
      {/* 繩子 */}
      <Rope startPos={baseWorldPos} endPos={clawWorldPos} />
    </group>
  );
}

export default function Home() {
  const [clawPos, setClawPos] = useState({ x: 0, y: 0, z: 0 });
  const [isClawDown, setIsClawDown] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

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
    setTimer(0);
  };

  return (
    <div className="w-full h-screen relative">
      {/* 音效管理 */}
      <AudioManager 
        isMuted={isMuted} 
        timer={timer} 
        isTimerActive={timer > 0 && !isClawDown && !showStartModal && !showResultModal} 
      />
      
      {/* 音效控制按鈕 */}
      <AudioControl isMuted={isMuted} setIsMuted={setIsMuted} />
      
      {/* 計時器UI */}
      <Timer timer={timer} isActive={timer > 0 && !isClawDown && !showStartModal && !showResultModal} />

      {showStartModal && (
        <Modal
          title="拯救兔兔大作戰"
          text={"用上下左右鍵控制爪子\n瞄準後按下空白鍵\n把兔兔解救出來！\n\n⏰ 開始移動後有10秒時間限制\n🎵 建議開啟音效獲得最佳體驗"}
          buttonText="確認"
          onClose={() => setShowStartModal(false)}
        />
      )}

      {showResultModal && (
        <Modal
          title={isWin ? "成功解救！！" : "解救失敗"}
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

          {!showStartModal && !showResultModal && (
            <ClawCamera
              clawPos={clawPos}
              setClawPos={setClawPos}
              isClawDown={isClawDown}
              setIsClawDown={setIsClawDown}
              onFinish={handleJumpResult}
              timer={timer}
              setTimer={setTimer}
            />
          )}

          <CameraControls />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}