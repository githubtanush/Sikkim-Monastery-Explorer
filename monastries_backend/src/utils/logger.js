const pino = require('pino');

// Create logger instance with appropriate configuration
const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname'
        }
    } : undefined,
    formatters: {
        level: (label) => {
            return { level: label };
        }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    // Redact sensitive information
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token'],
        remove: true
    }
});

module.exports = logger;
