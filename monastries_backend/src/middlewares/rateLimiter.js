const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        logger.warn({
            ip: req.ip,
            url: req.originalUrl
        }, 'Rate limit exceeded');
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later'
        });
    }
});

// Stricter rate limiter for authentication routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn({
            ip: req.ip,
            url: req.originalUrl
        }, 'Auth rate limit exceeded');
        res.status(429).json({
            success: false,
            message: 'Too many authentication attempts, please try again after 15 minutes'
        });
    }
});

// Rate limiter for creating resources
const createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 create requests per hour
    message: {
        success: false,
        message: 'Too many resources created, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    apiLimiter,
    authLimiter,
    createLimiter
};
