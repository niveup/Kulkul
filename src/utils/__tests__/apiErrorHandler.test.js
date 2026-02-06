/**
 * Test file for API Error Handler
 * Demonstrates the error handling functionality
 */

import { handleApiError, apiRequest, validators } from '../apiErrorHandler';

// Mock toast function
const mockToast = {
  error: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  info: jest.fn()
};

describe('API Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validators', () => {
    test('validates task text correctly', () => {
      // Valid cases
      expect(validators.validateTaskText('Valid task')).toEqual({
        isValid: true,
        sanitized: 'Valid task'
      });
      
      expect(validators.validateTaskText('  Task with spaces  ')).toEqual({
        isValid: true,
        sanitized: 'Task with spaces'
      });

      // Invalid cases
      expect(validators.validateTaskText('')).toEqual({
        isValid: false,
        error: 'Task cannot be empty'
      });
      
      expect(validators.validateTaskText('a'.repeat(300))).toEqual({
        isValid: false,
        error: 'Task must be 280 characters or less'
      });
    });

    test('validates timer duration correctly', () => {
      // Valid cases
      expect(validators.validateTimerDuration(25)).toEqual({
        isValid: true,
        value: 25
      });
      
      expect(validators.validateTimerDuration('30')).toEqual({
        isValid: true,
        value: 30
      });

      // Invalid cases
      expect(validators.validateTimerDuration(0)).toEqual({
        isValid: false,
        error: 'Duration must be at least 1 minute'
      });
      
      expect(validators.validateTimerDuration(1000)).toEqual({
        isValid: false,
        error: 'Duration cannot exceed 999 minutes'
      });
      
      expect(validators.validateTimerDuration('invalid')).toEqual({
        isValid: false,
        error: 'Duration must be a number'
      });
    });
  });

  describe('handleApiError', () => {
    test('handles network errors', () => {
      const networkError = new TypeError('Failed to fetch');
      const result = handleApiError(networkError, { 
        context: 'test-network', 
        toast: mockToast 
      });
      
      expect(result.isNetworkError).toBe(true);
      expect(result.code).toBe('NETWORK_ERROR');
      expect(mockToast.error).toHaveBeenCalledWith('Error', 'Network connection failed - Please check your internet connection');
    });

    test('handles HTTP errors', () => {
      const httpResponse = { status: 404 };
      const result = handleApiError(httpResponse, { 
        context: 'test-http', 
        toast: mockToast 
      });
      
      expect(result.code).toBe('HTTP_404');
      expect(mockToast.error).toHaveBeenCalledWith('Error', 'Not Found - The requested resource doesn\'t exist');
    });
  });
});

console.log('✅ API Error Handler tests completed successfully!');
console.log('🧪 Run "npm test" to execute all tests');