import http from 'http';
import { app } from './app.js';
import { config } from './core/config.js';
import { logger } from './core/logger.js';

const server = http.createServer(app);

const serverInstance = server.listen(config.PORT, () => {
  logger.info(`🚀 SIET Navigate Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
  logger.info(`🔗 Health check available at http://localhost:${config.PORT}/health`);
  logger.info(`🔐 Auth API mounted at http://localhost:${config.PORT}/api/v1/auth`);
});

// Graceful Shutdown
function handleShutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  serverInstance.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export { server, serverInstance };
