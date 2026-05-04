import { Request, Response, NextFunction } from 'express';

export const validateWQInput = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const { ph, suhu, ec, tds, turbidity } = req.body;

        // Cek apakah minimal ada satu data yang dikirim (menggunakan undefined agar angka 0 tetap lolos)
        if (ph === undefined && suhu === undefined && ec === undefined && tds === undefined && turbidity === undefined) {
            res.status(400).json({
                success: false,
                message: '[VALIDATION] Minimal satu field harus diisi (ph, suhu, ec, tds, atau turbidity)',
            });
            return;
        }

        // Fungsi pintar untuk mengecek tipe data
        const validateAndSanitize = (value: any, fieldName: string) => {
            // Jika kosong, abaikan
            if (value === undefined || value === null) return value;

            // 1. JIKA ANGKA MURNI: Langsung loloskan (Angka kebal terhadap SQL Injection/XSS)
            if (typeof value === 'number') {
                return value;
            }

            // 2. JIKA STRING (Teks): Lakukan pemeriksaan ketat
            if (typeof value === 'string') {
                const maxLength = 100;
                if (value.length > maxLength) {
                    throw new Error(`Panjang data ${fieldName} melebihi batas maksimal`);
                }

                const dangerousPattern = /[<>\"'`;(){}[\]\\]/;
                if (dangerousPattern.test(value)) {
                    throw new Error(`Input ${fieldName} mengandung karakter yang tidak aman (XSS/SQLi)`);
                }

                // Bersihkan spasi berlebih
                return value.trim();
            }

            // Tipe data lain (boolean, array, dll) ditolak
            throw new Error(`Format data ${fieldName} tidak valid`);
        };

        try {
            // Terapkan fungsi pintar ke semua variabel input
            req.body.ph = validateAndSanitize(ph, 'ph');
            req.body.suhu = validateAndSanitize(suhu, 'suhu');
            req.body.ec = validateAndSanitize(ec, 'ec');
            req.body.tds = validateAndSanitize(tds, 'tds');
            req.body.turbidity = validateAndSanitize(turbidity, 'turbidity');
        } catch (validationError: any) {
            res.status(400).json({
                success: false,
                message: `[SECURITY] ${validationError.message}`,
            });
            return;
        }

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