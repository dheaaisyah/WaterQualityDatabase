import { Request, Response, NextFunction } from 'express';

export const validateAqmsInput = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const { co2, suhu, humidity } = req.body;

        if (!co2 && !suhu && !humidity) {
            res.status(400).json({
                success: false,
                message: '[VALIDATION] Minimal satu field harus diisi (co2, suhu, atau humidity)',
            });
            return;
        }

        // Validasi panjang maksimal untuk mencegah buffer overflow
        const maxLength = 100;
        if (
            (co2 && co2.length > maxLength) ||
            (suhu && suhu.length > maxLength) ||
            (humidity && humidity.length > maxLength)
        ) {
            res.status(400).json({
                success: false,
                message: '[VALIDATION] Panjang data melebihi batas maksimal',
            });
            return;
        }

        // Validasi karakter berbahaya (SQL Injection, XSS)
        const dangerousPattern = /[<>\"'`;(){}[\]\\]/;
        if (
            (co2 && dangerousPattern.test(co2)) ||
            (suhu && dangerousPattern.test(suhu)) ||
            (humidity && dangerousPattern.test(humidity))
        ) {
            res.status(400).json({
                success: false,
                message: '[SECURITY] Input mengandung karakter yang tidak diizinkan',
            });
            return;
        }

        // Sanitasi input - trim whitespace
        if (co2) req.body.co2 = co2.trim();
        if (suhu) req.body.suhu = suhu.trim();
        if (humidity) req.body.humidity = humidity.trim();

        next();
    } catch (error) {
        console.error('[ERROR] Validation middleware:', error);
        res.status(500).json({
            success: false,
            message: '[ERROR] Terjadi kesalahan saat validasi input',
        });
    }
};

/**
 * Middleware untuk logging request (security audit trail)
 */
export const logRequest = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.socket.remoteAddress;
    const method = req.method;
    const path = req.path;

    console.log(`[${timestamp}] ${method} ${path} - IP: ${ip}`);
    next();
};

/**
 * Middleware untuk mencegah request body yang terlalu besar
 */
export const validateRequestSize = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const contentLength = req.headers['content-length'];
    const maxSize = 1024 * 10; // 10KB

    if (contentLength && parseInt(contentLength) > maxSize) {
        res.status(413).json({
            success: false,
            message: '[SECURITY] Request body terlalu besar',
        });
        return;
    }

    next();
};
