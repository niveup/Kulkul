/**
 * API Error Handler Utility
 * Standardized error handling for all API calls throughout the application
 */

import { useToast } from '../components/ui/Toast';
import { isGuestMode, isLocalhost } from './authMode';

// Error message mappings for common HTTP status codes
const ERROR_MESSAGES = {
  400: 'Bad Request - Please check your input',
  401: 'Unauthorized - Please log in again',
  403: 'Forbidden - You don\'t have permission for this action',
  404: 'Not Found - The requested resource doesn\'t exist',
  409: 'Conflict - This item already exists',
  422: 'Validation Error - Please check your input',
  429: 'Too Many Requests - Please try again later',
  500: 'Server Error - Something went wrong on our end',
  502: 'Bad Gateway - Temporary server issue',
  503: 'Service Unavailable - Server is temporarily unavailable',
  504: 'Gateway Timeout - Server took too long to respond'
};

/**
 * Check if we should suppress 401 errors (user not yet authenticated)
 * This prevents toast floods when visiting the site before logging in
 */
const shouldSuppress401Toast = () => {
  // On localhost, we're auto-authenticated, so 401 is unexpected - show it
  if (isLocalhost()) {
    return false;
  }
  // If in guest mode, 401 from API calls is expected - suppress it
  if (isGuestMode()) {
    return true;
  }
  // If not in guest mode and not on localhost, user might be mid-login
  // Check if there's an auth session cookie indicator
  // If none, user is unauthenticated and 401s are expected before login
  return !document.cookie.includes('session=');
};

// Network error messages
const NETWORK_ERROR_MESSAGES = {
  'Failed to fetch': 'Network connection failed - Please check your internet connection',
  'NetworkError when attempting to fetch resource': 'Network error - Please try again',
  'The request timed out': 'Request timeout - Please try again',
  'Type error': 'Connection error - Please refresh the page'
};

/**
 * Handle API errors consistently across the application
 * @param {Error|Response} error - The error object or Response from fetch
 * @param {Object} options - Configuration options
 * @param {string} options.context - Context for logging (e.g., 'session-save', 'task-create')
 * @param {Function} options.toast - Toast function for user notifications
 * @param {boolean} options.showUserMessage - Whether to show error to user
 * @param {string} options.defaultMessage - Default message if no specific error mapping
 * @returns {Object} Formatted error object
 */
export const handleApiError = (error, options = {}) => {
  const {
    context = 'general-api-call',
    toast,
    showUserMessage = true,
    defaultMessage = 'An unexpected error occurred'
  } = options;

  // Log the error for debugging
  console.error(`[${context}] API Error:`, error);

  let userMessage = defaultMessage;
  let errorCode = 'UNKNOWN_ERROR';
  let isNetworkError = false;

  // Handle network errors
  if (error instanceof TypeError && error.message in NETWORK_ERROR_MESSAGES) {
    userMessage = NETWORK_ERROR_MESSAGES[error.message];
    errorCode = 'NETWORK_ERROR';
    isNetworkError = true;
  }
  // Handle HTTP errors from Response objects
  else if (error instanceof Response) {
    const status = error.status;
    userMessage = ERROR_MESSAGES[status] || `HTTP ${status} Error`;
    errorCode = `HTTP_${status}`;
  }
  // Handle custom error objects with status property
  else if (error && typeof error === 'object' && error.status) {
    const status = error.status;
    userMessage = ERROR_MESSAGES[status] || error.message || defaultMessage;
    errorCode = `HTTP_${status}`;
  }
  // Handle generic JavaScript errors
  else if (error instanceof Error) {
    userMessage = error.message || defaultMessage;
    errorCode = error.name || 'GENERIC_ERROR';
  }

  // Show user-friendly message (suppress 401 errors for unauthenticated users)
  const is401Error = errorCode === 'HTTP_401';
  const shouldSuppressToast = is401Error && shouldSuppress401Toast();

  if (showUserMessage && toast && !shouldSuppressToast) {
    toast.error('Error', userMessage);
  }

  return {
    success: false,
    error: true,
    message: userMessage,
    code: errorCode,
    originalError: error,
    isNetworkError,
    timestamp: new Date().toISOString()
  };
};

/**
 * Wrapper for fetch requests with automatic error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {Object} errorOptions - Error handling options
 * @returns {Promise<Object>} Response data or error object
 */
export const apiRequest = async (url, options = {}, errorOptions = {}) => {
  const { toast } = errorOptions;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    // Handle successful responses
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return {
          success: true,
          data: await response.json(),
          status: response.status
        };
      } else {
        return {
          success: true,
          data: await response.text(),
          status: response.status
        };
      }
    }

    // Handle HTTP errors
    throw response;

  } catch (error) {
    return handleApiError(error, {
      context: errorOptions.context || `api-request-${url}`,
      toast,
      showUserMessage: errorOptions.showUserMessage !== false,
      defaultMessage: errorOptions.defaultMessage
    });
  }
};

/**
 * Validation utility for common input types
 */
export const validators = {
  /**
   * Validate task/todo text input
   * @param {string} text - Text to validate
   * @returns {Object} Validation result
   */
  validateTaskText: (text) => {
    const trimmed = text?.trim() || '';

    if (!trimmed) {
      return {
        isValid: false,
        error: 'Task cannot be empty'
      };
    }

    if (trimmed.length > 280) {
      return {
        isValid: false,
        error: 'Task must be 280 characters or less'
      };
    }

    if (trimmed.length < 1) {
      return {
        isValid: false,
        error: 'Task must be at least 1 character'
      };
    }

    return {
      isValid: true,
      sanitized: trimmed
    };
  },

  /**
   * Validate note content
   * @param {string} content - Note content to validate
   * @returns {Object} Validation result
   */
  validateNoteContent: (content) => {
    const trimmed = content?.trim() || '';

    if (!trimmed) {
      return {
        isValid: false,
        error: 'Note content cannot be empty'
      };
    }

    if (trimmed.length > 10000) {
      return {
        isValid: false,
        error: 'Note must be 10,000 characters or less'
      };
    }

    return {
      isValid: true,
      sanitized: trimmed
    };
  },

  /**
   * Validate timer duration
   * @param {number} minutes - Duration in minutes
   * @returns {Object} Validation result
   */
  validateTimerDuration: (minutes) => {
    const num = Number(minutes);

    if (isNaN(num)) {
      return {
        isValid: false,
        error: 'Duration must be a number'
      };
    }

    if (num < 0.17) {
      return {
        isValid: false,
        error: 'Duration must be at least 10 seconds'
      };
    }

    if (num > 999) {
      return {
        isValid: false,
        error: 'Duration cannot exceed 999 minutes'
      };
    }

    return {
      isValid: true,
      value: Math.floor(num)
    };
  }
};

export default {
  handleApiError,
  apiRequest,
  validators
};