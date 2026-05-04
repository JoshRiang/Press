/**
 * Enhanced Progression Engine — Configurable progressive overload calculator.
 *
 * Computes per-exercise projections based on user-tunable parameters:
 *   - weightIncrement: kg to add when threshold is met
 *   - repThreshold: target reps before weight increases
 *   - overloadFactor: % volume increase target
 */

import { WorkoutSession, SessionLog } from "@/src/services/sessionService";
import { OverloadConfig, ExerciseProjection } from "@/src/store/useEngineStore";

// Helpers Function
export function parseLogData(logData: string): { weight: number; sets: number; reps: number } | null {
  // Parse the format WeightxSetsxReps (30x3x12, 32.5x3x12, 32,5x3x12) into an object
  const parts = logData.replace(/,/g, ".").split("x").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  return { weight: parts[0], sets: parts[1], reps: parts[2] };
}

export function formatLogData(weight: number, sets: number, reps: number): string {
  const roundedWeight = Math.round(weight * 2) / 2;
  const weightStr = roundedWeight % 1 === 0 ? roundedWeight.toString() : roundedWeight.toFixed(1);
  // Format back to WeightxSetsxReps string
  return `${weightStr}x${sets}x${reps}`;
}

// Per-Exercise Projection Calculator 
export function computeExerciseProjections(
  sessions: WorkoutSession[],
  config: OverloadConfig
): ExerciseProjection[] {
  // Collect all logs, grouped by exercise
  const exerciseMap = new Map<
    string,
    { exerciseName: string; logs: (SessionLog & { sessionDate: string })[] }
  >();

  for (const session of sessions) {
    for (const log of session.logs) {
      const key = log.exercise_id;
      // Initialize map entry if it doesn't exist
      if (!exerciseMap.has(key)) {
        exerciseMap.set(key, {
          exerciseName: log.exercise_name || "Unknown Exercise",
          logs: [],
        });
      }
      // Push log with session date for later sorting
      exerciseMap.get(key)!.logs.push({
        ...log,
        sessionDate: session.created_at,
      });
    }
  }

  const projections: ExerciseProjection[] = [];

  for (const [exerciseId, data] of exerciseMap.entries()) {
    // Sort logs by date (most recent first)
    const sortedLogs = data.logs.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const latestLog = sortedLogs[0];
    const parsed = parseLogData(latestLog.log_data);
    if (!parsed) continue;

    let targetWeight = parsed.weight;
    let targetSets = parsed.sets;
    let targetReps = parsed.reps;
    let reason = "";

    // Progressive overload logic:
    // If reps met or exceeded threshold, increase weight, reset reps
    if (parsed.reps >= config.repThreshold) {
      targetWeight = parsed.weight + config.weightIncrement;
      targetReps = Math.max(parsed.reps - 2, 8); // drop reps slightly on weight increase
      reason = `Reps ≥ ${config.repThreshold} → +${config.weightIncrement}kg, reset reps to ${targetReps}`;
    } else {
      // Otherwise, aim for more reps
      targetReps = Math.min(parsed.reps + 1, config.repThreshold);
      reason = `Aiming for ${targetReps} reps before weight increase at ${config.repThreshold} reps`;
    }

    projections.push({
      exerciseId,
      exerciseName: data.exerciseName,
      lastLogData: latestLog.log_data,
      lastLogDate: latestLog.created_at,
      targetLogData: formatLogData(targetWeight, targetSets, targetReps),
      reason,
    });
  }

  // Sort by most recently logged
  projections.sort(
    (a, b) => new Date(b.lastLogDate).getTime() - new Date(a.lastLogDate).getTime()
  );

  return projections;
}

// Muscle Fatigue Heatmap Calculator

export interface MuscleFatigueData {
  muscleId: string;
  meshName: string;
  muscleGroup: string;
  frequency: number; // times trained in last 7 days
  intensity: number; // 0.0 to 1.0 (green to red)
}

export function computeMuscleFatigue(
  sessions: WorkoutSession[],
  exercises: Array<{
    exercise_id: string;
    primary_targets: Array<{ muscle_id: string; mesh_name: string; muscle_group: string }>;
    secondary_targets: Array<{ muscle_id: string; mesh_name: string; muscle_group: string }>;
  }>
): MuscleFatigueData[] {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  // Filter sessions within last 7 days
  const recentSessions = sessions.filter(
    (s) => new Date(s.created_at).getTime() >= sevenDaysAgo
  );

  // Count exercise frequency in last 7 days
  const exerciseFrequency = new Map<string, number>();
  for (const session of recentSessions) {
    for (const log of session.logs) {
      const count = exerciseFrequency.get(log.exercise_id) || 0;
      exerciseFrequency.set(log.exercise_id, count + 1);
    }
  }

  // Build muscle → exercise map
  const exerciseMap = new Map(exercises.map((e) => [e.exercise_id, e]));

  // Aggregate muscle frequencies
  const muscleFrequency = new Map<
    string,
    { meshName: string; muscleGroup: string; frequency: number }
  >();

  for (const [exerciseId, count] of exerciseFrequency.entries()) {
    const exercise = exerciseMap.get(exerciseId);
    if (!exercise) continue;

    // Primary targets get full weight
    for (const target of exercise.primary_targets) {
      const existing = muscleFrequency.get(target.muscle_id) || {
        meshName: target.mesh_name,
        muscleGroup: target.muscle_group,
        frequency: 0,
      };
      existing.frequency += count;
      muscleFrequency.set(target.muscle_id, existing);
    }

    // Secondary targets get half weight
    for (const target of exercise.secondary_targets) {
      const existing = muscleFrequency.get(target.muscle_id) || {
        meshName: target.mesh_name,
        muscleGroup: target.muscle_group,
        frequency: 0,
      };
      existing.frequency += count * 0.5;
      muscleFrequency.set(target.muscle_id, existing);
    }
  }

  // Normalize to 0-1 intensity
  const maxFrequency = Math.max(
    ...Array.from(muscleFrequency.values()).map((v) => v.frequency),
    1
  );

  return Array.from(muscleFrequency.entries()).map(([muscleId, data]) => ({
    muscleId,
    meshName: data.meshName,
    muscleGroup: data.muscleGroup,
    frequency: Math.round(data.frequency),
    intensity: data.frequency / maxFrequency,
  }));
}
