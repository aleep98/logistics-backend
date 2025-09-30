import { Request, Response, NextFunction, RequestHandler } from 'express';

// Define a type for our async route handlers to ensure type safety
type AsyncRequestHandler = (req: Request | any, res: Response, next: NextFunction) => Promise<any>;

/**
 * A utility function to wrap async route handlers.
 * It catches any errors from the async function and passes them to the
 * Express error handling middleware via next().
 * @param fn The async route handler function.
 * @returns A standard Express route handler.
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => 
    (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);