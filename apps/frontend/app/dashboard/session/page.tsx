"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Flame, Clock, Loader2, Trash2, NotebookText, ChevronRight, ArrowUpRight, Search, Layers, Calendar } from "lucide-react";
import { useSessionStore } from "@/src/store/useSessionStore";
import { useProfileStore } from "@/src/store/useProfileStore";
import { sendSessionToKeep } from "../../../src/services/keepService";

// Helpers

function formatVolume(v: number) {
  return v.toLocaleString("en-US");
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFullDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Session Detail View

function SessionDetail({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { sessions, loading, fetchSessions, removeSession } = useSessionStore();
  const user = useProfileStore((state) => state.user);
  const [deleting, setDeleting] = useState(false);
  const [sendingKeep, setSendingKeep] = useState(false);

  useEffect(() => {
    if (sessions.length === 0) fetchSessions();
  }, [sessions.length, fetchSessions]);

  const session = sessions.find((s) => s.id === sessionId);

  const handleDelete = async () => {
    if (!sessionId) return;
    setDeleting(true);
    await removeSession(sessionId);
    router.push("/dashboard/session");
  };

  const handleSendToKeep = async () => {
    if (!session || !user?.email) return;
    setSendingKeep(true);
    try {
      await sendSessionToKeep(session, user.email);
    } catch (error) {
      console.error("Failed to send session to Keep:", error);
    } finally {
      setSendingKeep(false);
    }
  };

  if (loading && !session) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-sky-400" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-slate-500">Session not found.</p>
        <Link href="/dashboard/session" className="font-mono text-xs text-sky-400 hover:underline">
          ← Back to Sessions
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/session" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-500 transition-colors hover:border-slate-700 hover:text-slate-300">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-slate-100">{session.title}</h1>
            <p className="mt-0.5 font-mono text-[10px] text-slate-600">{formatFullDate(session.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Keep Button */}
          <button
            type="button"
            onClick={handleSendToKeep}
            disabled={sendingKeep || !user?.email || session.logs.length === 0}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-400/5 px-3 font-mono text-[10px] font-semibold text-sky-400 transition-colors hover:border-sky-400/40 hover:bg-sky-400/10 disabled:cursor-not-allowed disabled:opacity-40"
            title={!user?.email ? "Profile email not loaded" : session.logs.length === 0 ? "Add at least one log first" : "Send session to Google Keep"}
          >
            <NotebookText size={12} />
            {sendingKeep ? "Sending" : "Keep"}
          </button>

          {/* Volume Badge */}
          <div className="flex items-center gap-1.5 rounded-xl border border-sky-400/20 bg-sky-400/5 px-4 py-2 glow-border">
            <Flame size={14} className="text-sky-400" />
            <span className="font-mono text-lg font-bold text-sky-400">{formatVolume(session.total_volume)}</span>
            <span className="font-mono text-[9px] text-slate-500 uppercase">vol</span>
          </div>
        </div>
      </div>

      {/* Add Exercise Button */}
      <Link href={`/dashboard/session/newlog?sessionId=${session.id}`} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-sky-400/30 bg-sky-400/5 py-3 font-mono text-xs font-semibold text-sky-400 transition-all hover:border-sky-400/50 hover:bg-sky-400/10">
        <Plus size={16} />
        Add Exercise
      </Link>

      {/* Exercise Timeline */}
      {session.logs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-slate-800 to-transparent" />
          <p className="text-sm text-slate-500">No exercises logged yet.</p>
          <p className="font-mono text-xs text-slate-600">Add your first exercise to start logging.</p>
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-slate-800 to-transparent" />
        </div>
      ) : (
        <div className="relative flex flex-col gap-0">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-5 w-px bg-gradient-to-b from-sky-400/20 via-slate-800/40 to-transparent" />

          {session.logs.map((log, i) => {
            const [weight, sets, reps] = log.log_data.split("x");
            return (
              <motion.div key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="relative flex items-start gap-4 py-3">
                {/* Timeline dot */}
                <div className="relative z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
                  <span className="font-mono text-[10px] font-bold text-slate-500">{String(i + 1).padStart(2, "0")}</span>
                </div>

                {/* Card */}
                <div className="flex-1 rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-colors hover:border-slate-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-200">{log.exercise_name}</p>
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} className="text-slate-600" />
                      <span className="font-mono text-[10px] text-slate-600">{formatTime(log.created_at)}</span>
                    </div>
                  </div>

                  {/* Log Data */}
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-sky-400">{weight}</span>
                    <span className="font-mono text-lg text-slate-600">×</span>
                    <span className="font-mono text-3xl font-bold text-slate-200">{sets}</span>
                    <span className="font-mono text-lg text-slate-600">×</span>
                    <span className="font-mono text-3xl font-bold text-slate-200">{reps}</span>
                    <span className="ml-2 font-mono text-xs text-slate-600">kg × sets × reps</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Session */}
      <div className="mt-4 flex justify-center">
        <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 font-mono text-xs text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-40">
          <Trash2 size={12} />
          {deleting ? "Deleting…" : "Delete Session"}
        </button>
      </div>
    </motion.div>
  );
}

// Sessions List
function SessionsList() {
  const { sessions, loading, fetchSessions } = useSessionStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase().trim();

    const MONTHS_EN = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const MONTHS_EN_SHORT = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const MONTHS_ID = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
    const MONTHS_ID_SHORT = ["jan", "feb", "mar", "apr", "mei", "jun", "jul", "agu", "sep", "okt", "nov", "des"];

    return sessions.filter((s) => {
      // Check title match
      if (s.title.toLowerCase().includes(q)) return true;

      // Check date match
      const d = new Date(s.created_at);
      const day = d.getDate();
      const monthIdx = d.getMonth();
      const year = d.getFullYear();

      const en = MONTHS_EN[monthIdx];
      const enShort = MONTHS_EN_SHORT[monthIdx];
      const id = MONTHS_ID[monthIdx];
      const idShort = MONTHS_ID_SHORT[monthIdx];

      const dateStrings = [`${day} ${en}`, `${en} ${day}`, `${day} ${enShort}`, `${enShort} ${day}`, `${day} ${id}`, `${id} ${day}`, `${day} ${idShort}`, `${idShort} ${day}`, `${day} ${monthIdx + 1} ${year}`, `${day}/${monthIdx + 1}/${year}`, `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`].map((str) => str.toLowerCase());

      return dateStrings.some((ds) => ds.includes(q));
    });
  }, [sessions, searchQuery]);

  // Group sessions by month
  const groupedSessions = useMemo(() => {
    const groups = new Map<string, typeof sessions>();
    for (const session of filteredSessions) {
      const key = new Date(session.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(session);
    }
    return groups;
  }, [filteredSessions]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mt-0.5 text-xl font-bold text-slate-100">Session History</h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
          <Layers size={12} className="text-slate-600" />
          <span className="font-mono text-xs font-bold text-slate-300">{sessions.length}</span>
          <span className="font-mono text-[9px] text-slate-600 uppercase">total</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search sessions…" className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-sky-400/50" />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-sky-400" />
        </div>
      )}

      {!loading && filteredSessions.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-800 py-16 text-center">
          <Layers size={28} className="text-slate-800" />
          <p className="text-sm text-slate-500">{searchQuery ? "No sessions match your search." : "No sessions recorded."}</p>
        </div>
      )}

      {/* Grouped Session List */}
      {Array.from(groupedSessions.entries()).map(([monthLabel, monthSessions]) => (
        <div key={monthLabel}>
          <div className="mb-2 flex items-center gap-2">
            <Calendar size={11} className="text-slate-700" />
            <span className="font-mono text-[9px] font-medium tracking-wider text-slate-700 uppercase">{monthLabel}</span>
            <div className="flex-1 h-px bg-slate-800/50" />
            <span className="font-mono text-[9px] text-slate-700">{monthSessions.length} sessions</span>
          </div>

          <div className="flex flex-col gap-2">
            {monthSessions.map((session, i) => {
              // Delta from the older session in global list
              const globalIndex = sessions.indexOf(session);
              const prev = sessions[globalIndex + 1];
              let sessionDelta: number | null = null;
              if (prev && prev.total_volume > 0) {
                sessionDelta = ((session.total_volume - prev.total_volume) / prev.total_volume) * 100;
              }

              return (
                <motion.div key={session.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={`/dashboard/session?id=${session.id}`} className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-slate-700 hover:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/60 font-mono text-[10px] font-bold text-slate-600">{String(sessions.length - globalIndex).padStart(2, "0")}</div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{session.title}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <Clock size={10} className="text-slate-700" />
                          <span className="font-mono text-[10px] text-slate-600">
                            {formatDate(session.created_at)} · {formatTime(session.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
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
        </div>
      ))}
    </motion.div>
  );
}

// Router: decides between list and detail

function SessionPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");

  if (sessionId) {
    return <SessionDetail sessionId={sessionId} />;
  }

  return <SessionsList />;
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-sky-400" />
        </div>
      }
    >
      <SessionPageContent />
    </Suspense>
  );
}
