import { bootstrapSecrets } from './config/secrets.bootstrap.js';

/**
 * Boot order matters and is enforced here:
 *
 *   1. bootstrapSecrets() — resolves configuration from the host environment,
 *      Infisical and the .env files, then validates it. This is awaited because
 *      fetching from the secret manager is a network call.
 *   2. dynamic import of ./app.js — only now are the routers, database pool and
 *      services constructed, so they observe fully-populated configuration.
 *
 * Using a static `import app from './app.js'` here would hoist the app's imports
 * above step 1: the database pool would connect and the JWT / blob modules would
 * capture their constants before any configuration had been read.
 */
try {
  await bootstrapSecrets();

  const { default: app } = await import('./app.js');
  const { default: cacheService } = await import('./utils/cache.service.js');

  const PORT = process.env.PORT || process.env.APP_PORT || 5000;
  const nodeEnv = process.env.NODE_ENV || 'development';

  const server = app.listen(PORT, async () => {
    console.log(`🚀 Server is running on PORT: ${PORT}`);

    const cacheReady = await cacheService.initialize();
    if (!cacheReady && nodeEnv === 'production') {
      console.error('⚠️  Cache service failed to initialize (production requires a working cache)');
    }
  });

  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n${signal} received — shutting down`);
    await cacheService.close();
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
} catch (error) {
  console.error(`\n❌ Startup failed: ${error.message}\n`);
  process.exit(1);
}
