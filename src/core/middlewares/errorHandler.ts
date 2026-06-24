import { Request, Response, NextFunction } from 'express';
import { BusinessException } from '../../domain/exceptions/BusinessException';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if it's a domain business exception
  if (err instanceof BusinessException) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Handle DB constraint violations specifically if we catch Postgres errors directly
  const dbError = err as any;
  if (dbError.code && typeof dbError.code === 'string') {
    // 23505 = Unique violation
    if (dbError.code === '23505') {
      res.status(409).json({ error: 'La entidad con esos datos ya existe.' });
      return;
    }
    // 23503 = Foreign key violation
    if (dbError.code === '23503') {
      res.status(400).json({ error: 'Operación no válida debido a una restricción de relación externa.' });
      return;
    }
  }

  // Log other unexpected errors
  console.error('[Unhandled Error]:', err);

  res.status(500).json({
    error: 'Ocurrió un error interno en el servidor.'
  });
};
