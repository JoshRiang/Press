"use client";

import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Loader2 } from "lucide-react";
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

function LoaderFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <Loader2 size={24} className="animate-spin text-sky-500" />
        <span className="font-mono text-[10px] tracking-widest text-sky-400 uppercase">
          Loading Anatomy...
        </span>
      </div>
    </Html>
  );
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
        <Suspense fallback={<LoaderFallback />}>
          <MannequinModel />
        </Suspense>
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
