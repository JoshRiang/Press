"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  Activity,
  Loader2,
  Eye,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import {
  Mesh,
  Object3D,
  MeshStandardMaterial,
  Color,
  DoubleSide,
} from "three";
import { useSessionStore } from "@/src/store/useSessionStore";
import { getExercises, Exercise } from "@/src/services/exerciseService";
import { computeMuscleFatigue, MuscleFatigueData } from "@/src/lib/engineCalculations";

// Animation Variants
const containerVariants : Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants : Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// Muscle color interpolation (Green/Yellow/Red) based on fatigue intensity (0.0 to 1.0) 
function getHeatColor(intensity: number): Color {
  // 0.0 = Green (#22c55e), 0.5 = Yellow (#eab308), 1.0 = Red (#ef4444)
  if (intensity <= 0.5) {
    const t = intensity * 2;
    return new Color().lerpColors(
      new Color("#22c55e"),
      new Color("#eab308"),
      t
    );
  } else {
    const t = (intensity - 0.5) * 2;
    return new Color().lerpColors(
      new Color("#eab308"),
      new Color("#ef4444"),
      t
    );
  }
}

const INACTIVE_COLOR = new Color("#475569");

function isMesh(o: Object3D): o is Mesh {
  return (o as Mesh).isMesh === true;
}

// 3D Heatmap Mannequin
function HeatmapMannequin({ fatigueData }: { fatigueData: MuscleFatigueData[] }) {
  // Basic 3D, no material, no animation, just a static mannequin with colored materials based on fatigue
  const { scene } = useGLTF("/models/human_body.glb");

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
          side: DoubleSide,
        });
      }
    });
    return clone;
  }, [scene]);

  // Apply heatmap colors
  useEffect(() => {
    const meshMap = new Map(fatigueData.map((d) => [d.meshName, d]));

    clonedScene.traverse((obj) => {
      if (isMesh(obj)) {
        const mat = obj.material as MeshStandardMaterial;

        // Main_Body always stays inactive
        if (obj.name === "Main_Body" || obj.name === "Main Body") {
          mat.color.set(INACTIVE_COLOR);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          return;
        }

        const fatigue = meshMap.get(obj.name);
        if (fatigue && fatigue.intensity > 0) {
          const heatColor = getHeatColor(fatigue.intensity);
          mat.color.set(heatColor);
          mat.emissive.set(heatColor);
          mat.emissiveIntensity = 0.15 + fatigue.intensity * 0.2;
        } else {
          mat.color.set(INACTIVE_COLOR);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      }
    });
  }, [fatigueData, clonedScene]);

  return (
    <group scale={0.2}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Legend Component
function HeatLegend() {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[8px] text-slate-600 uppercase">Recovery</span>
      <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 opacity-80" />
      <span className="font-mono text-[8px] text-slate-600 uppercase">Fatigue</span>
    </div>
  );
}

// Fatigue List
function FatigueList({ data }: { data: MuscleFatigueData[] }) {
  const sorted = [...data].sort((a, b) => b.intensity - a.intensity);

  // If no data, show empty state
  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-800 py-8 text-center">
        <Activity size={24} className="text-slate-800" />
        <p className="text-sm text-slate-500">No muscle data from the last 7 days.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {sorted.map((item, i) => (
        <motion.div
          key={item.muscleId}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center gap-3 rounded-lg border border-slate-800/60 bg-slate-900/40 px-3 py-2"
        >
          {/* Intensity Dot */}
          <div
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{
              backgroundColor: item.intensity <= 0.5
                ? `hsl(${120 - item.intensity * 240}, 70%, 50%)`
                : `hsl(${120 - item.intensity * 120}, 70%, 50%)`,
            }}
          />

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">
              {item.muscleGroup}
            </p>
          </div>

          {/* Frequency */}
          <span className="font-mono text-[10px] text-slate-500">
            {item.frequency}× trained
          </span>

          {/* Intensity Bar */}
          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.intensity * 100}%` }}
              transition={{ delay: i * 0.03 + 0.2, duration: 0.4 }}
              className="h-full rounded-full"
              style={{
                background: item.intensity <= 0.5
                  ? `linear-gradient(to right, #22c55e, #eab308)`
                  : `linear-gradient(to right, #eab308, #ef4444)`,
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Main Page

export default function MyBodyPage() {
  const { sessions, loading: sessionsLoading, fetchSessions } = useSessionStore();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);

  // Fetch sessions and exercises on mount
  useEffect(() => {
    fetchSessions();
    getExercises()
      .then(setExercises)
      .catch(console.error)
      .finally(() => setLoadingExercises(false));
  }, [fetchSessions]);

  // Compute fatigue data whenever sessions or exercises change
  const fatigueData = useMemo(
    () => computeMuscleFatigue(sessions, exercises),
    [sessions, exercises]
  );

  const loading = sessionsLoading || loadingExercises;

  // Stats
  const totalMusclesWorked = fatigueData.length;
  const mostFatigued = fatigueData.sort((a, b) => b.intensity - a.intensity)[0];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Muscle Fatigue Heatmap
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Last 7 days of training mapped to your anatomy.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5">
          <Calendar size={11} className="text-slate-600" />
          <span className="font-mono text-[10px] text-slate-500">7-Day Window</span>
        </div>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-sky-400" />
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Bar */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase">
                Muscles Worked
              </p>
              <p className="mt-0.5 font-mono text-xl font-bold text-slate-200">
                {totalMusclesWorked}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <p className="font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase">
                Most Fatigued
              </p>
              <p className="mt-0.5 text-sm font-bold text-red-400 truncate">
                {mostFatigued?.muscleGroup || "—"}
              </p>
            </div>
          </motion.div>

          {/* 3D Section */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden"
          >
            {/* 3D Canvas */}
            <div className="relative h-[360px] sm:h-[420px]">
              <Canvas
                camera={{ position: [0, 2, 5], fov: 8 }}
                style={{ background: "transparent" }}
              >
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <directionalLight position={[-5, 3, -5]} intensity={0.3} />
                <HeatmapMannequin fatigueData={fatigueData} />
                <OrbitControls
                  enablePan={false}
                  minDistance={3}
                  maxDistance={8}
                  maxPolarAngle={Math.PI * 0.85}
                />
              </Canvas>

              {/* Overlay Controls */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 rounded-lg glass px-2.5 py-1.5">
                  <Eye size={10} className="text-slate-500" />
                  <span className="font-mono text-[8px] text-slate-500">Drag to rotate</span>
                </div>
              </div>
            </div>

            {/* Heat Legend */}
            <div className="border-t border-slate-800/60 px-4 py-3">
              <HeatLegend />
            </div>
          </motion.div>

          {/* Fatigue Breakdown */}
          <motion.div variants={itemVariants}>
            <div className="mb-3 flex items-center gap-2">
              <Activity size={13} className="text-slate-600" />
              <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-slate-600">
                Fatigue Breakdown
              </h2>
            </div>
            <FatigueList data={fatigueData} />
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
