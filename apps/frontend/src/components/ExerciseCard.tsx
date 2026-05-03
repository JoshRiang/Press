'use client';

import { useState } from 'react';
import { Exercise } from '@/src/services/exerciseService';
import { createLog } from '@/src/services/logService';
import { useAnatomyStore } from '@/src/store/useAnatomyStore';

interface ExerciseCardProps {
  exercise: Exercise;
  isAuthenticated: boolean;
}

export default function ExerciseCard({ exercise, isAuthenticated }: ExerciseCardProps) {
  const setHoveredExercise = useAnatomyStore((s) => s.setHoveredExercise);
  const clearHover = useAnatomyStore((s) => s.clearHover);
  const triggerSuccess = useAnatomyStore((s) => s.triggerSuccess);

  const [logValue, setLogValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Regex validation for "WeightxSetsxReps"
    if (!/^\d+x\d+x\d+$/.test(logValue)) {
      setError('Use format WeightxSetsxReps (e.g., 30x3x12)');
      return;
    }

    setLoading(true);
    try {
      await createLog(exercise.exercise_id, logValue);
      triggerSuccess(exercise);
      // Clear input after successful log
      setLogValue('');
    } catch {
      setError('Failed to save log.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-sky-400/40 hover:bg-slate-800/60"
      onMouseEnter={() => setHoveredExercise(exercise)}
      onMouseLeave={() => clearHover()}
    >
      <h3 className="text-base font-medium text-slate-100">{exercise.name}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {exercise.primary_targets.map((t) => (
          <span
            key={t.muscle_id}
            className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-xs text-red-400"
          >
            {t.muscle_group}
          </span>
        ))}
        {exercise.secondary_targets.map((t) => (
          <span
            key={t.muscle_id}
            className="inline-flex items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-2 py-0.5 font-mono text-xs text-sky-400"
          >
            {t.muscle_group}
          </span>
        ))}
      </div>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
          <input
            value={logValue}
            onChange={(e) => setLogValue(e.target.value)}
            placeholder="30x3x12"
            className="w-32 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 font-mono text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-sky-400 px-2.5 py-1 font-mono text-xs font-medium text-slate-950 transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            Log
          </button>
        </form>
      )}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
