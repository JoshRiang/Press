import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import { ExerciseProjection } from "@/src/store/useEngineStore";

export function ProjectionCard({ projection, index }: { projection: ExerciseProjection; index: number }) {
  const [lastW, lastS, lastR] = projection.lastLogData.split("x");
  const [targetW, targetS, targetR] = projection.targetLogData.split("x");

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-200">{projection.exerciseName}</p>
        <div className="flex items-center gap-1">
          <TrendingUp size={10} className="text-sky-400/60" />
          <span className="font-mono text-[9px] text-slate-600">
            {new Date(projection.lastLogDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Last Log */}
        <div className="flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-center">
          <p className="font-mono text-[8px] font-medium tracking-wider text-slate-600 uppercase">
            Last
          </p>
          <p className="mt-0.5 font-mono text-base font-bold text-slate-300">
            {lastW}<span className="text-slate-600">×</span>{lastS}
            <span className="text-slate-600">×</span>{lastR}
          </p>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-sky-400/20 bg-sky-400/10">
            <ArrowRight size={12} className="text-sky-400" />
          </div>
          <span className="font-mono text-[7px] text-sky-400/50">ALGO</span>
        </div>

        {/* Target */}
        <div className="flex-1 rounded-lg border border-sky-400/15 bg-sky-400/5 px-3 py-2 text-center glow-border">
          <p className="font-mono text-[8px] font-medium tracking-wider text-sky-400/60 uppercase">
            Target
          </p>
          <p className="mt-0.5 font-mono text-base font-bold text-sky-400">
            {targetW}<span className="text-sky-400/30">×</span>{targetS}
            <span className="text-sky-400/30">×</span>{targetR}
          </p>
        </div>
      </div>

      {/* Reason */}
      <p className="mt-2 font-mono text-[9px] text-slate-600 leading-relaxed">
        {projection.reason}
      </p>
    </motion.div>
  );
}
