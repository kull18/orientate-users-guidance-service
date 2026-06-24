import express, { Application } from 'express';
import studentRouter from './infrastructure/adapters/inputs/http/routes/studentRoutes';
import counselorRouter from './infrastructure/adapters/inputs/http/routes/counselorRoutes';
import { errorHandler } from './core/middlewares/errorHandler';

const app: Application = express();

// Middlewares
app.use(express.json());

// Routes
app.use('/api/v1/students', studentRouter);
app.use('/api/v1/counselors', counselorRouter);

// Base healthcheck route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'orientate-users-guidance-service' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
