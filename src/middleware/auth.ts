import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * JWT authentication middleware
 */
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    // Verify JWT token
    const decoded = await verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Auth failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Role-based authorization middleware
 */
export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

/**
 * Rate limiting middleware
 */
const requestCounts = new Map<string, number>();

export function rateLimit(maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const count = requestCounts.get(ip) || 0;

    if (count >= maxRequests) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    requestCounts.set(ip, count + 1);
    next();
  };
}

/**
 * Verify JWT token
 */
async function verifyToken(token: string) {
  // TODO: Implement actual JWT verification
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  return {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };
}
