import 'dotenv/config';
import { type Server } from 'node:http';
import { DEFAULT_PORT, disconnectDB, startServer } from './app.js';
import { userEventsPublisher } from './services/index.js';

const port = Number(process.env.PORT) || DEFAULT_PORT;
let server: Server | null = null;

bootstrap().catch(function (error) {
  console.error('Failed to start users-service:', error);
  process.exit(1);
});

async function bootstrap() {
  server = await startServer({ port });

  console.log(`Server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`Users API: http://localhost:${port}/api/users`);
  console.log(`Auth API: http://localhost:${port}/api/auth`);
  console.log(`Delegations API: http://localhost:${port}/api/delegations`);
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
  await userEventsPublisher.disconnect();
  process.exit(0);
});
