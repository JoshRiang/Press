import api from "./authService";

export interface LogEntry {
  id: string;
  log_data: string;
  created_at: string;
  exercise_id: string;
  exercise_name: string;
}

export interface LogResponse {
  success: boolean;
  message: string;
  data: LogEntry;
}

export interface LogsListResponse {
  success: boolean;
  data: LogEntry[];
}

export const createLog = async (exerciseId: string, logData: string): Promise<LogEntry> => {
  const response = await api.post<LogResponse>("/logs", {
    exercise_id: exerciseId,
    log_data: logData,
  });
  return response.data.data;
};

export const getLogs = async (): Promise<LogEntry[]> => {
  const response = await api.get<LogsListResponse>("/logs");
  return response.data.data;
};

export const updateLog = async (id: string, exerciseId: string, logData: string): Promise<LogEntry> => {
  const response = await api.put<LogResponse>(`/logs/${id}`, {
    exercise_id: exerciseId,
    log_data: logData,
  });
  return response.data.data;
};

export const deleteLog = async (id: string): Promise<void> => {
  await api.delete(`/logs/${id}`);
};
