import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: {
        success: false,
        message: '[RATE LIMIT] Terlalu banyak request dari IP ini, silakan coba lagi nanti.',
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});


export const createLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 20, 
    message: {
        success: false,
        message: '[RATE LIMIT] Terlalu banyak percobaan pembuatan data. Silakan tunggu beberapa saat.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

export const bruteForceLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: '[SECURITY] Terlalu banyak percobaan. Akses diblokir sementara untuk keamanan.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const queryLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        success: false,
        message: '[RATE LIMIT] Terlalu banyak request query. Silakan tunggu beberapa saat.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
