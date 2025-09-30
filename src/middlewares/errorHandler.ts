import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
    statusCode?: number;
}

export const globalErrorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
    console.error("GLOBAL ERROR HANDLER:", err);

    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    if (err.name === 'CastError') {
        const castError = err as any;
        return res.status(400).json({ error: `Invalid format for field '${castError.path}'. Expected a ${castError.kind}.` });
    }
    // Mongo duplicate key error
    if ((err as any).code === 11000) {
        return res.status(409).json({ error: 'A resource with this value already exists.' });
    }

    const statusCode = err.statusCode || 500;
    const message = statusCode < 500 ? err.message : 'An unexpected internal server error occurred.';

    res.status(statusCode).json({ error: message });
};