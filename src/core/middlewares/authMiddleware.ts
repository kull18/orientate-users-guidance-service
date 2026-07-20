import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface UserPayload {
  id: string;
  role: string;
  email?: string;
}

export interface RequestWithUser extends Request {
  user?: UserPayload;
}

export const authMiddleware = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'No authorization header provided' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Token format is Bearer <token>' });
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    // Support sub, user_id or id in payload
    const userId = decoded.sub || decoded.userId || decoded.id || decoded.user_id;
    const role = decoded.role;

    if (!userId || !role) {
      res.status(401).json({ error: 'Invalid token payload: missing userId or role' });
      return;
    }

    req.user = {
      id: userId,
      role: role.toUpperCase() // Force uppercase comparison
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: RequestWithUser, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const upperAllowed = allowedRoles.map(r => r.toUpperCase());
    if (!upperAllowed.includes(req.user.role)) {
      res.status(403).json({ error: 'Acceso denegado: permisos insuficientes.' });
      return;
    }

    next();
  };
};
