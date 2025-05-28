"use client"
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { RoundedBox, CameraControls, Environment, useGLTF, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";

export default function Home() {

 const isHidden = true;


  const clawModel = useGLTF("claw.glb")






  return (
    <div className="w-full h-screen">
      <Canvas>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        
        {
          !isHidden && <RoundedBox
          args={[1, 1, 1]} // Width, height, depth. Default is [1, 1, 1]
          radius={0.05} // Radius of the rounded corners. Default is 0.05
          smoothness={4} // The number of curve segments. Default is 4
          bevelSegments={4} // The number of bevel segments. Default is 4, setting it to 0 removes the bevel, as a result the texture is applied to the whole geometry.
          creaseAngle={0.4} // Smooth normals everywhere except faces that meet at an angle greater than the crease angle
        >
          <meshPhongMaterial color="#f3f3f3"/>
        </RoundedBox>
        }

        <Suspense fallback={null}>
          <primitive
            object={clawModel.scene}
            scale={[0.6, 0.6, 0.6]}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
          />
        </Suspense>

        <Environment
          background={true} // can be true, false or "only" (which only sets the background) (default: false)
          backgroundBlurriness={0.5} // optional blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
          backgroundIntensity={1} // optional intensity factor (default: 1, only works with three 0.163 and up)
          environmentIntensity={1} // optional intensity factor (default: 1, only works with three 0.163 and up)
          preset={'city'}
        />

        <ContactShadows opacity={1} scale={10} blur={10} far={10} resolution={256} color="#DDDDDD" />



        <CameraControls />


      </Canvas>
    </div>
  );
}