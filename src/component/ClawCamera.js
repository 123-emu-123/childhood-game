"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import gsap from "gsap";

function ClawCamera({ clawPos, setClawPos, isClawDown, setIsClawDown, onFinish, timer, setTimer }) {
  const camRef = useRef();
  const [, getKeys] = useKeyboardControls();
  const [isTimerActive, setIsTimerActive] = useState(false);

  const speed = 0.05;
  const limitX = 0.4;
  const limitZ = 0.3;

  // 启动计时器
  const startTimer = () => {
    if (!isTimerActive && !isClawDown) {
      setIsTimerActive(true);
      setTimer(10);
    }
  };

  // 计时器逻辑
  useEffect(() => {
    let interval;
    if (isTimerActive && timer > 0 && !isClawDown) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            // 时间到自动落下爪子
            triggerClawDrop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timer, isClawDown]);

  // 爪子落下动画
  const triggerClawDrop = () => {
    if (isClawDown) return;

    const random = Math.random();
    const isWin = random < 0.5;

    setIsClawDown(true);
    setIsTimerActive(false);

    const animationTarget = { y: clawPos.y };

    gsap.to(animationTarget, {
      y: -0.7,
      duration: 2,
      onUpdate: () => {
        setClawPos((prev) => ({ ...prev, y: animationTarget.y }));
      },
      onComplete: () => {
        onFinish?.(isWin);

        if (typeof window !== 'undefined') {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (isWin) {
              // 中獎音效 - 上升音階
              const winNotes = [523.25, 659.25, 783.99, 1046.5]; // C5-E5-G5-C6
              winNotes.forEach((freq, index) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
                osc.type = 'triangle';
                gain.gain.setValueAtTime(0, audioContext.currentTime + index * 0.15);
                gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + index * 0.15 + 0.1);
                gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + index * 0.15 + 0.3);
                
                osc.start(audioContext.currentTime + index * 0.15);
                osc.stop(audioContext.currentTime + index * 0.15 + 0.3);
              });
            } else {
              // 沒中獎音效 - 下降音階
              const loseNotes = [523.25, 466.16, 415.30, 369.99]; // C5-Bb4-Ab4-F#4
              loseNotes.forEach((freq, index) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.2);
                osc.type = 'sawtooth';
                gain.gain.setValueAtTime(0, audioContext.currentTime + index * 0.2);
                gain.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + index * 0.2 + 0.1);
                gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + index * 0.2 + 0.4);
                
                osc.start(audioContext.currentTime + index * 0.2);
                osc.stop(audioContext.currentTime + index * 0.2 + 0.4);
              });
            }
          }

        gsap.to(animationTarget, {
          y: 0,
          duration: 1.5,
          onUpdate: () => {
            setClawPos((prev) => ({ ...prev, y: animationTarget.y }));
          },
          onComplete: () => {
            setIsClawDown(false);
            setTimer(0);
          },
        });
      },
    });
  };

  useFrame(() => {
    const { forward, backward, left, right, jump } = getKeys();

    if (!isClawDown) {
      let moved = false;

      if (forward && clawPos.z > -limitZ) {
        setClawPos((prev) => ({ ...prev, z: prev.z - speed }));
        moved = true;
      }
      if (backward && clawPos.z < limitZ) {
        setClawPos((prev) => ({ ...prev, z: prev.z + speed }));
        moved = true;
      }
      if (right && clawPos.x < limitX) {
        setClawPos((prev) => ({ ...prev, x: prev.x + speed }));
        moved = true;
      }
      if (left && clawPos.x > -limitX) {
        setClawPos((prev) => ({ ...prev, x: prev.x - speed }));
        moved = true;
      }

      // 玩家移动时开始计时
      if (moved && !isTimerActive) {
        startTimer();
      }

      if (jump) {
        triggerClawDrop();
      }
    }

    if (camRef.current) {
      camRef.current.lookAt(0, 1, 0);
    }
  });

  return <PerspectiveCamera ref={camRef} makeDefault position={[0, 1, 3]} />;
}

export default ClawCamera;