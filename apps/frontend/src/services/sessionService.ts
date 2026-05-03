import api from "./authService";

// Types Safety 
export interface SessionLog {
  id: string;
  session_id: string;
  exercise_id: string;
  exercise_name: string;
  log_data: string;
  created_at: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  logs: SessionLog[];
  total_volume: number;
}

interface SessionResponse {
  success: boolean;
  message: string;
  data: WorkoutSession;
}

interface SessionsListResponse {
  success: boolean;
  data: WorkoutSession[];
}

interface SessionLogResponse {
  success: boolean;
  message: string;
  data: SessionLog;
}

// API Calls 

export const createSession = async (title: string): Promise<WorkoutSession> => {
  const response = await api.post<SessionResponse>("/sessions", { title });
  return response.data.data;
};

export const getSessions = async (): Promise<WorkoutSession[]> => {
  const response = await api.get<SessionsListResponse>("/sessions");
  return response.data.data;
};

export const addLogToSession = async (
  sessionId: string,
  exerciseId: string,
  logData: string
): Promise<SessionLog> => {
  const response = await api.post<SessionLogResponse>(
    `/sessions/${sessionId}/logs`,
    {
      exercise_id: exerciseId,
      log_data: logData,
    }
  );
  return response.data.data;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/sessions/${sessionId}`);
};
