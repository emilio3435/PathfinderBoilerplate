import { apiRequest } from "./queryClient";

export interface OnboardingRequest {
  goal: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface ChatRequest {
  message: string;
  userId: string;
  pathId?: string;
  lessonId?: string;
  context?: any;
}

// Auth & Users
export const createUser = async (userData: any) => {
  const response = await apiRequest("POST", "/api/users", userData);
  return response.json();
};

export const getUserByEmail = async (email: string) => {
  const response = await apiRequest("GET", `/api/users/email/${email}`);
  return response.json();
};

// Onboarding
export const processOnboardingGoal = async (data: OnboardingRequest) => {
  const response = await apiRequest("POST", "/api/onboarding/process", data);
  return response.json();
};

// Learning Paths
export const createLearningPath = async (pathData: any) => {
  const response = await apiRequest("POST", "/api/learning-paths", pathData);
  return response.json();
};

// Chat
export const sendChatMessage = async (data: ChatRequest) => {
  const response = await apiRequest("POST", "/api/chat", data);
  return response.json();
};

// Projects
export const createProject = async (projectData: any) => {
  const response = await apiRequest("POST", "/api/projects", projectData);
  return response.json();
};

// Update lesson completion
export const updateLessonProgress = async (lessonId: string, isCompleted: boolean) => {
  const response = await apiRequest("PATCH", `/api/lessons/${lessonId}`, {
    isCompleted
  });
  return response.json();
};

// Update module progress
export const updateModuleProgress = async (moduleId: string, updates: any) => {
  const response = await apiRequest("PATCH", `/api/modules/${moduleId}`, updates);
  return response.json();
};
