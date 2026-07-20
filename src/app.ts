import express, { Application } from 'express';
import helmet from 'helmet';
import studentRouter from './infrastructure/adapters/inputs/http/routes/studentRoutes';
import counselorRouter from './infrastructure/adapters/inputs/http/routes/counselorRoutes';
import alumniRouter from './infrastructure/adapters/inputs/http/routes/alumniRoutes';
import { errorHandler } from './core/middlewares/errorHandler';
import { corsMiddleware } from './core/middlewares/corsMiddleware';
import { apiLimiter } from './core/middlewares/rateLimitMiddleware';

const app: Application = express();

// Middlewares de Seguridad Globales
app.use(helmet());
app.use(corsMiddleware);

// Middlewares estándar
app.use(express.json());

// Aplicar Limitador de Tasa a las rutas /api/
app.use('/api', apiLimiter);

// Routes
app.use('/api/v1/students', studentRouter);
app.use('/api/v1/counselors', counselorRouter);
app.use('/api/v1', alumniRouter);

// Base healthcheck route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'orientate-users-guidance-service' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
