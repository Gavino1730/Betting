const ErrorLog = require('../models/ErrorLog');

// Rate limiting for error logging to prevent spam
const errorLogRateLimit = {
  lastLogTime: 0,
  errorCount: 0,
  maxErrorsPerMinute: 20,
  recentErrors: new Set()
};

// Middleware to log all errors
const errorLogger = async (err, req, res, next) => {
  try {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Reset counter if a minute has passed
    if (errorLogRateLimit.lastLogTime < oneMinuteAgo) {
      errorLogRateLimit.errorCount = 0;
      errorLogRateLimit.recentErrors.clear();
    }
    
    // Create error fingerprint to avoid duplicate logging
    const errorFingerprint = `${err.message || ''}:${req.originalUrl || ''}:${req.method}`;
    
    // Check rate limit and duplicates
    if (errorLogRateLimit.errorCount < errorLogRateLimit.maxErrorsPerMinute && 
        !errorLogRateLimit.recentErrors.has(errorFingerprint)) {
      
      errorLogRateLimit.lastLogTime = now;
      errorLogRateLimit.errorCount++;
      errorLogRateLimit.recentErrors.add(errorFingerprint);
      
      // Extract user info if available
      const userId = req.user?.id || null;
      const username = req.user?.username || 'anonymous';
      
      // Get IP address (considering proxies)
      const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || 
                        req.headers['x-real-ip'] || 
                        req.socket.remoteAddress;

      // Sanitize request body to exclude sensitive fields
      const sanitizedBody = { ...req.body };
      const sensitiveFields = ['password', 'token', 'jwt', 'secret', 'key', 'credit', 'card', 'ssn', 'pin'];
      sensitiveFields.forEach(field => {
        Object.keys(sanitizedBody).forEach(key => {
          if (key.toLowerCase().includes(field)) {
            sanitizedBody[key] = '[REDACTED]';
          }
        });
      });

      // Log the error (fire and forget - don't await)
      ErrorLog.create({
        userId,
        username,
        errorType: 'backend',
        errorMessage: err.message || 'Unknown error',
        errorStack: err.stack,
        endpoint: req.originalUrl || req.url,
        method: req.method,
        requestBody: Object.keys(sanitizedBody).length > 0 ? sanitizedBody : null,
        userAgent: req.headers['user-agent'],
        ipAddress,
        severity: (err.statusCode || err.status || 500) >= 500 ? 'critical' : 'error'
      }).catch(logErr => {
        console.error('Failed to log error to database:', logErr.message);
      });
    }
  } catch (logErr) {
    // Don't let error logging break the error handling flow
    console.error('Error in errorLogger middleware:', logErr.message);
  }

  // Continue to next error handler
  next(err);
};

module.exports = { errorLogger };
