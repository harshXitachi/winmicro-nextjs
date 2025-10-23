// Error handling utilities to prevent infinite loops and improve user experience

export class ErrorHandler {
  private static retryCounts = new Map<string, number>();
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000; // 1 second

  static async handleFirebaseError(error: any, context: string): Promise<boolean> {
    console.error(`❌ Firebase error in ${context}:`, error);
    
    if (error.code === 'auth/quota-exceeded') {
      console.error('🚨 Firebase quota exceeded - implementing fallback');
      return false; // Don't retry
    }
    
    if (error.code === 'auth/network-request-failed') {
      console.error('🌐 Network error - will retry');
      return true; // Allow retry
    }
    
    return false; // Don't retry other errors
  }

  static async handleApiError(response: Response, context: string): Promise<boolean> {
    console.error(`❌ API error in ${context}:`, response.status);
    
    if (response.status === 401) {
      console.error('🔐 Authentication error - clearing cache');
      return true; // Allow retry with fresh token
    }
    
    if (response.status >= 500) {
      console.error('🔧 Server error - will retry');
      return true; // Allow retry for server errors
    }
    
    return false; // Don't retry client errors
  }

  static shouldRetry(operation: string): boolean {
    const count = this.retryCounts.get(operation) || 0;
    return count < this.MAX_RETRIES;
  }

  static incrementRetry(operation: string): void {
    const count = this.retryCounts.get(operation) || 0;
    this.retryCounts.set(operation, count + 1);
  }

  static resetRetry(operation: string): void {
    this.retryCounts.delete(operation);
  }

  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static getUserFriendlyMessage(error: any): string {
    if (error.code === 'auth/quota-exceeded') {
      return 'Service temporarily unavailable. Please try again later.';
    }
    
    if (error.code === 'auth/network-request-failed') {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (error.message?.includes('Firebase quota exceeded')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    
    return 'An error occurred. Please try again.';
  }
}

// Rate limiting to prevent excessive API calls
export class RateLimiter {
  private static calls = new Map<string, number[]>();
  private static readonly WINDOW_MS = 60000; // 1 minute
  private static readonly MAX_CALLS = 10; // Max 10 calls per minute

  static canMakeCall(operation: string): boolean {
    const now = Date.now();
    const calls = this.calls.get(operation) || [];
    
    // Remove calls older than window
    const recentCalls = calls.filter(time => now - time < this.WINDOW_MS);
    
    if (recentCalls.length >= this.MAX_CALLS) {
      console.warn(`⚠️ Rate limit exceeded for ${operation}`);
      return false;
    }
    
    recentCalls.push(now);
    this.calls.set(operation, recentCalls);
    return true;
  }

  static reset(operation: string): void {
    this.calls.delete(operation);
  }
}
