/**
 * Custom React Hooks for Data Fetching
 * These hooks will be used to fetch data from the backend API
 */

import { useState, useEffect } from "react";

export interface UseApiOptions {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for API calls
 */
export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions = {},
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { enabled = true, onSuccess, onError } = options;

  const fetchData = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiFunction();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred");
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export interface UseMutationResult<T, V> {
  mutate: (variables: V) => Promise<T | null>;
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useMutation<T, V>(
  mutationFunction: (variables: V) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {},
): UseMutationResult<T, V> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (variables: V): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFunction(variables);
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred");
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    mutate,
    data,
    isLoading,
    error,
    reset,
  };
}

// ============================================
// Specific Hooks for Different Entities
// ============================================

/**
 * Example usage hooks - uncomment when backend is ready
 */

/*
import { topicAPI, notesAPI, flashcardsAPI, quizzesAPI, dashboardAPI } from './api';

export const useTopics = () => {
  return useApi(topicAPI.getAll);
};

export const useTopic = (id: string) => {
  return useApi(() => topicAPI.getById(id), { enabled: !!id });
};

export const useNotes = (params?: { topicId?: string; subtopicId?: string }) => {
  return useApi(() => notesAPI.getAll(params));
};

export const useFlashcards = (params?: { topicId?: string; subtopicId?: string }) => {
  return useApi(() => flashcardsAPI.getAll(params));
};

export const useQuizzes = (params?: { topicId?: string; subtopicId?: string }) => {
  return useApi(() => quizzesAPI.getAll(params));
};

export const useDashboardStats = () => {
  return useApi(dashboardAPI.getStats);
};

export const useCreateTopic = () => {
  return useMutation(topicAPI.create);
};

export const useUpdateTopic = (id: string) => {
  return useMutation((data: any) => topicAPI.update(id, data));
};

export const useDeleteTopic = () => {
  return useMutation(topicAPI.delete);
};
*/
