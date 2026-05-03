"use client";

import { useRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Mesh, Object3D, MeshStandardMaterial, Color, DoubleSide } from "three";
import { useAnatomyStore } from "@/src/store/useAnatomyStore";

const ACTIVE_COLOR = new Color("#ef4444");
const SECONDARY_COLOR = new Color("#ea580c"); // Dark orange / orange-600
const INACTIVE_COLOR = new Color("#475569");
const SUCCESS_COLOR = new Color("#22c55e");

function isMesh(o: Object3D): o is Mesh {
  return (o as Mesh).isMesh === true;
}

export default function MannequinModel() {
  const { scene } = useGLTF("/models/human_body.glb");
  const activeMuscles = useAnatomyStore((s) => s.activeMuscles);
  const secondaryMuscles = useAnatomyStore((s) => s.secondaryMuscles);
  const successMuscles = useAnatomyStore((s) => s.successMuscles);
  const materialsCloned = useRef(false);

  // Clone the scene and force a new independent material on EVERY mesh.
  // This guarantees all meshes (Main_Body, Mesh_Head, etc) render properly and fixes any missing material or transparency issues from the GLTF.
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if (isMesh(obj)) {
        obj.material = new MeshStandardMaterial({
          color: INACTIVE_COLOR,
          roughness: 0.6,
          metalness: 0.1,
          transparent: false,
          opacity: 1,
          side: DoubleSide, // used double side because there are material from the GLTF that are only single side
        });
      }
    });
    return clone;
  }, [scene]);

  // Highlight active 
  useEffect(() => {
    clonedScene.traverse((obj) => {
      if (isMesh(obj)) {
        const mat = obj.material as MeshStandardMaterial;

        // Main_Body always stays inactive but NEED to be imported, otherwise the model will be missing some meshes 
        if (obj.name === "Main_Body" || obj.name === "Main Body") {
          mat.color.set(INACTIVE_COLOR);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          return;
        }

        if (successMuscles.includes(obj.name)) {
          mat.color.set(SUCCESS_COLOR);
          mat.emissive.set(SUCCESS_COLOR);
          mat.emissiveIntensity = 0.3;
        } else if (activeMuscles.includes(obj.name)) {
          mat.color.set(ACTIVE_COLOR);
          mat.emissive.set(ACTIVE_COLOR);
          mat.emissiveIntensity = 0.25;
        } else if (secondaryMuscles.includes(obj.name)) {
          mat.color.set(SECONDARY_COLOR);
          mat.emissive.set(SECONDARY_COLOR);
          mat.emissiveIntensity = 0.25;
        } else {
          mat.color.set(INACTIVE_COLOR);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      }
    });
  }, [activeMuscles, secondaryMuscles, successMuscles, clonedScene]);

  return (
    <group scale={0.2}>
      <primitive object={clonedScene} />
    </group>
  );
}
