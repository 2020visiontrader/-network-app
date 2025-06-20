// Error Handling Service
// Real production utility for consistent error handling
export class ErrorHandler {
  static handleSupabaseError(error) {
    const errorMap = {
      '23505': 'This record already exists. Please try with different information.',
      '23503': 'Referenced record not found. Please check your data.',
      '42501': 'Permission denied. Please check your access rights.',
      '42703': 'Database structure error. Please contact support.',
      'PGRST116': 'Record not found.',
      '08006': 'Connection failed. Please check your internet connection.',
      '28P01': 'Authentication failed. Please check your credentials.',
      '42P01': 'Table not found. Please contact support.',
    };

    return {
      code: error.code || 'UNKNOWN',
      message: errorMap[error.code] || error.message || 'An unexpected error occurred',
      details: error.details || null,
      hint: error.hint || null,
      originalError: error
    };
  }

  static handleAuthError(error) {
    const authErrorMap = {
      'invalid_credentials': 'Invalid email or password. Please try again.',
      'email_not_confirmed': 'Please check your email and click the confirmation link.',
      'signup_disabled': 'New account creation is currently disabled.',
      'email_address_invalid': 'Please enter a valid email address.',
      'password_too_short': 'Password must be at least 6 characters long.',
      'weak_password': 'Please choose a stronger password.',
      'rate_limit_exceeded': 'Too many attempts. Please wait before trying again.',
      'user_not_found': 'No account found with this email address.',
      'email_address_not_authorized': 'This email address is not authorized to sign up.',
    };

    return {
      code: error.message || 'AUTH_ERROR',
      message: authErrorMap[error.message] || error.message || 'Authentication error occurred',
      originalError: error
    };
  }

  static handleNetworkError(error) {
    if (!navigator.onLine) {
      return {
        code: 'NETWORK_OFFLINE',
        message: 'No internet connection. Please check your network and try again.',
        originalError: error
      };
    }

    if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection and try again.',
        originalError: error
      };
    }

    if (error.status === 404) {
      return {
        code: 'NOT_FOUND',
        message: 'Resource not found.',
        originalError: error
      };
    }

    if (error.status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message: 'Server error. Please try again later.',
        originalError: error
      };
    }

    return {
      code: 'UNKNOWN_NETWORK_ERROR',
      message: 'An unexpected network error occurred.',
      originalError: error
    };
  }

  static handleFormError(validationErrors) {
    const firstError = Object.keys(validationErrors)[0];
    return {
      code: 'VALIDATION_ERROR',
      message: validationErrors[firstError] || 'Please check your input and try again.',
      field: firstError,
      allErrors: validationErrors
    };
  }

  static formatErrorForUser(error, context = 'general') {
    let handledError;

    // Determine error type and handle accordingly
    if (error.code && (error.message || error.details)) {
      // Supabase error
      handledError = this.handleSupabaseError(error);
    } else if (error.message && typeof error.message === 'string') {
      // Auth error
      handledError = this.handleAuthError(error);
    } else if (error.status || error.name === 'NetworkError') {
      // Network error
      handledError = this.handleNetworkError(error);
    } else if (typeof error === 'object' && !error.message) {
      // Validation errors object
      handledError = this.handleFormError(error);
    } else {
      // Generic error
      handledError = {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred.',
        originalError: error
      };
    }

    // Add context-specific messaging
    const contextMessages = {
      'onboarding': 'There was an issue completing your profile setup.',
      'auth': 'There was an issue with authentication.',
      'profile': 'There was an issue updating your profile.',
      'connection': 'There was an issue connecting to our services.'
    };

    if (contextMessages[context]) {
      handledError.contextMessage = contextMessages[context];
    }

    return handledError;
  }

  static logError(error, context = '', additionalInfo = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      context,
      error: this.formatErrorForUser(error, context),
      additionalInfo,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' && window.location ? window.location.href : 'unknown'
    };

    // In development, log to console
    if (__DEV__ || process.env.NODE_ENV === 'development') {
      console.error('Error Log:', errorLog);
    }

    // In production, you might want to send to an error tracking service
    // Example: Sentry, LogRocket, etc.
    
    return errorLog;
  }

  static createUserFriendlyMessage(error, fallbackMessage = 'Something went wrong. Please try again.') {
    const handledError = this.formatErrorForUser(error);
    
    // Return the most user-friendly message available
    return handledError.contextMessage || handledError.message || fallbackMessage;
  }
}
