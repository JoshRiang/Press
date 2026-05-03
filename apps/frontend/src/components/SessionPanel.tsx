"use client";

import { useEffect, useState } from "react";
import { Plus, Layers, Loader2 } from "lucide-react";
import { useSessionStore } from "@/src/store/useSessionStore";
import SessionCard from "./SessionCard";
import { Exercise } from "@/src/services/exerciseService";

interface SessionPanelProps {
  exercises: Exercise[];
}

export default function SessionPanel({ exercises }: SessionPanelProps) {
  const {
    sessions,
    loading,
    error,
    fetchSessions,
    startSession,
  } = useSessionStore();

  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    await startSession(newTitle.trim());
    setNewTitle("");
    setCreating(false);
    setShowForm(false);
  };

  return (
    <section className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800/60 bg-slate-950/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-sky-400" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
              Workout Sessions
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-lg bg-sky-400 px-3 py-1.5 font-mono text-xs font-semibold text-slate-950 transition-opacity hover:opacity-90"
          >
            <Plus size={14} />
            New Session
          </button>
        </div>

        {/* Inline New Session Form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mt-3 flex items-center gap-2"
          >
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g., Back Day, Push Day…"
              autoFocus
              className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 outline-none transition-colors focus:border-sky-400"
            />
            <button
              type="submit"
              disabled={creating || !newTitle.trim()}
              className="shrink-0 rounded-lg bg-sky-400 px-4 py-2 font-mono text-xs font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {creating ? "Starting…" : "Start"}
            </button>
          </form>
        )}
      </div>

      {/* Loading / Error  */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-sky-400" />
        </div>
      )}

      {error && (
        <p className="px-4 text-center font-mono text-xs text-red-400">
          {error}
        </p>
      )}

      {/* Session Cards */}
      {!loading && sessions.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Layers size={32} className="text-slate-700" />
          <p className="text-sm text-slate-500">No sessions yet.</p>
          <p className="font-mono text-xs text-slate-600">
            Tap &quot;New Session&quot; to start tracking.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 pb-8">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            exercises={exercises}
          />
        ))}
      </div>
    </section>
  );
}
