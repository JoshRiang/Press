import { motion } from "framer-motion";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";

export function WeightProgress({
  current,
  target,
}: {
  current: number;
  target: number;
}) {
  const percentage = Math.min((current / target) * 100, 100);
  const diff = target - current;
  const isAbove = diff < 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scale size={13} className="text-sky-400/60" />
          <p className="font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase">
            Weight Progress
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isAbove ? (
            <TrendingDown size={10} className="text-amber-400" />
          ) : (
            <TrendingUp size={10} className="text-emerald-400" />
          )}
          <span
            className={`font-mono text-[10px] font-bold ${
              isAbove ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {isAbove ? "" : "+"}{Math.abs(diff).toFixed(1)}kg to go
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 w-full rounded-full bg-slate-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300"
        />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-xl font-bold text-sky-400">
          {current}<span className="text-sm text-slate-500">kg</span>
        </span>
        <span className="font-mono text-sm text-slate-500">
          Target: <span className="text-slate-300 font-bold">{target}kg</span>
        </span>
      </div>
    </div>
  );
}
