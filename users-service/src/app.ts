import express, { type Express } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { type Server } from 'node:http';
import { authRoutes, userRoutes, delegationRoutes } from './api/index.js';
import { runSeeds } from './infrastructure/database/index.js';

export const DEFAULT_PORT = 3030;
export const DEFAULT_MONGO_URI = 'mongodb://localhost:27017/users_db';

export interface StartServerOptions {
  port?: number;
  mongoUri?: string;
  runDatabaseSeeds?: boolean;
}

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', function (_req, res) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'users-service',
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/delegations', delegationRoutes);

  return app;
}

export async function connectDB(mongoUri: string): Promise<void> {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
}

export async function startServer(options: StartServerOptions = {}): Promise<Server> {
  const app = createApp();
  const envPort = process.env.PORT ? Number(process.env.PORT) : undefined;
  const port = options.port ?? envPort ?? DEFAULT_PORT;
  const mongoUri = options.mongoUri ?? process.env.MONGO_URI ?? DEFAULT_MONGO_URI;
  const shouldRunSeeds =
    options.runDatabaseSeeds ??
    (process.env.RUN_DB_SEEDS ? process.env.RUN_DB_SEEDS === 'true' : true);

  await connectWithRetry(mongoUri);

  if (shouldRunSeeds) {
    await runSeeds();
  }

  return await new Promise<Server>(function (resolve, reject) {
    const server = app.listen(port, function () {
      resolve(server);
    });

    server.on('error', function (error) {
      reject(error);
    });
  });
}

async function connectWithRetry(mongoUri: string): Promise<void> {
  const maxAttempts = Number(process.env.DB_CONNECT_RETRIES ?? '10');
  const delayMs = Number(process.env.DB_CONNECT_RETRY_DELAY_MS ?? '2000');

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await connectDB(mongoUri);
      return;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt}/${maxAttempts} failed. Retrying in ${delayMs}ms...`,
        error
      );

      if (attempt === maxAttempts) {
        throw error;
      }

      await new Promise(function (resolve) {
        setTimeout(resolve, delayMs);
      });
    }
  }
}
