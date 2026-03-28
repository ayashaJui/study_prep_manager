/**
 * API Service Layer - Ready for Backend Integration
 *
 * Replace the mock functions with actual API calls to your backend.
 * Base URL should be configured via environment variables.
 */

import { handleError } from "./errorHandler";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

// ============================================
// HTTP Client Utilities
// ============================================

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token from localStorage (only on client side)
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("auth_token");
  }

  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  // Add Authorization header if token exists
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      const error: any = new Error(errorData.message || "API request failed");
      error.statusCode = response.status;
      error.data = errorData;

      throw error;
    }

    return await response.json();
  } catch (error: any) {
    // Use global error handler
    const parsedError = handleError(
      error,
      `API ${options.method || "GET"} ${endpoint}`,
    );

    // Re-throw with parsed error info
    const enhancedError: any = new Error(parsedError.message);
    enhancedError.statusCode = parsedError.statusCode;
    enhancedError.code = parsedError.code;
    enhancedError.originalError = parsedError.originalError;

    throw enhancedError;
  }
}

// ============================================
// Topic APIs
// ============================================

export const topicAPI = {
  getAll: async (parentId?: string) => {
    const endpoint = parentId ? `/topics?parentId=${parentId}` : "/topics";
    return fetchAPI<any>(endpoint);
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/topics/${id}`);
  },

  create: async (data: any) => {
    return fetchAPI<any>("/topics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return fetchAPI<any>(`/topics/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchAPI<any>(`/topics/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================
// Subtopic APIs
// ============================================

export const subtopicAPI = {
  getAll: async (topicId: string) => {
    return fetchAPI<any>(`/topics/${topicId}/subtopics`);
  },

  getById: async (topicId: string, subtopicId: string) => {
    return fetchAPI<any>(`/topics/${topicId}/subtopics/${subtopicId}`);
  },

  create: async (topicId: string, data: any) => {
    return fetchAPI<any>(`/topics/${topicId}/subtopics`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (topicId: string, subtopicId: string, data: any) => {
    return fetchAPI<any>(`/topics/${topicId}/subtopics/${subtopicId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (topicId: string, subtopicId: string) => {
    return fetchAPI<any>(`/topics/${topicId}/subtopics/${subtopicId}`, {
      method: "DELETE",
    });
  },
};

// ============================================
// Notes APIs
// ============================================

export const notesAPI = {
  getAll: async (topicId: string) => {
    const response = await fetchAPI<any>(`/notes?topicId=${topicId}`);
    return response.data || response;
  },

  getById: async (id: string) => {
    const response = await fetchAPI<any>(`/notes/${id}`);
    return response.data || response;
  },

  create: async (data: any) => {
    const response = await fetchAPI<any>("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data || response;
  },

  update: async (id: string, data: any) => {
    const response = await fetchAPI<any>(`/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.data || response;
  },

  delete: async (id: string) => {
    const response = await fetchAPI<any>(`/notes/${id}`, {
      method: "DELETE",
    });
    return response.data || response;
  },
};

// ============================================
// Flashcards APIs
// ============================================

export const flashcardsAPI = {
  getAll: async (topicId: string) => {
    const response = await fetchAPI<any>(`/flashcards?topicId=${topicId}`);
    return response.data || response;
  },

  getById: async (id: string) => {
    const response = await fetchAPI<any>(`/flashcards/${id}`);
    return response.data || response;
  },

  create: async (data: any) => {
    const response = await fetchAPI<any>("/flashcards", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data || response;
  },

  update: async (id: string, data: any) => {
    const response = await fetchAPI<any>(`/flashcards/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.data || response;
  },

  delete: async (id: string) => {
    const response = await fetchAPI<any>(`/flashcards/${id}`, {
      method: "DELETE",
    });
    return response.data || response;
  },

  importFromFile: async (topicId: string, flashcards: any[]) => {
    const response = await fetchAPI<any>("/flashcards/import", {
      method: "POST",
      body: JSON.stringify({ topicId, flashcards }),
    });
    return response.data || response;
  },
};

// ============================================
// Quizzes APIs
// ============================================

export const quizzesAPI = {
  getAll: async (topicId: string) => {
    const response = await fetchAPI<any>(`/quizzes?topicId=${topicId}`);
    return response.data || response;
  },

  getById: async (id: string) => {
    const response = await fetchAPI<any>(`/quizzes/${id}`);
    return response.data || response;
  },

  create: async (data: any) => {
    const response = await fetchAPI<any>("/quizzes", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data || response;
  },

  update: async (id: string, data: any) => {
    const response = await fetchAPI<any>(`/quizzes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.data || response;
  },

  delete: async (id: string) => {
    const response = await fetchAPI<any>(`/quizzes/${id}`, {
      method: "DELETE",
    });
    return response.data || response;
  },

  submit: async (id: string, answers: any[]) => {
    return fetchAPI<any>(`/quizzes/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },

  importFromFile: async (topicId: string, quizzes: any[]) => {
    const response = await fetchAPI<any>("/quizzes/import", {
      method: "POST",
      body: JSON.stringify({ topicId, quizzes }),
    });
    return response.data || response;
  },
};

// ============================================
// Dashboard & Stats APIs
// ============================================

export const dashboardAPI = {
  getStats: async () => {
    return fetchAPI<any>("/dashboard/stats");
  },

  getRecentActivity: async (limit: number = 10) => {
    return fetchAPI<any>(`/dashboard/activity?limit=${limit}`);
  },

  getTopicProgress: async () => {
    return fetchAPI<any>("/dashboard/progress");
  },

  getWeeklyGoals: async () => {
    return fetchAPI<any>("/dashboard/goals");
  },
};

// ============================================
// Study Sessions APIs
// ============================================

export const studySessionsAPI = {
  create: async (data: any) => {
    return fetchAPI<any>("/study-sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getHistory: async (params?: { limit?: number; page?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchAPI<any>(`/study-sessions${query ? `?${query}` : ""}`);
  },

  getStreak: async () => {
    return fetchAPI<any>("/study-sessions/streak");
  },
};

// ============================================
// Search API
// ============================================

export const searchAPI = {
  global: async (query: string) => {
    return fetchAPI<any>(`/search?q=${encodeURIComponent(query)}`);
  },

  topics: async (query: string) => {
    return fetchAPI<any>(`/search/topics?q=${encodeURIComponent(query)}`);
  },
};

// ============================================
// Authentication APIs
// ============================================

export const authAPI = {
  login: async (email: string, password: string) => {
    return fetchAPI<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    return fetchAPI<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
  },

  logout: async () => {
    return fetchAPI<any>("/auth/logout", {
      method: "POST",
    });
  },

  getMe: async () => {
    return fetchAPI<any>("/auth/me");
  },
};
