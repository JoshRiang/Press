import { create } from "zustand";

export interface OverloadConfig {
  weightIncrement: number; // kg step (default 2.5)
  repThreshold: number; // reps before weight increase (default 12)
  overloadFactor: number; // % volume increase target (default 5)
}

export interface ExerciseProjection {
  exerciseId: string;
  exerciseName: string;
  lastLogData: string; // e.g., "40x3x12"
  lastLogDate: string;
  targetLogData: string; // machine-calculated next target
  reason: string;
}

interface EngineState {
  config: OverloadConfig;
  projections: ExerciseProjection[];

  // Actions
  loadConfig: () => void;
  updateConfig: (partial: Partial<OverloadConfig>) => void;
  resetConfig: () => void;
}

const DEFAULT_CONFIG: OverloadConfig = {
  weightIncrement: 2.5,
  repThreshold: 12,
  overloadFactor: 5,
};

function loadConfigFromStorage(): OverloadConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem("press_overload_config");
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_CONFIG;
}

function saveConfigToStorage(config: OverloadConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem("press_overload_config", JSON.stringify(config));
}

export const useEngineStore = create<EngineState>((set, get) => ({
  config: DEFAULT_CONFIG,
  projections: [],

  loadConfig: () => {
    const config = loadConfigFromStorage();
    set({ config });
  },

  updateConfig: (partial) => {
    const current = get().config;
    const updated = { ...current, ...partial };
    saveConfigToStorage(updated);
    set({ config: updated });
  },

  resetConfig: () => {
    saveConfigToStorage(DEFAULT_CONFIG);
    set({ config: DEFAULT_CONFIG });
  },
}));
