import api from './authService';

export interface BodyMetrics {
  currentWeight: number;
  targetWeight: number;
  height: number;
  unit: "kg" | "lbs";
  weightHistory: { date: string; weight: number }[];
}

export interface UserSettings {
  weightIncrement: number;
  repThreshold: number;
  volumeOverload: number;
}

export interface ProfileResponse {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  metrics: BodyMetrics;
  settings: UserSettings;
}

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>('/profile');
  return response.data;
};

export const updateProfile = async (data: { metrics?: Partial<BodyMetrics>, settings?: Partial<UserSettings> }): Promise<ProfileResponse> => {
  const response = await api.put<ProfileResponse>('/profile', data);
  return response.data;
};
