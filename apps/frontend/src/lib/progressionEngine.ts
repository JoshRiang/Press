/**
 * Progression Engine
 *
 * Analyses historical workout session data to compute:
 *   1. Volume Delta (Δ) between recent sessions
 *   2. Recommended target exercise + load (progressive overload)
 *   3. Volume trend sparkline data
 *   4. Muscle group focus prediction
 */

import { WorkoutSession } from "@/src/services/sessionService";

// Types

export interface ProgressionInsight {
  /** Δ% volume change between last two sessions */
  volumeDelta: number | null;
  /** Absolute volume change */
  volumeDeltaAbs: number;
  /** Whether user is progressing (positive delta) */
  isProgressing: boolean;
  /** Target volume for next session (+5% default) */
  targetVolume: number;
  /** Muscle group recommendation for today */
  targetMuscleGroup: string | null;
  /** Next exercise suggestion with name + target log_data */
  nextUp: {
    exerciseName: string;
    exerciseId: string;
    targetLogData: string; // e.g. "42.5x3x12"
    reason: string;
  } | null;
  /** Volume trend data for sparkline (last N sessions) */
  volumeTrend: number[];
  /** Per-session labels */
  trendLabels: string[];
}

// Helpers 

function parseLogData(logData: string): { weight: number; sets: number; reps: number } | null {
  const parts = logData.replace(/,/g, ".").split("x").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return { weight: parts[0], sets: parts[1], reps: parts[2] };
}

function formatLogData(weight: number, sets: number, reps: number): string {
  // Round weight to nearest 0.5
  const roundedWeight = Math.round(weight * 2) / 2;
  // Use clean number if possible
  const weightStr = roundedWeight % 1 === 0 ? roundedWeight.toString() : roundedWeight.toFixed(1);
  return `${weightStr}x${sets}x${reps}`;
}

// Engine

const OVERLOAD_FACTOR = 1.05; // +5% progressive overload

export function computeProgression(sessions: WorkoutSession[]): ProgressionInsight {
  // Default result
  const defaultInsight: ProgressionInsight = {
    volumeDelta: null,
    volumeDeltaAbs: 0,
    isProgressing: false,
    targetVolume: 0,
    targetMuscleGroup: null,
    nextUp: null,
    volumeTrend: [],
    trendLabels: [],
  };

  if (sessions.length === 0) return defaultInsight;

  // Volume Trend 
  const chronological = [...sessions].reverse(); // oldest first
  const volumeTrend = chronological.map((s) => s.total_volume);
  const trendLabels = chronological.map((s) =>
    new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );

  // Volume Delta 
  let volumeDelta: number | null = null;
  let volumeDeltaAbs = 0;
  let isProgressing = false;

  if (sessions.length >= 2) {
    const latest = sessions[0].total_volume;
    const previous = sessions[1].total_volume;
    if (previous > 0) {
      volumeDelta = ((latest - previous) / previous) * 100;
      volumeDeltaAbs = latest - previous;
      isProgressing = volumeDelta > 0;
    }
  }

  // Target Volume 
  const lastVolume = sessions[0].total_volume;
  const targetVolume = Math.round(lastVolume * OVERLOAD_FACTOR);

  // Find most recent exercise and compute next target 
  let nextUp: ProgressionInsight["nextUp"] = null;
  const allLogs = sessions.flatMap((s) => s.logs);

  if (allLogs.length > 0) {
    // Find the most recent log entry
    const mostRecent = allLogs[allLogs.length - 1];
    const parsed = parseLogData(mostRecent.log_data);

    if (parsed) {
      // Apply progressive overload: +2.5kg weight increase
      const newWeight = parsed.weight + 2.5;
      const targetLogData = formatLogData(newWeight, parsed.sets, parsed.reps);

      nextUp = {
        exerciseName: mostRecent.exercise_name || "Exercise",
        exerciseId: mostRecent.exercise_id,
        targetLogData,
        reason: `+2.5kg from your last ${mostRecent.exercise_name} (${mostRecent.log_data})`,
      };
    }
  }

  // Muscle Group Prediction 
  // Simple rotation: suggest a muscle group the user hasn't worked recently
  const recentMuscleGroups = sessions
    .slice(0, 3)
    .map((s) => s.title.toLowerCase());

  const commonGroups = ["Chest & Triceps", "Back & Biceps", "Legs & Shoulders"]; 
  const targetMuscleGroup =
    commonGroups.find(
      (g) => !recentMuscleGroups.some((r) => r.includes(g.split(" ")[0].toLowerCase()))
    ) || commonGroups[0];

  return {
    volumeDelta,
    volumeDeltaAbs,
    isProgressing,
    targetVolume,
    targetMuscleGroup,
    nextUp,
    volumeTrend,
    trendLabels,
  };
}
