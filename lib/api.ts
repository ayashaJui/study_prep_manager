/**
 * API Service Layer - Ready for Backend Integration
 *
 * Replace the mock functions with actual API calls to your backend.
 * Base URL should be configured via environment variables.
 */

import { handleError } from "./errorHandler";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface ApiClientError extends Error {
  statusCode?: number;
  code?: string;
  data?: unknown;
  originalError?: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiTopicStats {
  notesCount: number;
  flashcardsCount: number;
  quizzesCount: number;
  completionPercentage: number;
}

export interface ApiTopic {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  level: number;
  status: "not-started" | "in-progress" | "review" | "mastered";
  tags: string[];
  favorite: boolean;
  isPublic?: boolean;
  shareId?: string | null;
  stats?: ApiTopicStats;
  createdAt: string;
  updatedAt: string;
}

export interface TopicCreateInput {
  name: string;
  description?: string;
  parentId?: string;
  level?: number;
  status?: ApiTopic["status"];
  tags?: string[];
  favorite?: boolean;
}

export interface ApiNote {
  _id: string;
  topicId: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteCreateInput {
  topicId: string;
  content: string;
  tags?: string[];
  pinned?: boolean;
}

export interface ApiFlashcard {
  _id: string;
  topicId: string;
  front: string;
  back: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  status?: "new" | "learning" | "review" | "mastered";
  confidence?: "easy" | "medium" | "hard";
  lastReviewed?: string;
  nextReview?: string;
  easeFactor?: number;
  intervalDays?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardCreateInput {
  topicId: string;
  front: string;
  back: string;
  difficulty?: ApiFlashcard["difficulty"];
  tags?: string[];
}

export interface FlashcardImportInput {
  front: string;
  back: string;
  difficulty?: ApiFlashcard["difficulty"];
  tags?: string[];
}

export interface ApiQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | number[];
  explanation?: string;
  points?: number;
  tags?: string[];
}

export interface ApiQuiz {
  _id: string;
  topicId: string;
  title: string;
  description?: string;
  source?: string;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple-choice" | "true-false" | "mixed";
  timeLimit?: number;
  tags: string[];
  questions: ApiQuizQuestion[];
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showAnswersImmediately?: boolean;
  lastScore?: string | null;
  lastAttemptDate?: string | null;
  attemptsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizCreateInput {
  topicId?: string;
  title: string;
  description?: string;
  source?: string;
  difficulty?: ApiQuiz["difficulty"];
  type?: ApiQuiz["type"];
  timeLimit?: number;
  tags?: string[];
  questions: ApiQuizQuestion[];
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showAnswersImmediately?: boolean;
}

export interface QuizImportInput {
  title: string;
  description?: string;
  difficulty?: ApiQuiz["difficulty"];
  type?: ApiQuiz["type"];
  tags?: string[];
  questions: ApiQuizQuestion[];
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showAnswersImmediately?: boolean;
}

// ============================================
// HTTP Client Utilities
// ============================================

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };
  // No client-side token; rely on HttpOnly cookie sent via `credentials: include`.

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      if (response.status === 401 && typeof window !== "undefined") {
        const currentPath = `${window.location.pathname}${window.location.search}`;
        const loginUrl =
          currentPath === "/"
            ? "/auth/login"
            : `/auth/login?redirectTo=${encodeURIComponent(currentPath)}`;

        if (window.location.pathname !== "/auth/login") {
          window.location.assign(loginUrl);
        }
      }

      const error: ApiClientError = new Error(
        errorData.message || "API request failed",
      );
      error.statusCode = response.status;
      error.data = errorData;

      throw error;
    }

    return await response.json();
  } catch (error) {
    // Use global error handler
    const parsedError = handleError(
      error,
      `API ${options.method || "GET"} ${endpoint}`,
    );

    // Re-throw with parsed error info
    const enhancedError: ApiClientError = new Error(parsedError.message);
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
    return fetchAPI<ApiResponse<ApiTopic[]>>(endpoint);
  },

  getById: async (id: string) => {
    return fetchAPI<ApiResponse<ApiTopic>>(`/topics/${id}`);
  },

  create: async (data: TopicCreateInput) => {
    return fetchAPI<ApiResponse<ApiTopic>>("/topics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<TopicCreateInput>) => {
    return fetchAPI<ApiResponse<ApiTopic>>(`/topics/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  publish: async (id: string) => {
    return fetchAPI<ApiResponse<{ shareId: string; publicUrl: string }>>(
      `/topics/${id}/share`,
      {
        method: "POST",
      },
    );
  },

  unpublish: async (id: string) => {
    return fetchAPI<ApiResponse<null>>(`/topics/${id}/share`, {
      method: "DELETE",
    });
  },

  delete: async (id: string) => {
    return fetchAPI<ApiResponse<null>>(`/topics/${id}`, {
      method: "DELETE",
    });
  },
};

// ============================================
// Subtopic APIs
// ============================================

export const subtopicAPI = {
  getAll: async (topicId: string) => {
    return fetchAPI<ApiResponse<ApiTopic[]>>(`/topics/${topicId}/subtopics`);
  },

  getById: async (topicId: string, subtopicId: string) => {
    return fetchAPI<ApiResponse<ApiTopic>>(
      `/topics/${topicId}/subtopics/${subtopicId}`,
    );
  },

  create: async (topicId: string, data: TopicCreateInput) => {
    return fetchAPI<ApiResponse<ApiTopic>>(`/topics/${topicId}/subtopics`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    topicId: string,
    subtopicId: string,
    data: Partial<TopicCreateInput>,
  ) => {
    return fetchAPI<ApiResponse<ApiTopic>>(
      `/topics/${topicId}/subtopics/${subtopicId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  delete: async (topicId: string, subtopicId: string) => {
    return fetchAPI<ApiResponse<null>>(
      `/topics/${topicId}/subtopics/${subtopicId}`,
      {
        method: "DELETE",
      },
    );
  },
};

// ============================================
// Notes APIs
// ============================================

export const notesAPI = {
  getAll: async (topicId: string) => {
    const response = await fetchAPI<ApiResponse<ApiNote[]>>(
      `/notes?topicId=${topicId}`,
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await fetchAPI<ApiResponse<ApiNote>>(`/notes/${id}`);
    return response.data;
  },

  create: async (data: NoteCreateInput) => {
    const response = await fetchAPI<ApiResponse<ApiNote>>("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: Partial<NoteCreateInput>) => {
    const response = await fetchAPI<ApiResponse<ApiNote>>(`/notes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await fetchAPI<ApiResponse<null>>(`/notes/${id}`, {
      method: "DELETE",
    });
    return response.data;
  },
};

// ============================================
// Upload API
// ============================================

export const uploadAPI = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to upload image");
    }

    return result.data.url as string;
  },
};

// ============================================
// Flashcards APIs
// ============================================

export const flashcardsAPI = {
  getAll: async (topicId: string) => {
    const response = await fetchAPI<ApiResponse<ApiFlashcard[]>>(
      `/flashcards?topicId=${topicId}`,
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await fetchAPI<ApiResponse<ApiFlashcard>>(
      `/flashcards/${id}`,
    );
    return response.data;
  },

  create: async (data: FlashcardCreateInput) => {
    const response = await fetchAPI<ApiResponse<ApiFlashcard>>(
      "/flashcards",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    return response.data;
  },

  update: async (id: string, data: Partial<FlashcardCreateInput>) => {
    const response = await fetchAPI<ApiResponse<ApiFlashcard>>(
      `/flashcards/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    return response.data;
  },

  review: async (id: string, quality: number, duration?: number) => {
    const response = await fetchAPI<ApiResponse<ApiFlashcard>>(
      `/flashcards/${id}/review`,
      {
        method: "POST",
        body: JSON.stringify({ quality, duration }),
      },
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await fetchAPI<ApiResponse<null>>(`/flashcards/${id}`, {
      method: "DELETE",
    });
    return response.data;
  },

  importFromFile: async (
    topicId: string,
    flashcards: FlashcardImportInput[],
  ) => {
    const response = await fetchAPI<ApiResponse<ApiFlashcard[]>>(
      "/flashcards/import",
      {
        method: "POST",
        body: JSON.stringify({ topicId, flashcards }),
      },
    );
    return response.data;
  },
};

// ============================================
// Quizzes APIs
// ============================================

export const quizzesAPI = {
  getAll: async (topicId: string) => {
    const response = await fetchAPI<ApiResponse<ApiQuiz[]>>(
      `/quizzes?topicId=${topicId}`,
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await fetchAPI<ApiResponse<ApiQuiz>>(`/quizzes/${id}`);
    return response.data;
  },

  create: async (data: QuizCreateInput) => {
    const response = await fetchAPI<ApiResponse<ApiQuiz>>("/quizzes", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  update: async (id: string, data: Partial<QuizCreateInput>) => {
    const response = await fetchAPI<ApiResponse<ApiQuiz>>(`/quizzes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await fetchAPI<ApiResponse<null>>(`/quizzes/${id}`, {
      method: "DELETE",
    });
    return response.data;
  },
  submit: async (
    id: string,
    answers: Array<{ questionId: string; selectedAnswer: number }>,
  ) => {
    return fetchAPI<ApiResponse<{ score: number; totalPoints: number }>>(
      `/quizzes/${id}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ answers }),
      },
    );
  },

  importFromFile: async (topicId: string, quizzes: QuizImportInput[]) => {
    const response = await fetchAPI<ApiResponse<ApiQuiz[]>>(
      "/quizzes/import",
      {
        method: "POST",
        body: JSON.stringify({ topicId, quizzes }),
      },
    );
    return response.data;
  },
};

// ============================================
// Search API
// ============================================

export interface SearchResultItem {
  _id: string;
  topicId?: string;
  slug?: string;
  name?: string;
  title?: string;
  content?: string;
  front?: string;
}

export interface SearchResults {
  topics?: SearchResultItem[];
  notes?: SearchResultItem[];
  flashcards?: SearchResultItem[];
  quizzes?: SearchResultItem[];
}

export const searchAPI = {
  search: async (query: string, limit?: number) => {
    const params = new URLSearchParams({ query });
    if (limit) params.set("limit", limit.toString());
    return fetchAPI<ApiResponse<SearchResults>>(
      `/search?${params.toString()}`,
    );
  },
};

// ============================================
// Dashboard & Stats APIs
// ============================================

export interface DashboardStats {
  totalTopics: number;
  totalFlashcards: number;
  totalQuizzes: number;
  averageScore: number;
  studyStreak: number;
  weeklyStats: {
    flashcardsReviewed: number;
    quizzesTaken: number;
    notesCreated: number;
    studyTime: number;
  };
}

export interface DashboardActivity {
  id: string;
  action: string;
  topic: string;
  time: string;
  score?: string;
}

export interface DashboardTopicProgress {
  name: string;
  progress: number;
  status: string;
  id: string;
}

export type WeeklyGoalMetric = "flashcards" | "quizzes" | "topics" | "notes";

export interface DashboardGoal {
  metric: WeeklyGoalMetric;
  goal: string;
  current: number;
  total: number;
}

export interface WeeklyGoalInput {
  metric: WeeklyGoalMetric;
  label: string;
  target: number;
}

export const dashboardAPI = {
  getStats: async () => {
    return fetchAPI<ApiResponse<DashboardStats>>("/dashboard/stats");
  },

  getRecentActivity: async (limit: number = 10) => {
    return fetchAPI<ApiResponse<DashboardActivity[]>>(
      `/dashboard/activity?limit=${limit}`,
    );
  },

  getTopicProgress: async () => {
    return fetchAPI<ApiResponse<DashboardTopicProgress[]>>(
      "/dashboard/progress",
    );
  },

  getWeeklyGoals: async () => {
    return fetchAPI<ApiResponse<DashboardGoal[]>>("/dashboard/goals");
  },

  updateWeeklyGoals: async (goals: WeeklyGoalInput[]) => {
    return fetchAPI<ApiResponse<WeeklyGoalInput[]>>("/dashboard/goals", {
      method: "PUT",
      body: JSON.stringify({ goals }),
    });
  },
};

// ============================================
// Study Sessions APIs
// ============================================

export interface StudySessionCreateInput {
  topicId?: string;
  activityType: "flashcard" | "quiz" | "note" | "review";
  duration: number;
  score?: number;
}

export interface ApiStudySession {
  _id: string;
  userId: string;
  topicId?: string | null;
  activityType: "flashcard" | "quiz" | "note" | "review";
  duration: number;
  score?: number;
  createdAt: string;
}

export const studySessionsAPI = {
  create: async (data: StudySessionCreateInput) => {
    return fetchAPI<ApiResponse<ApiStudySession>>("/study-sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getHistory: async (params?: { limit?: number; page?: number }) => {
    const query = new URLSearchParams(
      params
        ? Object.fromEntries(
            Object.entries(params).map(([key, value]) => [
              key,
              String(value),
            ]),
          )
        : undefined,
    ).toString();
    return fetchAPI<ApiResponse<ApiStudySession[]>>(
      `/study-sessions${query ? `?${query}` : ""}`,
    );
  },

  getStreak: async () => {
    return fetchAPI<ApiResponse<{ streak: number; lastStudyDate: string | null }>>(
      "/study-sessions/streak",
    );
  },
};

// ============================================
// Authentication APIs
// ============================================

export interface ApiAuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: string;
}

export const authAPI = {
  login: async (email: string, password: string) => {
    return fetchAPI<ApiResponse<{ user: ApiAuthUser; token: string }>>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );
  },

  register: async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => {
    return fetchAPI<ApiResponse<{ user: ApiAuthUser; token: string }>>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ name, email, password, confirmPassword }),
      },
    );
  },

  logout: async () => {
    return fetchAPI<ApiResponse<null>>("/auth/logout", {
      method: "POST",
    });
  },

  getMe: async () => {
    return fetchAPI<ApiResponse<{ user: ApiAuthUser }>>("/auth/me");
  },
};
