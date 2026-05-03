"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import MannequinModel from "./MannequinModel";

function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    // Look at upper chest area for the best anatomical framing
    camera.lookAt(0, 0.85, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

export default function MannequinScene() {
  return (
    <div className="h-full w-full min-h-[200px]">
      <Canvas
        camera={{ position: [0, 1.1, 2.2], fov: 15 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true }}
      >
        <CameraSetup />
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 4, 3]} intensity={1.4} />
        <directionalLight position={[-2, 2, -3]} intensity={0.5} />
        {/* Rim light for edge definition */}
        <directionalLight position={[0, 2, -4]} intensity={0.3} color="#38bdf8" />
        <MannequinModel />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          rotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}
