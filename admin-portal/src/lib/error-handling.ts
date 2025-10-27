/**
 * Error handling utilities for Admin Portal
 * Follows ERROR_HANDLING.md guidelines
 */

export interface ApiError {
  code: number;
  message: string;
  timestamp: string;
  result: null;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  requestId?: string;
}

/**
 * Error categories based on HTTP status codes
 */
export enum ErrorCategory {
  CLIENT_ERROR = "CLIENT_ERROR", // 400-499
  SERVER_ERROR = "SERVER_ERROR", // 500-599
  NETWORK_ERROR = "NETWORK_ERROR", // Network issues
  AUTHENTICATION = "AUTHENTICATION", // 401
  AUTHORIZATION = "AUTHORIZATION", // 403
}

/**
 * Maps error codes to user-friendly messages
 */
const ERROR_MESSAGES: Record<number, string> = {
  1001: "Your session has expired. Please login again.",
  1101: "User not found. Please check your account.",
  1102: "Video not found. It may have been deleted.",
  1051: "Invalid file. Please upload a valid video file.",
  1052: "File upload failed. Please try again.",
  9999: "An unexpected error occurred. Please try again.",
};

/**
 * Get user-friendly error message from error code
 */
export function getErrorMessage(code: number): string {
  return ERROR_MESSAGES[code] || "An error occurred. Please try again.";
}

/**
 * Categorize error based on status code or error type
 */
export function categorizeError(error: any): ErrorCategory {
  if (error.code) {
    if (error.code === 1001) return ErrorCategory.AUTHENTICATION;
    if (error.code >= 400 && error.code < 500)
      return ErrorCategory.CLIENT_ERROR;
    if (error.code >= 500) return ErrorCategory.SERVER_ERROR;
  }

  if (error.response?.status) {
    const status = error.response.status;
    if (status === 401) return ErrorCategory.AUTHENTICATION;
    if (status === 403) return ErrorCategory.AUTHORIZATION;
    if (status >= 400 && status < 500) return ErrorCategory.CLIENT_ERROR;
    if (status >= 500) return ErrorCategory.SERVER_ERROR;
  }

  if (!error.response && error.request) {
    return ErrorCategory.NETWORK_ERROR;
  }

  return ErrorCategory.SERVER_ERROR;
}

/**
 * Extract error information from various error formats
 */
export function extractErrorInfo(error: any): {
  code: number;
  message: string;
  category: ErrorCategory;
  userMessage: string;
} {
  let code = 9999;
  let message = "Unknown error";

  if (error.code) {
    code = error.code;
    message = error.message || getErrorMessage(code);
  } else if (error.response?.data) {
    const apiError = error.response.data as ApiError;
    code = apiError.code;
    message = apiError.message;
  } else if (error.message) {
    message = error.message;
  }

  const category = categorizeError(error);
  const userMessage = getErrorMessage(code);

  return {
    code,
    message,
    category,
    userMessage,
  };
}

/**
 * Log error with context information
 */
export function logError(error: any, context?: ErrorContext): void {
  const errorInfo = extractErrorInfo(error);

  const logData = {
    ...errorInfo,
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack,
    url: error.config?.url,
    method: error.config?.method,
  };

  // Only log detailed errors in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error occurred:", logData);
  } else {
    // In production, log minimal information
    console.error("Error:", {
      code: errorInfo.code,
      message: errorInfo.message,
      category: errorInfo.category,
      context: context?.component,
    });
  }
}

/**
 * Handle API errors with proper categorization and user feedback
 */
export function handleApiError(
  error: any,
  context?: ErrorContext,
  showToast: boolean = true
): {
  code: number;
  message: string;
  category: ErrorCategory;
  userMessage: string;
} {
  const errorInfo = extractErrorInfo(error);

  // Log the error
  logError(error, context);

  // Show toast notification if requested
  if (showToast && typeof window !== "undefined") {
    const { toast } = require("sonner");

    switch (errorInfo.category) {
      case ErrorCategory.AUTHENTICATION:
        toast.error("Authentication required. Please login again.");
        break;
      case ErrorCategory.AUTHORIZATION:
        toast.error("You don't have permission to perform this action.");
        break;
      case ErrorCategory.CLIENT_ERROR:
        toast.error(errorInfo.userMessage);
        break;
      case ErrorCategory.NETWORK_ERROR:
        toast.error("Network error. Please check your connection.");
        break;
      case ErrorCategory.SERVER_ERROR:
        toast.error("Server error. Please try again later.");
        break;
      default:
        toast.error(errorInfo.userMessage);
    }
  }

  return errorInfo;
}

/**
 * Retry mechanism for failed requests
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Don't retry authentication or client errors
      const category = categorizeError(error);
      if (
        category === ErrorCategory.AUTHENTICATION ||
        category === ErrorCategory.AUTHORIZATION ||
        category === ErrorCategory.CLIENT_ERROR
      ) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt))
        );
      }
    }
  }

  throw lastError;
}
