/**
 * exerciseService.ts
 *
 * Serves static exercise & muscle data directly from the shared
 * @press/data package — no network requests, no database.
 *
 * The raw JSON stores muscle references as plain string IDs.
 * This module enriches them into full MuscleTarget objects so the
 * rest of the app (anatomy store, exercise cards, etc.) keeps working
 * without any changes.
 */

import rawExercises from '@press/data/exercise.json';
import rawMuscles from '@press/data/muscle.json';

// Types Safety
export interface MuscleTarget {
  muscle_id: string;
  mesh_name: string;
  muscle_group: string;
}

export interface Exercise {
  exercise_id: string;
  name: string;
  primary_targets: MuscleTarget[];
  secondary_targets: MuscleTarget[];
}

// Muscle mapping
const muscleMap = new Map<string, MuscleTarget>(
  rawMuscles.map((m) => [
    m.id,
    { muscle_id: m.id, mesh_name: m.mesh_name, muscle_group: m.muscle_group },
  ])
);

function resolveMuscles(ids: string[]): MuscleTarget[] {
  return ids
    .map((id) => muscleMap.get(id))
    .filter((m): m is MuscleTarget => m !== undefined);
}

const exercises: Exercise[] = rawExercises.map((ex) => ({
  exercise_id: ex.exercise_id,
  name: ex.name,
  primary_targets: resolveMuscles(ex.primary_targets),
  secondary_targets: resolveMuscles(ex.secondary_targets),
}));

// Public API 

// Returns the full list of exercises. Resolves instantly (no I/O). Noting connected to the network, because this is static data imported at build time.
export const getExercises = async (): Promise<Exercise[]> => exercises;

// Returns a single exercise by ID, or null if not found. 
export const getExerciseById = (id: string): Exercise | null =>
  exercises.find((ex) => ex.exercise_id === id) ?? null;

// Returns the full muscle list as MuscleTarget objects. 
export const getMuscles = (): MuscleTarget[] => Array.from(muscleMap.values());

export default exercises;
