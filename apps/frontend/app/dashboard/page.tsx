"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { Flame, Clock, ChevronRight, Loader2, Layers, TrendingUp, TrendingDown, Target, Zap, ArrowUpRight, ArrowRight } from "lucide-react";
import { useSessionStore } from "@/src/store/useSessionStore";
import { getStoredUser, User } from "@/src/services/authService";
import { computeProgression } from "@/src/lib/progressionEngine";
import Sparkline from "@/src/components/Sparkline";
import LocalTime from "@/src/components/LocalTime";

function formatVolume(v: number) {
  return v.toLocaleString("en-US");
}

// Live Timer Hook

function useElapsedTime(startTime: string | null) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!startTime) return;
    const update = () => {
      const diff = Date.now() - new Date(startTime).getTime();
      const hrs = Math.floor(diff / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setElapsed(`${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return elapsed;
}

// Stagger Animation Variants

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// Main Component

export default function DashboardPage() {
  const router = useRouter();
  const { sessions, loading, fetchSessions } = useSessionStore();

  const [user, setUser] = useState<User | null>(null);
  const [timeRange, setTimeRange] = useState<"1D" | "3D" | "7D" | "ALL">("7D");
  const [now, setNow] = useState<number | null>(null);

  // Load user + sessions
  useEffect(() => {
    setNow(Date.now());

    const stored = getStoredUser();
    if (!stored) {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) {
        router.push("/auth/login");
        return;
      }
    }
    setUser(stored);
    fetchSessions();
  }, [fetchSessions, router]);

  // Progression Engine
  const insight = useMemo(() => computeProgression(sessions), [sessions]);

  // Active session (most recent, within 6h)
  const activeSession = now !== null && sessions.length > 0 && now - new Date(sessions[0].created_at).getTime() < 6 * 60 * 60 * 1000 ? sessions[0] : null;

  const activeElapsed = useElapsedTime(activeSession?.created_at ?? null);

  // Dynamic Metrics
  const { recentSessionsCount, totalVolume, totalLogs } = useMemo(() => {
    let recent = sessions;
    if (now !== null && timeRange !== "ALL") {
      const days = timeRange === "1D" ? 1 : timeRange === "3D" ? 3 : 7;
      const cutoff = now - days * 24 * 60 * 60 * 1000;
      recent = sessions.filter((s) => new Date(s.created_at).getTime() >= cutoff);
    }
    return {
      recentSessionsCount: recent.length,
      totalVolume: recent.reduce((s, sess) => s + sess.total_volume, 0),
      totalLogs: recent.reduce((s, sess) => s + sess.logs.length, 0),
    };
  }, [sessions, timeRange]);

  // ONLY TOP 3 SESSIONS
  const recentSessions = sessions.slice(0, 3);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-5 pb-20 md:pb-6">
      {/* 1. IDENTITY & STATUS */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-1">
        <div>
          <p className="font-mono text-[9px] font-medium tracking-[0.25em] uppercase text-slate-600">Welcome back,</p>
          <h1 className="mt-0.5 text-xl font-bold text-slate-100">{user?.full_name || "Operator"}</h1>
          {/* Ultra-Minimal Target Text */}
          {insight.targetMuscleGroup && (
            <p className="px-1 my-3 text-sm text-slate-400 leading-relaxed">
              Your body is primed for <span className="font-medium text-slate-200">{insight.targetMuscleGroup}</span>.
            </p>
          )}
        </div>
      </motion.div>

      {/* 2. Progression Engine Output */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-sky-400" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.2em] uppercase text-sky-400/70">Progression Engine</span>
          </div>
          <Link href="/dashboard/engine" className="flex items-center gap-1.5 font-mono text-[9px] text-sky-400/50 hover:text-sky-400 transition-colors">
            Configure →
          </Link>
        </div>

        {sessions.length === 0 ? (
          <p className="px-1 text-sm text-slate-500">Start your first session to activate the engine.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Single Focused Overload Card */}
            {insight.nextUp && (
              <div className="rounded-2xl border border-sky-400/15 bg-sky-400/[0.02] p-5 flex items-center justify-between relative overflow-hidden group transition-colors hover:bg-sky-400/[0.04]">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-sky-400/10 blur-2xl opacity-50 transition-opacity group-hover:opacity-100" />

                <div className="relative z-10 pr-4">
                  <p className="font-mono text-[9px] text-sky-400/60 uppercase tracking-widest mb-1">Next Overload</p>
                  <p className="text-base font-bold text-slate-200">{insight.nextUp.exerciseName}</p>
                </div>

                <div className="relative z-10 text-right shrink-0">
                  <span className="font-mono text-xl font-bold text-sky-400">
                    {insight.nextUp.targetLogData.split("x").map((part, i) => (
                      <span key={i}>
                        {i > 0 && <span className="text-sky-400/30 mx-0.5">×</span>}
                        {part}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* 3. ACTIVE SESSION */}
      {activeSession && (
        <motion.div variants={itemVariants}>
          <Link href={`/dashboard/session?id=${activeSession.id}`} className="group relative block overflow-hidden rounded-2xl border border-sky-400/30 bg-sky-400/[0.04] p-5 transition-all glow-border hover:bg-sky-400/[0.08]">
            {/* Scanning line effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-sky-400/5 to-transparent animate-pulse" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-mono text-[9px] font-medium tracking-wider text-sky-400/60 uppercase">Active Session</p>
                  <p className="text-base font-semibold text-slate-100">{activeSession.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Live Timer */}
                <div className="hidden items-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-400/5 px-3 py-1.5 sm:flex">
                  <Clock size={12} className="text-sky-400/60" />
                  <span className="font-mono text-sm font-bold tabular-nums text-sky-400">{activeElapsed}</span>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-1.5">
                  <Flame size={12} className="text-sky-400" />
                  <span className="font-mono text-sm font-bold text-sky-400">{formatVolume(activeSession.total_volume)}</span>
                </div>

                <span className="font-mono text-xs font-medium text-sky-400 transition-transform group-hover:translate-x-0.5">Continue →</span>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* 4. STATS */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        {/* Time Range Selector */}
        <div className="flex items-center justify-between px-1">
          <p className="font-mono text-[10px] font-semibold tracking-[0.2em] uppercase text-sky-400/70">Performance</p>
          <div className="flex items-center rounded-lg bg-slate-900/60 p-0.5 border border-slate-800">
            {(["1D", "3D", "7D", "ALL"] as const).map((tr) => (
              <button key={tr} onClick={() => setTimeRange(tr)} className={`rounded-md px-2.5 py-1 font-mono text-[9px] font-bold transition-all ${timeRange === tr ? "bg-sky-500 text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-300"}`}>
                {tr}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {/* Sessions */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase">{timeRange} Sessions</p>
            <p className="mt-1 font-mono text-2xl font-bold text-slate-200">{recentSessionsCount}</p>
          </div>

          {/* Volume + Sparkline + Delta */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flame size={11} className="text-sky-400" />
                <p className="font-mono text-[9px] font-medium tracking-wider text-sky-400/70 uppercase">{timeRange} Volume</p>
              </div>
              {/* Delta badge */}
              {insight.volumeDelta !== null && (
                <div className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold ${insight.isProgressing ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {insight.isProgressing ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {insight.volumeDelta > 0 ? "+" : ""}
                  {insight.volumeDelta.toFixed(1)}%
                </div>
              )}
            </div>
            <p className="mt-1 font-mono text-2xl font-bold text-sky-400">{formatVolume(totalVolume)}</p>
            {/* Sparkline */}
            <div className="mt-2">
              <Sparkline data={insight.volumeTrend} width={140} height={28} color="#38bdf8" fillColor="#38bdf8" />
            </div>
          </div>

          {/* Logs */}
          <div className="col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:col-span-1">
            <p className="font-mono text-[9px] font-medium tracking-wider text-slate-600 uppercase">{timeRange} Logs</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="font-mono text-2xl font-bold text-slate-200">{totalLogs}</p>
              <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Sets Logged</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5. SESSION HISTORY */}
      <motion.div variants={itemVariants}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={13} className="text-slate-600" />
            <h2 className="font-mono text-[10px] font-medium tracking-[0.2em] uppercase text-slate-600">Recent History</h2>
          </div>
          {sessions.length > 3 && (
            <Link href="/dashboard/session" className="flex items-center gap-1 font-mono text-[10px] text-sky-400/60 transition-colors hover:text-sky-400">
              View All History
              <ArrowRight size={10} />
            </Link>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-sky-400" />
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-800 py-16 text-center">
            <Layers size={28} className="text-slate-800" />
            <p className="text-sm text-slate-500">No sessions recorded.</p>
            <p className="font-mono text-xs text-slate-600">Start a session to activate the Progression Engine.</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {recentSessions.map((session, i) => {
            // Per session delta from previous
            const prev = sessions[i + 1];
            let sessionDelta: number | null = null;
            if (prev && prev.total_volume > 0) {
              sessionDelta = ((session.total_volume - prev.total_volume) / prev.total_volume) * 100;
            }

            return (
              <motion.div key={session.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35 }}>
                <Link href={`/dashboard/session?id=${session.id}`} className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 font-mono text-[10px] font-bold text-slate-600">{String(sessions.length - i).padStart(2, "0")}</div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{session.title}</p>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Clock size={10} className="text-slate-700" />
                        <span className="font-mono text-[10px] text-slate-600">
                          <LocalTime value={session.created_at} options={{ weekday: "short", month: "short", day: "numeric" }} />
                          {" · "}
                          <LocalTime value={session.created_at} options={{ hour: "2-digit", minute: "2-digit" }} />
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Per session delta */}
                    {sessionDelta !== null && (
                      <div className={`hidden items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold sm:flex ${sessionDelta >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        <ArrowUpRight size={9} className={sessionDelta < 0 ? "rotate-90" : ""} />
                        {sessionDelta >= 0 ? "+" : ""}
                        {sessionDelta.toFixed(1)}%
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Flame size={12} className="text-sky-400/60" />
                      <span className="font-mono text-sm font-semibold text-sky-400">{formatVolume(session.total_volume)}</span>
                    </div>

                    <span className="font-mono text-[10px] text-slate-700">{session.logs.length} logs</span>

                    <ChevronRight size={16} className="text-slate-800 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* CTA View All History */}
        {sessions.length > 3 && (
          <Link href="/dashboard/session" className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-800 py-3 font-mono text-xs text-slate-500 transition-all hover:border-sky-400/30 hover:text-sky-400">
            View All {sessions.length} Sessions
            <ArrowRight size={12} />
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}
