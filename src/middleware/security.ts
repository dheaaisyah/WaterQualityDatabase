import { Request, Response, NextFunction } from 'express';

export const validateWQInput = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const { ph, suhu, ec, tds, turbidity } = req.body;

        if (!ph && !suhu && !ec && !tds && !turbidity) {
            res.status(400).json({
                success: false,
                message: '[VALIDATION] Minimal satu field harus diisi (ph, suhu, ec, tds, atau turbidity)',
            });
            return;
        }

        // Validasi panjang maksimal untuk mencegah buffer overflow
        const maxLength = 100;
        if (
            (ph && ph.length > maxLength) ||
            (suhu && suhu.length > maxLength) ||
            (ec && ec.length > maxLength) ||
            (tds && tds.length > maxLength) ||
            (turbidity && turbidity.length > maxLength)
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
            (ph && dangerousPattern.test(ph)) ||
            (suhu && dangerousPattern.test(suhu)) ||
            (ec && dangerousPattern.test(ec)) ||
            (tds && dangerousPattern.test(tds)) ||
            (turbidity && dangerousPattern.test(turbidity))
        ) {
            res.status(400).json({
                success: false,
                message: '[SECURITY] Input mengandung karakter yang tidak diizinkan',
            });
            return;
        }

        // Sanitasi input - trim whitespace
        if (ph) req.body.ph = ph.trim();
        if (suhu) req.body.suhu = suhu.trim();
        if (ec) req.body.ec = ec.trim();
        if (tds) req.body.tds = tds.trim();
        if (turbidity) req.body.turbidity = turbidity.trim();

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
