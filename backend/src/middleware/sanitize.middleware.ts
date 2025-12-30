/**
 * Input Sanitization Middleware
 * Protects against XSS attacks by sanitizing user input
 */

import xss from 'xss';
import { Request, Response, NextFunction } from 'express';

// Fields that should be sanitized
const SANITIZE_FIELDS = ['title', 'description', 'content', 'name', 'bio'];

/**
 * Recursively sanitize string values in an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return xss(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      if (SANITIZE_FIELDS.includes(key) && typeof obj[key] === 'string') {
        sanitized[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  }
  return obj;
}

/**
 * Middleware to sanitize request body
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
}

/**
 * Sanitize a single string value
 */
export function sanitizeString(value: string): string {
  return xss(value);
}
