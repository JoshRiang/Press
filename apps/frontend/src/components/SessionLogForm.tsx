"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Exercise } from "@/src/services/exerciseService";
import { useSessionStore } from "@/src/store/useSessionStore";

// Strict regex: WeightxSetsxReps (supports decimals, e.g. 32.5x3x12)
const LOG_DATA_REGEX = /^\d+([.,]\d+)?x\d+([.,]\d+)?x\d+([.,]\d+)?$/;

interface SessionLogFormProps {
  sessionId: string;
  exercises: Exercise[];
}

export default function SessionLogForm({
  sessionId,
  exercises,
}: SessionLogFormProps) {
  const addLog = useSessionStore((s) => s.addLog);

  const [exerciseId, setExerciseId] = useState("");
  const [logData, setLogData] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation for exercise selection 
    if (!exerciseId) {
      setError("Select an exercise");
      return;
    }

    // Validation for log data format 
    if (!LOG_DATA_REGEX.test(logData)) {
      setError("Format must be WeightxSetsxReps (e.g., 30x3x12 or 32.5x3x12)");
      return;
    }

    setLoading(true);
    try {
      await addLog(sessionId, exerciseId, logData);
      // Clear input fields after successful submission
      setLogData("");
    } catch {
      // Unexpected error 
      setError("Failed to save log");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-3 sm:flex-row sm:items-end"
    >
      {/* Exercise Picker */}
      <div className="flex-1">
        <label
          htmlFor={`exercise-${sessionId}`}
          className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-600"
        >
          Exercise
        </label>
        <select
          id={`exercise-${sessionId}`}
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 outline-none transition-colors focus:border-sky-400"
        >
          <option value="">Select exercise…</option>
          {exercises.map((ex) => (
            <option key={ex.exercise_id} value={ex.exercise_id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      {/* Log Data Input */}
      <div className="w-full sm:w-36">
        <label
          htmlFor={`logdata-${sessionId}`}
          className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-slate-600"
        >
          W×S×R
        </label>
        <input
          id={`logdata-${sessionId}`}
          value={logData}
          onChange={(e) => setLogData(e.target.value)}
          placeholder="30x3x12"
          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none transition-colors focus:border-sky-400"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-sky-400 px-4 py-2 font-mono text-xs font-semibold text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Plus size={14} />
        {loading ? "Adding…" : "Add"}
      </button>

      {error && (
        <p className="col-span-full text-xs text-red-400 sm:col-span-1">
          {error}
        </p>
      )}
    </form>
  );
}
