import express, { type Express } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { type Server } from 'node:http';
import { authRoutes, userRoutes, delegationRoutes, userNotificationRoutes } from './api/index.js';
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
  app.use('/api/users', userNotificationRoutes);
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
  const shouldRunSeeds = options.runDatabaseSeeds ?? true;

  await connectDB(mongoUri);

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
