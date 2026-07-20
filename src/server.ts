import app from './app';
import { env } from './core/config/env';
import { pool } from './core/database/pgPool';
import { eventBus } from './core/config/container';

const PORT = env.PORT;

// Subscribe to payment.approved event
eventBus.subscribe('payment.approved', async (event) => {
  console.log(`[EventBus] Recibido evento 'payment.approved' para el usuario: ${event.payload.userId}. Plan: ${event.payload.planType}`);
});

const server = app.listen(PORT, () => {
  console.log(`[Server]: Users & Guidance microservice running on port ${PORT}`);
});

const gracefulShutdown = () => {
  console.log('Cerrando el servidor de forma limpia...');
  server.close(async () => {
    console.log('Servidor HTTP cerrado.');
    try {
      await eventBus.close();
      console.log('Event Bus (Redis) cerrado de forma limpia.');
      await pool.end();
      console.log('Pool de conexiones a PostgreSQL cerrado.');
      process.exit(0);
    } catch (err) {
      console.error('Error cerrando recursos:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
