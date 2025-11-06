/**
 * API Logger Utility
 * Logs all API requests to the backend for debugging and monitoring
 */

interface ApiLog {
  url: string;
  method: string;
  timestamp: string;
  body?: any;
  status?: number;
  responseTime?: number;
  error?: string;
}

class ApiLogger {
  private requestId = 0;

  /**
   * Wrapper for fetch that logs all API requests
   */
  async loggedFetch(url: string, options?: RequestInit): Promise<Response> {
    const requestId = ++this.requestId;
    const method = options?.method || 'GET';
    const startTime = Date.now();
    
    // Log request
    const requestLog: ApiLog = {
      url,
      method,
      timestamp: new Date().toISOString(),
      body: options?.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
    };

    if (API_LOGGING_ENABLED) {
      console.log(`%c🚀 [API Request #${requestId}] ${method} ${url}`, 'color: #4CAF50; font-weight: bold');
      console.log(`%c📤 Request Details:`, 'color: #2196F3; font-weight: bold', {
        timestamp: requestLog.timestamp,
        method: requestLog.method,
        body: requestLog.body,
        headers: options?.headers,
      });
    }

    try {
      // Use native fetch to avoid recursion
      const response = await globalThis.fetch(url, options);
      const responseTime = Date.now() - startTime;
      
      // Clone response to read body without consuming it
      const responseClone = response.clone();
      let responseData: any = null;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          responseData = await responseClone.json();
        } else {
          responseData = await responseClone.text();
        }
      } catch (e) {
        // If we can't parse response, that's okay
      }

      // Log response
      const statusColor = response.ok ? '#4CAF50' : '#F44336';
      const statusEmoji = response.ok ? '✅' : '❌';
      
      if (API_LOGGING_ENABLED) {
        console.log(`%c${statusEmoji} [API Response #${requestId}] ${method} ${url}`, `color: ${statusColor}; font-weight: bold`);
        console.log(`%c📥 Response Details:`, 'color: #FF9800; font-weight: bold', {
          status: response.status,
          statusText: response.statusText,
          responseTime: `${responseTime}ms`,
          data: responseData,
        });
      }

      return response;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      if (API_LOGGING_ENABLED) {
        console.error(`%c❌ [API Error #${requestId}] ${method} ${url}`, 'color: #F44336; font-weight: bold');
        console.error(`%c💥 Error Details:`, 'color: #F44336; font-weight: bold', {
          error: error.message,
          responseTime: `${responseTime}ms`,
          stack: error.stack,
        });
      }

      throw error;
    }
  }

  /**
   * Log Firebase Functions callable request
   */
  logFirebaseCallable(functionName: string, data?: any, result?: any, error?: any) {
    const requestId = ++this.requestId;
    const timestamp = new Date().toISOString();

    if (!API_LOGGING_ENABLED) return;
    if (error) {
      console.error(`%c❌ [Firebase Function Error #${requestId}] ${functionName}`, 'color: #F44336; font-weight: bold');
      console.error(`%c💥 Error Details:`, 'color: #F44336; font-weight: bold', {
        timestamp,
        function: functionName,
        input: data,
        error: error.message || error,
      });
    } else {
      console.log(`%c🚀 [Firebase Function Call #${requestId}] ${functionName}`, 'color: #9C27B0; font-weight: bold');
      console.log(`%c📤 Request:`, 'color: #2196F3; font-weight: bold', {
        timestamp,
        function: functionName,
        data,
      });
      console.log(`%c✅ [Firebase Function Response #${requestId}] ${functionName}`, 'color: #4CAF50; font-weight: bold');
      console.log(`%c📥 Response:`, 'color: #FF9800; font-weight: bold', {
        result,
      });
    }
  }

  /**
   * Log Firestore operations for performance tracking
   */
  async logFirestoreOperation<T>(
    operationName: string,
    collectionName: string,
    operation: () => Promise<T>,
    filters?: Record<string, any>
  ): Promise<T> {
    const requestId = ++this.requestId;
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    if (API_LOGGING_ENABLED) {
      console.log(`%c🔥 [Firestore Query #${requestId}] ${operationName}`, 'color: #FF5722; font-weight: bold');
      console.log(`%c📤 Query Details:`, 'color: #2196F3; font-weight: bold', {
        timestamp,
        operation: operationName,
        collection: collectionName,
        filters: filters || {},
      });
    }

    try {
      const result = await operation();
      const responseTime = Date.now() - startTime;
      
      // Determine result size
      let resultSize = 0;
      let resultSummary = '';
      if (Array.isArray(result)) {
        resultSize = result.length;
        resultSummary = `Array with ${resultSize} items`;
      } else if (result && typeof result === 'object') {
        resultSize = Object.keys(result).length;
        resultSummary = `Object with ${resultSize} properties`;
      } else {
        resultSummary = String(result);
      }

      const statusColor = '#4CAF50';
      const statusEmoji = '✅';
      
      if (API_LOGGING_ENABLED) {
        console.log(`%c${statusEmoji} [Firestore Response #${requestId}] ${operationName}`, `color: ${statusColor}; font-weight: bold`);
        console.log(`%c📥 Response Details:`, 'color: #FF9800; font-weight: bold', {
          responseTime: `${responseTime}ms`,
          resultSize,
          resultSummary,
          collection: collectionName,
        });
      }

      // Log performance warning if query is slow
      if (API_LOGGING_ENABLED && responseTime > 1000) {
        console.warn(`%c⚠️ Slow Firestore Query Warning: ${operationName} took ${responseTime}ms`, 'color: #FF9800; font-weight: bold');
      }

      return result;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      if (API_LOGGING_ENABLED) {
        console.error(`%c❌ [Firestore Error #${requestId}] ${operationName}`, 'color: #F44336; font-weight: bold');
        console.error(`%c💥 Error Details:`, 'color: #F44336; font-weight: bold', {
          timestamp,
          operation: operationName,
          collection: collectionName,
          responseTime: `${responseTime}ms`,
          error: error.message || error,
          code: error.code,
          stack: error.stack,
        });
      }

      throw error;
    }
  }
}

// Export singleton instance
export const apiLogger = new ApiLogger();

// Feature flag to toggle API/Firestore console logging
export let API_LOGGING_ENABLED = false;
export function setApiLoggingEnabled(enabled: boolean) {
  API_LOGGING_ENABLED = enabled;
}

// Export logged fetch as default fetch replacement
export const loggedFetch = apiLogger.loggedFetch.bind(apiLogger);

