import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';

// Extend the Request interface to include the csrfToken method
interface RequestWithCsrf extends Express.Request {
  csrfToken: () => string;
}

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(
    req: RequestWithCsrf | Express.Request,
    res: Response,
    next: NextFunction,
  ) {
    // Skip if not in production or if CSRF is not initialized (early in the request lifecycle)
    if (process.env.NODE_ENV !== 'production' || !('csrfToken' in req)) {
      return next();
    }

    try {
      // Add CSRF token to response headers for frontend to use
      const csrfToken = req.csrfToken();
      res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false, // Readable by client-side JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      // Also set the token in response header
      res.setHeader('X-CSRF-Token', csrfToken);
    } catch {
      // Fail silently if csrfToken() is not available (e.g., for excluded paths)
    }

    next();
  }
}
