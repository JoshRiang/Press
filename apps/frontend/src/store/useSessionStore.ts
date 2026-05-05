import { create } from "zustand";
import {
  WorkoutSession,
  SessionLog,
  getSessions,
  createSession as apiCreateSession,
  addLogToSession as apiAddLog,
  deleteSession as apiDeleteSession,
} from "@/src/services/sessionService";

interface SessionState {
  sessions: WorkoutSession[];
  activeSessionId: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchSessions: () => Promise<void>;
  startSession: (title: string) => Promise<void>;
  addLog: (sessionId: string, exerciseId: string, logData: string, exerciseName: string) => Promise<void>;
  removeSession: (sessionId: string) => Promise<void>;
  setActiveSession: (id: string | null) => void;
}

//  Parse "30x3x12" or "32.5x3x12" → weight * sets * reps
function parseVolume(logData: string): number {
  const parts = logData.replace(/,/g, ".").split("x").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return 0;
  return parts[0] * parts[1] * parts[2];
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  loading: false,
  error: null,

  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await getSessions();
      set({ sessions, loading: false });
    } catch {
      set({ error: "Failed to load sessions", loading: false });
    }
  },

  startSession: async (title: string) => {
    set({ error: null });
    try {
      const session = await apiCreateSession(title);
      // API returns a session without logs array; normalize it
      const normalized: WorkoutSession = {
        ...session,
        logs: session.logs ?? [],
        total_volume: session.total_volume ?? 0,
      };
      set((state) => ({
        sessions: [normalized, ...state.sessions],
        activeSessionId: normalized.id,
      }));
    } catch {
      set({ error: "Failed to create session" });
    }
  },

  addLog: async (sessionId, exerciseId, logData, exerciseName) => {
    set({ error: null });
    try {
      const log: SessionLog = await apiAddLog(sessionId, exerciseId, logData);
      log.exercise_name = exerciseName; // Populate the name locally since the backend doesn't return it
      
      set((state) => ({
        sessions: state.sessions.map((s) => {
          if (s.id !== sessionId) return s;
          const updatedLogs = [...s.logs, log];
          const updatedVolume = s.total_volume + parseVolume(logData);
          return { ...s, logs: updatedLogs, total_volume: updatedVolume };
        }),
      }));
    } catch {
      set({ error: "Failed to add log" });
    }
  },

  removeSession: async (sessionId) => {
    set({ error: null });
    try {
      await apiDeleteSession(sessionId);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== sessionId),
        activeSessionId:
          state.activeSessionId === sessionId ? null : state.activeSessionId,
      }));
    } catch {
      set({ error: "Failed to delete session" });
    }
  },

  setActiveSession: (id) => set({ activeSessionId: id }),
}));
