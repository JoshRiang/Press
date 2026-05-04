"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  X,
  ChevronLeft,
  TrendingUp,
} from "lucide-react";
import { getExercises, Exercise } from "@/src/services/exerciseService";
import { useAnatomyStore } from "@/src/store/useAnatomyStore";
import { useSessionStore } from "@/src/store/useSessionStore";
import { useEngineStore } from "@/src/store/useEngineStore";
import { computeExerciseProjections } from "@/src/lib/engineCalculations";
import MannequinScene from "@/src/components/MannequinScene";

const LOG_REGEX = /^\d+([.,]\d+)?x\d+([.,]\d+)?x\d+([.,]\d+)?$/;

// Muscle group mapping 
// Each pill maps to an array of muscle_group values from the database
const MUSCLE_PILL_MAP: Record<string, string[]> = {
  Chest: ["Dada Bawah", "Dada Tengah", "Dada Atas"],
  Back: ["Punggung (Umum)", "Punggung Tengah", "Lats / Sayap"],
  Shoulder: ["Bahu / Deltoid", "Traps / Pundak"],
  Leg: ["Paha Depan", "Paha Belakang", "Betis", "Bongkong"],
  Arm: ["Bicep", "Tricep", "Lengan Bawah"],
  Core: ["Inti / Perut"],
};

// Map muscle_group back to pill key for mesh-name lookup
const PILL_MESH_MAP: Record<string, string[]> = {
  Chest: ["Mesh_Bottom_Chest", "Mesh_Middle_Chest", "Mesh_Upper_Chest"],
  Back: ["Mesh_Back", "Mesh_Middle_Back", "Mesh_Lats"],
  Shoulder: ["Mesh_Shoulder", "Mesh_Traps"],
  Leg: ["Mesh_Quads", "Mesh_Hamstring", "Mesh_Calf", "Mesh_Glutes"],
  Arm: ["Mesh_Bicep", "Mesh_Tricep", "Mesh_Forearm"],
  Core: ["Mesh_Core"],
};

const PILL_KEYS = Object.keys(MUSCLE_PILL_MAP);

// Component 

function NewLogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");

  const addLog = useSessionStore((s) => s.addLog);
  const setActiveMuscles = useAnatomyStore((s) => s.setActiveMuscles);
  const setHoveredExercise = useAnatomyStore((s) => s.setHoveredExercise);
  const clearHover = useAnatomyStore((s) => s.clearHover);
  const triggerSuccess = useAnatomyStore((s) => s.triggerSuccess);

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [logInput, setLogInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sessions = useSessionStore((s) => s.sessions);
  const config = useEngineStore((s) => s.config);

  const projections = useMemo(
    () => computeExerciseProjections(sessions, config),
    [sessions, config]
  );

  const activeProjection = useMemo(() => {
    if (!selectedExercise) return null;
    return projections.find((p) => p.exerciseId === selectedExercise.exercise_id) || null;
  }, [projections, selectedExercise]);

  // Fetch exercises
  useEffect(() => {
    getExercises()
      .then(setExercises)
      .catch(() => setError("Failed to load exercises"))
      .finally(() => setLoadingExercises(false));
  }, []);

  // Filter exercises by selected pill
  const filteredExercises = useMemo(() => {
    if (!activeFilter) return exercises;
    const groups = MUSCLE_PILL_MAP[activeFilter] || [];
    return exercises.filter((ex) =>
      ex.primary_targets.some((t) => groups.includes(t.muscle_group))
    );
  }, [exercises, activeFilter]);

  // When pill is tapped, highlight corresponding meshes on the mannequin
  // The pill here mean the muscle group filter pills (Chest, Back, Shoulder, etc) not the exercise pills (Bench Press, Deadlift, etc)
  const handlePillSelect = useCallback(
    (pill: string | null) => {
      setActiveFilter(pill);
      if (pill && PILL_MESH_MAP[pill]) {
        setActiveMuscles(PILL_MESH_MAP[pill]);
      } else {
        setActiveMuscles([]);
      }
    },
    [setActiveMuscles]
  );

  // Highlight muscles on mannequin
  const handleSelectExercise = (ex: Exercise) => {
    setSelectedExercise(ex);
    setHoveredExercise(ex);
    setLogInput("");
    setError(null);
  };

  // Handle log submission
  const handleSubmit = async () => {
    if (!selectedExercise || !sessionId) return;
    setError(null);

    if (!LOG_REGEX.test(logInput)) {
      setError("Format: WeightxSetsxReps (e.g., 60x3x12 or 32.5x3x12)");
      return;
    }

    setSubmitting(true);
    try {
      await addLog(sessionId, selectedExercise.exercise_id, logInput);
      triggerSuccess(selectedExercise);
      setSelectedExercise(null);
      setLogInput("");
      clearHover();
      router.push(`/dashboard/session?id=${sessionId}`);
    } catch {
      setError("Failed to save log");
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel exercise selection
  const handleCancel = () => {
    setSelectedExercise(null);
    setLogInput("");
    setError(null);
    clearHover();
    // Restore pill highlighting 
    if (activeFilter && PILL_MESH_MAP[activeFilter]) {
      setActiveMuscles(PILL_MESH_MAP[activeFilter]);
    }
  };

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-slate-500">No session selected.</p>
        <Link href="/dashboard" className="font-mono text-xs text-sky-400 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  // FULL-SCREEN LOG INPUT 
  if (selectedExercise) {
    return (
      <div className="animate-slide-up -mx-4 md:-mx-8 -my-6 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
        <div className="relative h-[35vh] shrink-0 bg-[#020617]">
          <MannequinScene />
          {/* Back button overlay */}
          <div className="absolute top-4 left-4 flex items-center">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 rounded-lg bg-slate-950/70 px-3 py-1.5 text-sm text-slate-300 backdrop-blur-sm transition-colors hover:text-slate-100"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="relative -mt-5 flex flex-1 flex-col rounded-t-3xl border-t border-slate-800/60 bg-[#0f172a] px-5 pt-6 pb-24 sm:pb-8">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-700" />
          {/* Exercise Title */}
          <h2 className="mb-3 text-center text-lg font-bold text-slate-100">
            {selectedExercise.name}
          </h2>
          {/* Progressive Overload Suggestion */}
          {activeProjection && (
            <div className="mx-auto mb-5 w-full max-w-xs rounded-xl border border-sky-400/20 bg-sky-400/5 p-3 text-center glow-border">
              <div className="mb-1 flex items-center justify-center gap-1.5">
                <TrendingUp size={12} className="text-sky-400" />
                <span className="font-mono text-[9px] font-medium tracking-wider text-sky-400 uppercase">
                  Reccomendation Overload
                </span>
              </div>
              <p className="font-mono text-xl font-bold text-slate-100">
                {activeProjection.targetLogData}
              </p>
              <p className="mt-1 font-mono text-[9px] text-slate-500 leading-tight">
                {activeProjection.reason}
              </p>
            </div>
          )}

          {/* Muscle Tags */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {selectedExercise.primary_targets.map((t) => (
              <span
                key={t.muscle_id}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-mono text-[10px] font-medium text-red-400"
              >
                {t.muscle_group}
              </span>
            ))}
            {selectedExercise.secondary_targets.map((t) => (
              <span
                key={t.muscle_id}
                className="rounded-full border border-sky-400/20 bg-sky-400/5 px-3 py-1 font-mono text-[10px] font-medium text-sky-400/70"
              >
                {t.muscle_group}
              </span>
            ))}
          </div>

          {/* Giant Log Input */}
          <div className="flex flex-col items-center gap-4">
            <p className="font-mono text-[10px] font-medium tracking-[0.2em] text-slate-600 uppercase">
              Weight × Sets × Reps
            </p>
            <input
              value={logInput}
              onChange={(e) => setLogInput(e.target.value)}
              placeholder={activeProjection ? activeProjection.targetLogData : "60x3x12"}
              autoFocus
              inputMode="numeric"
              className="w-full max-w-xs text-center rounded-xl border border-slate-800 bg-slate-950 px-4 py-5 font-mono text-4xl font-bold text-sky-400 placeholder-slate-700 outline-none transition-all focus:border-sky-400/50 focus:shadow-[0_0_20px_-4px_rgba(56,189,248,0.15)]"
            />

            {error && (
              <p className="font-mono text-xs text-red-400">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !logInput}
              className="flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-sky-400 py-3.5 font-mono text-sm font-semibold text-slate-950 transition-all hover:bg-sky-300 hover:shadow-lg hover:shadow-sky-400/20 disabled:opacity-50 active:scale-[0.98]"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              {submitting ? "Saving…" : "Log Exercise"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EXERCISE SELECTION 
  return (
    <div className="-mx-4 md:-mx-8 -my-6 flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      {/* 3D Mannequin */}
      <div className="relative h-[38vh] shrink-0 bg-[#020617]">
        <MannequinScene />

        {/* Back button overlay */}
        <Link
          href={`/dashboard/session?id=${sessionId}`}
          className="absolute top-4 left-4 flex items-center gap-1.5 rounded-lg bg-slate-950/70 px-3 py-1.5 text-sm text-slate-300 backdrop-blur-sm transition-colors hover:text-slate-100"
        >
          <ChevronLeft size={16} />
          Back
        </Link>
      </div>

      {/* Bottom Sheet */}
      <div className="relative -mt-5 flex flex-1 flex-col overflow-hidden rounded-t-3xl border-t border-slate-800/60 bg-[#0f172a] pt-5">
        <div className="px-5 shrink-0">
          {/* Handle bar */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-700" />

          {/* Title */}
          <h2 className="mb-4 text-center text-base font-semibold text-slate-100">
            Choose Exercise
          </h2>

          <div className="mb-4 h-px bg-slate-800" />

          {/* Muscle Group Filter Pills */}
          <div className="hide-scrollbar mb-4 flex gap-2 overflow-x-auto">
            {PILL_KEYS.map((pill) => (
              <button
                key={pill}
                onClick={() =>
                  handlePillSelect(activeFilter === pill ? null : pill)
                }
                className={`shrink-0 rounded-full px-5 py-2 font-mono text-xs font-medium transition-all ${
                  activeFilter === pill
                    ? "border border-sky-400/50 bg-sky-400/15 text-sky-400 shadow-[0_0_12px_-3px_rgba(56,189,248,0.2)]"
                    : "border border-slate-700 bg-slate-800/80 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                }`}
              >
                {pill}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 pb-24 sm:pb-8 hide-scrollbar">
          {loadingExercises ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-sky-400" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* Just in case there are somebody trying to playing around with inspect element */}
              {filteredExercises.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-600">
                  No exercises found for this filter.
                </p>
              )}
              
              {filteredExercises.map((ex) => (
                <button
                key={ex.exercise_id}
                onClick={() => handleSelectExercise(ex)}
                onMouseEnter={() => setHoveredExercise(ex)}
                onMouseLeave={() => {
                  // Restore pill highlighting instead of clearing
                  if (activeFilter && PILL_MESH_MAP[activeFilter]) {
                    setActiveMuscles(PILL_MESH_MAP[activeFilter]);
                  } else {
                    clearHover();
                  }
                }}
                className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-left transition-all hover:border-sky-400/20 hover:bg-slate-900 active:scale-[0.99]"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200 group-hover:text-slate-100">
                    {ex.name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {ex.primary_targets.map((t) => (
                      <span
                        key={t.muscle_id}
                        className="rounded-full border border-red-500/20 bg-red-500/5 px-2 py-0.5 font-mono text-[9px] text-red-400/80"
                      >
                        {t.muscle_group}
                      </span>
                    ))}
                    {ex.secondary_targets.slice(0, 2).map((t) => (
                      <span
                        key={t.muscle_id}
                        className="rounded-full border border-sky-400/15 bg-sky-400/5 px-2 py-0.5 font-mono text-[9px] text-sky-400/50"
                      >
                        {t.muscle_group}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-slate-700 transition-colors group-hover:text-sky-400">
                  <Plus size={18} />
                </div>
              </button>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default function NewLogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin text-sky-400" />
        </div>
      }
    >
      <NewLogContent />
    </Suspense>
  );
}
