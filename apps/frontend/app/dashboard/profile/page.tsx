"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Target,
  Scale,
  Ruler,
  Edit3,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Database,
  Shield,
} from "lucide-react";
import { useProfileStore } from "@/src/store/useProfileStore";
import { useSessionStore } from "@/src/store/useSessionStore";
import Sparkline from "@/src/components/Sparkline";
import { WeightProgress } from "@/src/components/profile/WeightProgress";
import { InfoRow } from "@/src/components/profile/InfoRow";
import { EditableMetric } from "@/src/components/profile/EditableMetric";

// Animation Variants 
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
export default function ProfilePage() {
  const router = useRouter();
  const { user, metrics, dbStatus, loadUser, updateMetrics, addWeightEntry } =
    useProfileStore();
  const { sessions, fetchSessions } = useSessionStore();

  const [weightInput, setWeightInput] = useState("");
  const [showWeightForm, setShowWeightForm] = useState(false);

  useEffect(() => {
    loadUser();
    fetchSessions();
  }, [loadUser, fetchSessions]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) {
        router.push("/auth/login");
      }
    }
  }, [user, router]);

  const handleLogWeight = () => {
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 0) {
      addWeightEntry(w);
      setWeightInput("");
      setShowWeightForm(false);
    }
  };

  // Member duration
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const totalSessions = sessions.length;
  const totalLogs = sessions.reduce((s, sess) => s + sess.logs.length, 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 pb-20 md:pb-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl font-bold text-slate-100">
          Personal Identity
        </h1>
      </motion.div>

      {/* Identity Card */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-sky-400/15 bg-gradient-to-br from-sky-400/[0.03] to-transparent p-5 glow-border"
      >
        <div className="flex items-center gap-4">
          {/* Avatar Uasing User Name */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 shrink-0">
            <span className="font-mono text-xl font-bold text-sky-400">
              {user?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-slate-100 truncate">
              {user?.full_name || "Loading…"}
            </h2>
            <div className="mt-0.5 flex items-center gap-1.5">
              <Mail size={10} className="text-slate-600" />
              <span className="font-mono text-[10px] text-slate-500 truncate">
                {user?.email || "—"}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${
                dbStatus === "connected" ? "bg-emerald-400" :
                dbStatus === "disconnected" ? "bg-red-400" : "bg-amber-400 animate-pulse"
              }`} />
              <span className="font-mono text-[8px] tracking-wider text-slate-600 uppercase">
                {dbStatus === "connected" ? "ONLINE" : dbStatus === "disconnected" ? "OFFLINE" : "SYNC"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* User Details */}
      <motion.div variants={itemVariants} className="flex flex-col gap-2">
        <InfoRow icon={Shield} label="User ID" value={user?.id?.slice(0, 8) + "…" || "—"} />
        <InfoRow icon={Calendar} label="Member Since" value={memberSince} />
        <InfoRow icon={Database} label="Total Sessions" value={String(totalSessions)} />
        <InfoRow icon={Target} label="Total Logs" value={String(totalLogs)} />
      </motion.div>

      {/* Body Analytics */}
      <motion.div variants={itemVariants}>
        <div className="mb-3 flex items-center gap-2">
          <Scale size={13} className="text-slate-600" />
          <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-slate-600">
            Body Analytics
          </h2>
        </div>

        {/* Weight Progress */}
        <WeightProgress
          current={metrics.currentWeight}
          target={metrics.targetWeight}
        />
      </motion.div>

      {/* Editable Metrics */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <EditableMetric
          label="Current Weight"
          value={metrics.currentWeight}
          unit="kg"
          onSave={(v) => updateMetrics({ currentWeight: v })}
        />
        <EditableMetric
          label="Target Weight"
          value={metrics.targetWeight}
          unit="kg"
          onSave={(v) => updateMetrics({ targetWeight: v })}
        />
        <EditableMetric
          label="Height"
          value={metrics.height}
          unit="cm"
          onSave={(v) => updateMetrics({ height: v })}
        />
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase mb-2">
            BMI
          </p>
          {/* Calculate BMI */}
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-xl font-bold text-slate-200">
              {metrics.height > 0
                ? (metrics.currentWeight / Math.pow(metrics.height / 100, 2)).toFixed(1)
                : "—"}
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              {metrics.height > 0 &&
                (() => {
                  const bmi = metrics.currentWeight / Math.pow(metrics.height / 100, 2);
                  if (bmi < 18.5) return "Underweight";
                  if (bmi < 25) return "Normal";
                  if (bmi < 30) return "Overweight";
                  return "Obese";
                })()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Weight Log */}
      <motion.div variants={itemVariants}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={13} className="text-slate-600" />
            <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-slate-600">
              Weight History
            </h2>
          </div>
          <button
            onClick={() => setShowWeightForm(!showWeightForm)}
            className="font-mono text-[10px] text-sky-400/60 hover:text-sky-400 transition-colors"
          >
            + Log Weight
          </button>
        </div>

        {showWeightForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-3 flex items-center gap-2 rounded-xl border border-sky-400/20 bg-sky-400/5 p-3"
          >
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="e.g. 62.5"
              autoFocus
              className="flex-1 bg-transparent font-mono text-sm text-slate-200 outline-none placeholder-slate-600"
              onKeyDown={(e) => e.key === "Enter" && handleLogWeight()}
            />
            <span className="font-mono text-xs text-slate-600">kg</span>
            <button
              onClick={handleLogWeight}
              className="rounded-lg bg-sky-400 px-3 py-1.5 font-mono text-[10px] font-semibold text-slate-950 transition-opacity hover:opacity-90"
            >
              Log
            </button>
          </motion.div>
        )}

        {/* Weight Sparkline */}
        {metrics.weightHistory.length >= 2 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <Sparkline
              data={metrics.weightHistory.map((h) => h.weight)}
              width={280}
              height={48}
              color="#38bdf8"
              fillColor="#38bdf8"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[9px] text-slate-600">
                {metrics.weightHistory[0]?.date}
              </span>
              <span className="font-mono text-[9px] text-slate-600">
                {metrics.weightHistory[metrics.weightHistory.length - 1]?.date}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 py-6 text-center">
            <p className="font-mono text-xs text-slate-600">
              Log at least 2 weight entries to see your trend.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
