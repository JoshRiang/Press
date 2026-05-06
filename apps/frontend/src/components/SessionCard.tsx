"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Dumbbell, Trash2, Flame } from "lucide-react";
import { WorkoutSession } from "@/src/services/sessionService";
import { useSessionStore } from "@/src/store/useSessionStore";
import SessionLogForm from "./SessionLogForm";
import { Exercise } from "@/src/services/exerciseService";
import LocalTime from "@/src/components/LocalTime";

interface SessionCardProps {
  session: WorkoutSession;
  exercises: Exercise[];
}

function formatVolume(vol: number): string {
  return vol.toLocaleString("en-US");
}

export default function SessionCard({ session, exercises }: SessionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const removeSession = useSessionStore((s) => s.removeSession);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await removeSession(session.id);
    setDeleting(false);
  };

  return (
    <div className={`group rounded-2xl border transition-all duration-300 ${expanded ? "border-sky-400/40 bg-slate-900/90 shadow-lg shadow-sky-400/5" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`}>
      {/* Header */}
      <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 text-left">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400">
            <Dumbbell size={18} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-slate-100">{session.title}</h3>
            <p className="mt-0.5 font-mono text-xs text-slate-500">
              <LocalTime value={session.created_at} options={{ weekday: "short", month: "short", day: "numeric" }} />
              {" · "}
              <LocalTime value={session.created_at} options={{ hour: "2-digit", minute: "2-digit" }} />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Total Volume Badge */}
          <div className="flex items-center gap-1.5 rounded-lg border border-sky-400/20 bg-sky-400/5 px-3 py-1.5">
            <Flame size={14} className="text-sky-400" />
            <span className="font-mono text-sm font-bold text-sky-400">{formatVolume(session.total_volume)}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">vol</span>
          </div>

          {/* Log count */}
          <span className="hidden font-mono text-xs text-slate-500 sm:block">
            {session.logs.length} log{session.logs.length !== 1 ? "s" : ""}
          </span>

          {/* Expand chevron */}
          <div className="text-slate-500 transition-transform">{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-slate-800/60 px-5 pb-5 pt-4">
          {/* Logs Table */}
          {session.logs.length > 0 ? (
            <div className="mb-4 space-y-2">
              {session.logs.map((log) => {
                const [weight, sets, reps] = log.log_data.split("x");
                return (
                  <div key={log.id} className="flex items-center justify-between rounded-xl border border-slate-800/50 bg-slate-950/60 px-4 py-2.5">
                    <span className="text-sm text-slate-300">{log.exercise_name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-sky-400">
                        {weight}
                        <span className="text-slate-600">×</span>
                        {sets}
                        <span className="text-slate-600">×</span>
                        {reps}
                      </span>
                      <span className="font-mono text-[10px] text-slate-600">kg</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mb-4 text-center font-mono text-xs text-slate-600">No logs yet — add your first exercise below.</p>
          )}

          {/* Add Log Form */}
          <SessionLogForm sessionId={session.id} exercises={exercises} />

          {/* Delete Session */}
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 font-mono text-xs text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-40">
              <Trash2 size={12} />
              {deleting ? "Deleting…" : "Delete Session"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
