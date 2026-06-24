import app from './app';
import { env } from './core/config/env';
import { pool } from './core/database/pgPool';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`[Server]: Users & Guidance microservice running on port ${PORT}`);
});

const gracefulShutdown = () => {
  console.log('Cerrando el servidor de forma limpia...');
  server.close(async () => {
    console.log('Servidor HTTP cerrado.');
    try {
      await pool.end();
      console.log('Pool de conexiones a PostgreSQL cerrado.');
      process.exit(0);
    } catch (err) {
      console.error('Error cerrando el pool de la base de datos:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
