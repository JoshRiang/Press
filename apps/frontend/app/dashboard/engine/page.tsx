"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  Cpu,
  RotateCcw,
  TrendingUp,
  ChevronRight,
  Loader2,
  Info,
  ArrowRight,
  Settings2,
} from "lucide-react";
import { useSessionStore } from "@/src/store/useSessionStore";
import { useEngineStore } from "@/src/store/useEngineStore";
import { computeExerciseProjections } from "@/src/lib/engineCalculations";
import { ParamControl } from "@/src/components/engine/ParamControl";
import { ProjectionCard } from "@/src/components/engine/ProjectionCard";


// Animation variants for page load  
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};


// Main Page
export default function EnginePage() {
  // Store import 
  const { sessions, loading, fetchSessions } = useSessionStore();
  const { config, loadConfig, updateConfig, resetConfig } = useEngineStore();

  // If config or sessions change, we need to recompute projections, changes to parameters affect targets.
  useEffect(() => {
    loadConfig();
    fetchSessions();
  }, [loadConfig, fetchSessions]);

  // Compute projections from sessions + config
  const projections = useMemo(
    () => computeExerciseProjections(sessions, config),
    [sessions, config]
  );

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
          <div className="flex items-center gap-2 mb-1">
            <h1 className="mt-0.5 text-xl font-bold text-slate-100">
              Progression Engine
            </h1>
          </div>
          {/* <h1 className="text-xl font-bold text-slate-100">
            Algorithm Control
          </h1> */}
          <p className="mt-1 text-sm text-slate-500">
            Tune the overload logic and view machine-calculated targets.
          </p>
        </div>
      </motion.div>

      {/* Parameters */}
      <motion.div variants={itemVariants}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 size={13} className="text-slate-600" />
            <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-slate-600">
              Overload Parameters
            </h2>
          </div>
          <button
            onClick={resetConfig}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[10px] text-slate-600 transition-colors hover:bg-slate-900 hover:text-slate-400"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ParamControl
            label="Weight Increment"
            sublabel="Step size when threshold is reached"
            value={config.weightIncrement}
            unit="kg"
            min={0.5}
            max={10}
            step={0.5}
            onChange={(v) => updateConfig({ weightIncrement: v })}
          />
          <ParamControl
            label="Rep Threshold"
            sublabel="Goal reps before weight increases"
            value={config.repThreshold}
            unit=" reps"
            min={6}
            max={20}
            step={1}
            onChange={(v) => updateConfig({ repThreshold: v })}
          />
          <ParamControl
            label="Volume Overload"
            sublabel="Target volume increase per cycle"
            value={config.overloadFactor}
            unit="%"
            min={1}
            max={15}
            step={0.5}
            onChange={(v) => updateConfig({ overloadFactor: v })}
          />
        </div>

        {/* Algorithm Information */}
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-sky-400/10 bg-sky-400/[0.02] px-4 py-3">
          <Info size={13} className="shrink-0 mt-0.5 text-sky-400/40" />
          <p className="font-mono text-[10px] text-slate-500 leading-relaxed">
            When an exercise hits <span className="text-sky-400">{config.repThreshold} reps</span>,
            you adds <span className="text-sky-400">+{config.weightIncrement}kg</span> and
            drops reps by 2. Otherwise, it incrementally targets +1 rep per session.
          </p>
        </div>
      </motion.div>

      {/* Targets Projection */}
      <motion.div variants={itemVariants}>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp size={13} className="text-slate-600" />
          <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-slate-600">
            Target Projections
          </h2>
          <span className="font-mono text-[9px] text-slate-700">
            ({projections.length} exercises)
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-sky-400" />
          </div>
        )}

        {!loading && projections.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-800 py-12 text-center">
            <Cpu size={28} className="text-slate-800" />
            <p className="text-sm text-slate-500">No exercise data to project.</p>
            <p className="font-mono text-xs text-slate-600">
              Log exercises to see machine-calculated targets.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {projections.map((p, i) => (
            <ProjectionCard key={p.exerciseId} projection={p} index={i} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
