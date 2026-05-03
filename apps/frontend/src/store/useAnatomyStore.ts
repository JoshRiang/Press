import { create } from 'zustand';
import { Exercise } from '@/src/services/exerciseService';

interface AnatomyState {
  activeMuscles: string[];
  secondaryMuscles: string[];
  hoveredExerciseId: string | null;
  successMuscles: string[];
  setHoveredExercise: (exercise: Exercise | null) => void;
  setActiveMuscles: (muscles: string[]) => void;
  clearHover: () => void;
  triggerSuccess: (exercise: Exercise) => void;
}

const getPrimaryMeshNames = (exercise: Exercise): string[] => {
  return exercise.primary_targets.map((t) => t.mesh_name);
};

const getSecondaryMeshNames = (exercise: Exercise): string[] => {
  return exercise.secondary_targets.map((t) => t.mesh_name);
};

const getAllMeshNames = (exercise: Exercise): string[] => {
  return [...getPrimaryMeshNames(exercise), ...getSecondaryMeshNames(exercise)];
};

export const useAnatomyStore = create<AnatomyState>((set, get) => ({
  activeMuscles: [],
  secondaryMuscles: [],
  hoveredExerciseId: null,
  successMuscles: [],
  setHoveredExercise: (exercise) =>
    set({
      hoveredExerciseId: exercise?.exercise_id ?? null,
      activeMuscles: exercise ? getPrimaryMeshNames(exercise) : [],
      secondaryMuscles: exercise ? getSecondaryMeshNames(exercise) : [],
    }),
  setActiveMuscles: (muscles) => set({ activeMuscles: muscles, secondaryMuscles: [] }),
  clearHover: () => set({ activeMuscles: [], secondaryMuscles: [], hoveredExerciseId: null }),
  triggerSuccess: (exercise) => {
    const meshNames = getAllMeshNames(exercise);
    set({ successMuscles: meshNames });
    setTimeout(() => {
      if (get().successMuscles === meshNames) {
        set({ successMuscles: [] });
      }
    }, 800);
  },
}));
