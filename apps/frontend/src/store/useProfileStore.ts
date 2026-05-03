import { create } from "zustand";
import { getStoredUser, User } from "@/src/services/authService";
import { getProfile, updateProfile as updateProfileApi, BodyMetrics } from "@/src/services/profileService";

interface ProfileState {
  user: User | null;
  metrics: BodyMetrics;
  dbStatus: "connected" | "disconnected" | "checking";

  // Actions
  loadUser: () => Promise<void>;
  updateMetrics: (metrics: Partial<BodyMetrics>) => Promise<void>;
  addWeightEntry: (weight: number) => Promise<void>;
  setDbStatus: (status: "connected" | "disconnected" | "checking") => void;
}

const DEFAULT_METRICS: BodyMetrics = {
  currentWeight: 60,
  targetWeight: 65,
  height: 170,
  unit: "kg",
  weightHistory: [],
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  metrics: DEFAULT_METRICS,
  dbStatus: "checking",

  loadUser: async () => {
    // First optimistic load from localStorage for user
    const localUser = getStoredUser();
    if (localUser) {
      set({ user: localUser });
    }

    // Only fetch from backend if we have a token
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      set({ dbStatus: "disconnected" });
      return;
    }

    try {
      const profile = await getProfile();
      set({ 
        user: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          created_at: profile.created_at
        },
        metrics: profile.metrics,
        dbStatus: "connected" 
      });
    } catch (error) {
      console.error("Failed to load profile from backend", error);
      set({ dbStatus: "disconnected" });
    }
  },

  updateMetrics: async (partial) => {
    const current = get().metrics;
    const updated = { ...current, ...partial };
    // Optimistic update
    set({ metrics: updated });

    try {
      const profile = await updateProfileApi(partial);
      set({ metrics: profile.metrics, dbStatus: "connected" });
    } catch (error) {
      console.error("Failed to update metrics", error);
      // Revert on failure
      set({ metrics: current, dbStatus: "disconnected" });
    }
  },

  addWeightEntry: async (weight) => {
    const current = get().metrics;
    const entry = {
      date: new Date().toISOString().split("T")[0],
      weight,
    };
    const newHistory = [...current.weightHistory, entry].slice(-30);
    const updated = {
      ...current,
      currentWeight: weight,
      weightHistory: newHistory,
    };
    
    // Optimistic update
    set({ metrics: updated });

    try {
      const profile = await updateProfileApi({
        currentWeight: weight,
        weightHistory: newHistory
      });
      set({ metrics: profile.metrics, dbStatus: "connected" });
    } catch (error) {
      console.error("Failed to add weight entry", error);
      set({ metrics: current, dbStatus: "disconnected" });
    }
  },

  setDbStatus: (status) => set({ dbStatus: status }),
}));
