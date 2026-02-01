/**
 * Global Error Handling Utility
 * Centralized error handling and user-friendly error messages
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  originalError?: any;
}

/**
 * Parse and format errors into user-friendly messages
 */
export function parseError(error: any): AppError {
  // Network errors
  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return {
      message: 'Network error. Please check your internet connection and try again.',
      code: 'NETWORK_ERROR',
      statusCode: 0,
      originalError: error,
    };
  }

  // API errors
  if (error.statusCode) {
    switch (error.statusCode) {
      case 400:
        return {
          message: error.message || 'Invalid request. Please check your input.',
          code: 'BAD_REQUEST',
          statusCode: 400,
          originalError: error,
        };
      case 401:
        return {
          message: 'You are not authorized. Please log in again.',
          code: 'UNAUTHORIZED',
          statusCode: 401,
          originalError: error,
        };
      case 403:
        return {
          message: 'Access denied. You do not have permission to perform this action.',
          code: 'FORBIDDEN',
          statusCode: 403,
          originalError: error,
        };
      case 404:
        return {
          message: error.message || 'Resource not found. It may have been deleted.',
          code: 'NOT_FOUND',
          statusCode: 404,
          originalError: error,
        };
      case 409:
        return {
          message: error.message || 'Conflict. This resource already exists.',
          code: 'CONFLICT',
          statusCode: 409,
          originalError: error,
        };
      case 422:
        return {
          message: error.message || 'Validation failed. Please check your input.',
          code: 'VALIDATION_ERROR',
          statusCode: 422,
          originalError: error,
        };
      case 429:
        return {
          message: 'Too many requests. Please slow down and try again later.',
          code: 'RATE_LIMIT',
          statusCode: 429,
          originalError: error,
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
          statusCode: 500,
          originalError: error,
        };
      case 503:
        return {
          message: 'Service temporarily unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE',
          statusCode: 503,
          originalError: error,
        };
      default:
        return {
          message: error.message || 'An unexpected error occurred. Please try again.',
          code: 'UNKNOWN_ERROR',
          statusCode: error.statusCode,
          originalError: error,
        };
    }
  }

  // Validation errors
  if (error.message?.includes('validation') || error.name === 'ValidationError') {
    return {
      message: error.message || 'Validation failed. Please check your input.',
      code: 'VALIDATION_ERROR',
      originalError: error,
    };
  }

  // MongoDB errors
  if (error.name === 'MongoError' || error.name === 'MongoServerError') {
    if (error.code === 11000) {
      return {
        message: 'This item already exists. Please use a different name.',
        code: 'DUPLICATE_KEY',
        originalError: error,
      };
    }
    return {
      message: 'Database error. Please try again later.',
      code: 'DATABASE_ERROR',
      originalError: error,
    };
  }

  // Generic error with message
  if (error.message) {
    return {
      message: error.message,
      code: 'ERROR',
      originalError: error,
    };
  }

  // Unknown error
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    originalError: error,
  };
}

/**
 * Handle error and show notification
 */
export function handleError(error: any, context?: string): AppError {
  const parsedError = parseError(error);
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error${context ? ` in ${context}` : ''}:`, {
      message: parsedError.message,
      code: parsedError.code,
      statusCode: parsedError.statusCode,
      original: parsedError.originalError,
    });
  }

  return parsedError;
}

/**
 * Show error notification to user
 */
export function showErrorNotification(message: string) {
  // This will be called from components that have access to useToast
  // For backward compatibility, we keep this function but it will be replaced
  // by direct useToast() calls in components
  if (typeof window !== 'undefined') {
    // Dispatch custom event that ToastProvider can listen to
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message, type: 'error' }
    }));
  }
}

/**
 * Show success notification to user
 */
export function showSuccessNotification(message: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message, type: 'success' }
    }));
  }
}
