import { Request, Response, NextFunction } from 'express';

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Sanitize user input
 */
export function sanitize(input: string): string {
  return input.trim();
}

/**
 * Request validation middleware
 */
export function validateRequest(schema: Record<string, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      if (rules.required && !value) {
        res.status(400).json({ error: `${field} is required` });
        return;
      }

      if (rules.type === 'email' && value && !validateEmail(value)) {
        res.status(400).json({ error: `${field} must be a valid email` });
        return;
      }

      if (rules.minLength && value.length < rules.minLength) {
        res.status(400).json({ 
          error: `${field} must be at least ${rules.minLength} characters` 
        });
        return;
      }
    }

    next();
  };
}
