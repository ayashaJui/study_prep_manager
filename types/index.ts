// ============================================
// Core Entity Types
// ============================================

export interface Topic {
  id: string;
  name: string;
  description?: string;
  status: "not-started" | "in-progress" | "review" | "mastered";
  progress: number;
  subtopics: Subtopic[];
  createdAt: string;
  updatedAt: string;
}

export interface Subtopic {
  id: string;
  topicId: string;
  name: string;
  description: string;
  status: "not-started" | "in-progress" | "review" | "mastered";
  flashcardsCount: number;
  quizzesCount: number;
  notesCount: number;
  subtopics?: Subtopic[]; // Recursive for multi-level nesting
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  topicId?: string;
  subtopicId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Flashcard {
  id: string;
  topicId?: string;
  subtopicId?: string;
  front: string;
  back: string;
  status: "new" | "learning" | "review" | "mastered";
  nextReviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  topicId?: string;
  subtopicId?: string;
  title: string;
  source: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  type: "multiple-choice" | "true-false" | "mixed";
  timeLimit?: number; // in minutes
  tags: string[];
  questions: QuizQuestion[];
  lastScore?: number;
  lastAttemptDate?: string;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface StudySession {
  id: string;
  userId?: string;
  topicId?: string;
  subtopicId?: string;
  activityType: "flashcard" | "quiz" | "note" | "review";
  duration: number; // in minutes
  score?: number;
  createdAt: string;
}

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
    studyTime: number; // in hours
  };
}

// ============================================
// API Request/Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Topic API Types
export interface CreateTopicRequest {
  name: string;
  description?: string;
}

export interface UpdateTopicRequest {
  name?: string;
  description?: string;
  status?: "not-started" | "in-progress" | "review" | "mastered";
  progress?: number;
}

// Subtopic API Types
export interface CreateSubtopicRequest {
  topicId: string;
  name: string;
  description: string;
}

export interface UpdateSubtopicRequest {
  name?: string;
  description?: string;
  status?: "not-started" | "in-progress" | "review" | "mastered";
}

// Note API Types
export interface CreateNoteRequest {
  topicId?: string;
  subtopicId?: string;
  content: string;
}

export interface UpdateNoteRequest {
  content: string;
}

// Flashcard API Types
export interface CreateFlashcardRequest {
  topicId?: string;
  subtopicId?: string;
  front: string;
  back: string;
}

export interface UpdateFlashcardRequest {
  front?: string;
  back?: string;
  status?: "new" | "learning" | "review" | "mastered";
}

export interface ReviewFlashcardRequest {
  flashcardId: string;
  quality: 0 | 1 | 2 | 3 | 4 | 5; // Spaced repetition quality rating
}

// Quiz API Types
export interface CreateQuizRequest {
  topicId?: string;
  subtopicId?: string;
  title: string;
  source: string;
  description: string;
  questions: Omit<QuizQuestion, "id" | "quizId">[];
}

export interface UpdateQuizRequest {
  title?: string;
  source?: string;
  description?: string;
  questions?: Omit<QuizQuestion, "id" | "quizId">[];
}

export interface SubmitQuizRequest {
  quizId: string;
  answers: { questionId: string; selectedAnswer: number }[];
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  results: {
    questionId: string;
    correct: boolean;
    selectedAnswer: number;
    correctAnswer: number;
  }[];
}

// Study Session API Types
export interface CreateStudySessionRequest {
  topicId?: string;
  subtopicId?: string;
  activityType: "flashcard" | "quiz" | "note" | "review";
  duration: number;
  score?: number;
}

// ============================================
// Frontend State Types
// ============================================

export interface AppState {
  user?: User;
  topics: Topic[];
  activeTopic?: string;
  activeSubtopic?: string;
  activeTab: string;
  isLoading: boolean;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// ============================================
// Utility Types
// ============================================

export type SortOrder = "asc" | "desc";

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export interface FilterOptions {
  status?: "not-started" | "in-progress" | "review" | "mastered";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: SortOptions;
  filter?: FilterOptions;
}
