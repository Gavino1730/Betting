const ErrorLog = require('../models/ErrorLog');

// Middleware to log all errors
const errorLogger = async (err, req, res, next) => {
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

  // Log the error
  await ErrorLog.create({
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
    severity: err.statusCode >= 500 ? 'critical' : 'error'
  });

  // Continue to next error handler
  next(err);
};

module.exports = { errorLogger };
