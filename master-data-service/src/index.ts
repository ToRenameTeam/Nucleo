import 'dotenv/config';
import { type Server } from 'node:http';
import { DEFAULT_PORT, disconnectDB, startServer } from './app.js';

const port = Number(process.env.PORT) || DEFAULT_PORT;
let server: Server | null = null;

bootstrap().catch(function (error) {
  console.error('Failed to start master-data-service:', error);
  process.exit(1);
});

async function bootstrap() {
  server = await startServer({ port });

  console.log(`Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Service Catalog API: http://localhost:${port}/api/service-catalog`);
  console.log(`Facilities API: http://localhost:${port}/api/facilities`);
  console.log(`Medicines API: http://localhost:${port}/api/medicines`);
}

process.on('SIGINT', async function () {
  console.log('\nShutting down gracefully...');

  if (server) {
    await new Promise<void>(function (resolve, reject) {
      server?.close(function (error) {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  await disconnectDB();
  process.exit(0);
});
